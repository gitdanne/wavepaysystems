import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/deposits/create
router.post('/create', auth, async (req, res) => {
  try {
    const { name, target } = req.body;
    if (!name || !target || target <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const user = await User.findById(req.userId);
    user.deposits.push({ name, target, current: 0 });
    await user.save();

    res.json({ success: true, deposits: user.deposits });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/deposits/topup
router.post('/topup', auth, async (req, res) => {
  try {
    const { id, amount } = req.body;
    if (!id || !amount || amount <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const user = await User.findById(req.userId);
    if (user.internalBalance < amount) return res.status(400).json({ error: 'Недостаточно средств' });

    const deposit = user.deposits.id(id);
    if (!deposit) return res.status(404).json({ error: 'Сбережение не найдено' });

    user.internalBalance -= amount;
    deposit.current += amount;
    user.transactions.unshift({
      type: 'expense',
      amount,
      name: `Копилка: Пополнение (${deposit.name})`,
      date: new Date().toISOString()
    });

    await user.save();
    res.json({ success: true, balance: user.internalBalance, deposits: user.deposits });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/deposits/withdraw
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Не указан ID' });

    const user = await User.findById(req.userId);
    const deposit = user.deposits.id(id);
    if (!deposit) return res.status(404).json({ error: 'Сбережение не найдено' });

    if (deposit.current < deposit.target) {
      return res.status(400).json({ error: 'Цель не достигнута' });
    }

    const amount = deposit.current;
    user.internalBalance += amount;
    user.deposits.pull({ _id: id });
    user.transactions.unshift({
      type: 'income',
      amount,
      name: `Копилка: Снятие средств (${deposit.name})`,
      date: new Date().toISOString()
    });

    await user.save();
    res.json({ success: true, balance: user.internalBalance, deposits: user.deposits });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
