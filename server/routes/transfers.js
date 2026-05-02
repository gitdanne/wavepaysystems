import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

const formatName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
  return parts[0];
};

// POST /api/transfers/internal — transfer to WavePay user
router.post('/internal', auth, async (req, res) => {
  try {
    const { identifier, amount } = req.body;
    if (!identifier || !amount || amount <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const sender = await User.findById(req.userId);
    if (!sender) return res.status(404).json({ error: 'Отправитель не найден' });
    if (sender.internalBalance < amount) return res.status(400).json({ error: 'Недостаточно средств' });

    // Find recipient by phone or card number
    const cleanQuery = identifier.replace(/[\s+()-]/g, '');
    let recipient = null;

    // Search by phone
    const allUsers = await User.find({ _id: { $ne: req.userId } });
    for (const u of allUsers) {
      const cleanPhone = u.phone.replace(/[\s+()-]/g, '');
      if (cleanPhone === cleanQuery) { recipient = u; break; }
      for (const card of u.cards) {
        const cleanCard = card.number.replace(/[\s-]/g, '');
        if (cleanCard === cleanQuery) { recipient = u; break; }
      }
      if (recipient) break;
    }

    if (!recipient) return res.status(404).json({ error: 'Пользователь не найден в системе WavePay' });

    const recipientName = formatName(recipient.name);

    // Debit sender
    sender.internalBalance -= amount;
    sender.transactions.unshift({
      type: 'expense', amount,
      name: `Перевод на ${recipientName} (${recipient.phone})`,
      date: new Date().toISOString(),
    });
    await sender.save();

    // Credit recipient
    recipient.internalBalance += amount;
    recipient.transactions.unshift({
      type: 'income', amount,
      name: `Перевод от ${sender.phone}`,
      date: new Date().toISOString(),
    });
    await recipient.save();

    res.json({ success: true, recipientName, balance: sender.internalBalance });
  } catch (err) {
    console.error('Internal transfer error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/transfers/external — transfer to external card
router.post('/external', auth, async (req, res) => {
  try {
    const { cardNumber, amount } = req.body;
    if (!cardNumber || !amount || amount <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 16) return res.status(400).json({ error: 'Некорректный номер карты' });

    // 0.01% commission, min 50 KZT
    const commission = Math.max(50, amount * 0.0001);
    const totalAmount = amount + commission;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.internalBalance < totalAmount) return res.status(400).json({ error: 'Недостаточно средств с учетом комиссии' });

    user.internalBalance -= totalAmount;
    user.transactions.unshift({
      type: 'expense',
      amount: totalAmount,
      name: `Перевод на карту ${cleanCard.slice(0, 4)}...${cleanCard.slice(-4)}`,
      date: new Date().toISOString(),
    });
    await user.save();

    res.json({ success: true, commission, balance: user.internalBalance });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/transfers/find — find recipient
router.get('/find', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ found: false });

    const cleanQuery = q.replace(/[\s+()-]/g, '');
    const allUsers = await User.find({ _id: { $ne: req.userId } });

    for (const u of allUsers) {
      const cleanPhone = u.phone.replace(/[\s+()-]/g, '');
      if (cleanPhone === cleanQuery) return res.json({ found: true, name: formatName(u.name) });
      for (const card of u.cards) {
        const cleanCard = card.number.replace(/[\s-]/g, '');
        if (cleanCard === cleanQuery) return res.json({ found: true, name: formatName(u.name) });
      }
    }

    res.json({ found: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
