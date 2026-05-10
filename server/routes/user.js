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

// POST /api/user/topup — top up specific card balance
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, cardIndex } = req.body;
    if (!amount || amount <= 0 || cardIndex === undefined) return res.status(400).json({ error: 'Некорректная сумма или не выбрана карта' });

    const user = await User.findById(req.userId);
    if (!user.cards[cardIndex]) return res.status(404).json({ error: 'Карта не найдена' });

    user.cards[cardIndex].balance = (user.cards[cardIndex].balance || 0) + amount;
    
    // Update global cache balance
    const electronicCard = user.cards.find(c => c.name === 'WaveCoin Electronic');
    user.internalBalance = electronicCard ? electronicCard.balance : 0;

    user.transactions.unshift({
      type: 'income',
      amount,
      name: `Пополнение карты ${user.cards[cardIndex].typeName}`,
      date: new Date().toISOString(),
    });
    await user.save();

    res.json({ success: true, balance: user.internalBalance, user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
