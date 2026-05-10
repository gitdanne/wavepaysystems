import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/cashback — get cashback info
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    res.json({
      balance: user.cashbackBalance || 0,
      total: user.cashbackTotal || 0,
      history: (user.cashbackHistory || []).slice(0, 50),
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/cashback/withdraw — withdraw cashback to Electronic card
router.post('/withdraw', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const amount = user.cashbackBalance || 0;
    if (amount <= 0) return res.status(400).json({ error: 'Нет доступного кешбэка' });

    // Credit to Electronic card
    const electronic = user.cards.find(c => c.name === 'WaveCoin Electronic');
    if (!electronic) return res.status(400).json({ error: 'Электронная карта не найдена' });

    electronic.balance = (electronic.balance || 0) + amount;
    user.internalBalance = electronic.balance;
    user.cashbackBalance = 0;

    user.transactions.unshift({
      type: 'income',
      amount,
      name: 'Вывод кешбэка',
      date: new Date().toISOString(),
    });

    user.cashbackHistory.unshift({
      amount: -amount,
      source: 'Вывод на Electronic',
      date: new Date().toISOString(),
    });

    await user.save();
    res.json({ success: true, withdrawn: amount, user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
