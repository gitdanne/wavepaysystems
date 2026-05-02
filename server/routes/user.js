import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/user — get current user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/user/topup — top up balance
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Некорректная сумма' });

    const user = await User.findById(req.userId);
    user.internalBalance += amount;
    user.transactions.unshift({
      type: 'income',
      amount,
      name: 'Пополнение счёта',
      date: new Date().toISOString(),
    });
    await user.save();

    res.json({ success: true, balance: user.internalBalance });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
