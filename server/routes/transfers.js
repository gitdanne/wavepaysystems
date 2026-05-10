import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { notifyUser } from '../socket.js';

const router = Router();

const formatName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
  return parts[0];
};

// POST /api/transfers/internal — transfer to WaveCoin user
router.post('/internal', auth, async (req, res) => {
  try {
    const { identifier, amount, fromCardIndex } = req.body;
    if (!identifier || !amount || amount <= 0 || fromCardIndex === undefined) return res.status(400).json({ error: 'Некорректные данные' });

    const sender = await User.findById(req.userId);
    if (!sender || !sender.cards[fromCardIndex]) return res.status(404).json({ error: 'Карта отправителя не найдена' });
    if ((sender.cards[fromCardIndex].balance || 0) < amount) return res.status(400).json({ error: 'Недостаточно средств на выбранной карте' });

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

    if (!recipient) return res.status(404).json({ error: 'Пользователь не найден в системе WaveCoin' });

    const recipientName = formatName(recipient.name);

    // Debit sender
    sender.cards[fromCardIndex].balance = (sender.cards[fromCardIndex].balance || 0) - amount;
    const senderElectronic = sender.cards.find(c => c.name === 'WaveCoin Electronic');
    sender.internalBalance = senderElectronic ? senderElectronic.balance : 0;
    sender.transactions.unshift({
      type: 'expense', amount,
      name: `Перевод на ${recipientName} (${recipient.phone})`,
      date: new Date().toISOString(),
    });

    // Cashback 0.5% on internal transfers
    const cashback = Math.round(amount * 0.005);
    if (cashback > 0) {
      sender.cashbackBalance = (sender.cashbackBalance || 0) + cashback;
      sender.cashbackTotal = (sender.cashbackTotal || 0) + cashback;
      if (!sender.cashbackHistory) sender.cashbackHistory = [];
      sender.cashbackHistory.unshift({ amount: cashback, source: `Перевод ${recipientName}`, date: new Date().toISOString() });
    }
    await sender.save();

    // Credit recipient (prefer Electronic Card)
    const recElectronic = recipient.cards.find(c => c.name === 'WaveCoin Electronic');
    if (recElectronic) {
      recElectronic.balance = (recElectronic.balance || 0) + amount;
      recipient.internalBalance = recElectronic.balance;
    } else if (recipient.cards.length > 0) {
      recipient.cards[0].balance = (recipient.cards[0].balance || 0) + amount;
      recipient.internalBalance = recipient.cards[0].balance;
    } else {
      recipient.internalBalance = (recipient.internalBalance || 0) + amount;
    }
    recipient.transactions.unshift({
      type: 'income', amount,
      name: `Перевод от ${sender.phone}`,
      date: new Date().toISOString(),
    });
    await recipient.save();

    // Notify recipient in real-time
    notifyUser(recipient._id, 'balance_update', {
      type: 'income',
      amount,
      sender: sender.phone,
      message: `Вам поступил перевод: +${amount} wcT`
    });

    res.json({ success: true, recipientName, balance: sender.internalBalance, user: sender });
  } catch (err) {
    console.error('Internal transfer error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/transfers/external — transfer to external card
router.post('/external', auth, async (req, res) => {
  try {
    const { cardNumber, amount, fromCardIndex } = req.body;
    if (!cardNumber || !amount || amount <= 0 || fromCardIndex === undefined) return res.status(400).json({ error: 'Некорректные данные' });

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 16) return res.status(400).json({ error: 'Некорректный номер карты' });

    // 0.01% commission, min 50 wcT
    const commission = Math.max(50, amount * 0.0001);
    const totalAmount = amount + commission;

    const user = await User.findById(req.userId);
    if (!user || !user.cards[fromCardIndex]) return res.status(404).json({ error: 'Карта не найдена' });
    if ((user.cards[fromCardIndex].balance || 0) < totalAmount) return res.status(400).json({ error: 'Недостаточно средств с учетом комиссии' });

    user.cards[fromCardIndex].balance = (user.cards[fromCardIndex].balance || 0) - totalAmount;
    const userElectronic = user.cards.find(c => c.name === 'WaveCoin Electronic');
    user.internalBalance = userElectronic ? userElectronic.balance : 0;
    user.transactions.unshift({
      type: 'expense',
      amount: totalAmount,
      name: `Перевод на карту ${cleanCard.slice(0, 4)}...${cleanCard.slice(-4)}`,
      date: new Date().toISOString(),
    });

    // Cashback 0.3% on external transfers
    const cashbackExt = Math.round(amount * 0.003);
    if (cashbackExt > 0) {
      user.cashbackBalance = (user.cashbackBalance || 0) + cashbackExt;
      user.cashbackTotal = (user.cashbackTotal || 0) + cashbackExt;
      if (!user.cashbackHistory) user.cashbackHistory = [];
      user.cashbackHistory.unshift({ amount: cashbackExt, source: `Внешний перевод *${cleanCard.slice(-4)}`, date: new Date().toISOString() });
    }
    await user.save();

    res.json({ success: true, commission, balance: user.internalBalance, user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/transfers/own — transfer between own cards
router.post('/own', auth, async (req, res) => {
  try {
    const { fromCardIndex, toCardIndex, amount } = req.body;
    if (fromCardIndex === undefined || toCardIndex === undefined || !amount || amount <= 0) return res.status(400).json({ error: 'Некорректные данные' });
    if (fromCardIndex === toCardIndex) return res.status(400).json({ error: 'Выберите разные карты' });

    const user = await User.findById(req.userId);
    if (!user || !user.cards[fromCardIndex] || !user.cards[toCardIndex]) return res.status(404).json({ error: 'Карта не найдена' });

    if ((user.cards[fromCardIndex].balance || 0) < amount) return res.status(400).json({ error: 'Недостаточно средств на выбранной карте' });

    user.cards[fromCardIndex].balance -= amount;
    user.cards[toCardIndex].balance += amount;

    const userElectronicOwn = user.cards.find(c => c.name === 'WaveCoin Electronic');
    user.internalBalance = userElectronicOwn ? userElectronicOwn.balance : 0;

    const fromName = user.cards[fromCardIndex].name;
    const toName = user.cards[toCardIndex].name;

    user.transactions.unshift({
      type: 'expense',
      amount,
      name: `Перевод между своими: с ${fromName} на ${toName}`,
      date: new Date().toISOString(),
    });

    await user.save();
    res.json({ success: true, balance: user.internalBalance, user });
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
