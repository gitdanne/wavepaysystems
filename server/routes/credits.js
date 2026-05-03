import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/credits — list credits
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ credits: user.credits || [] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/credits/apply — apply for credit
router.post('/apply', auth, async (req, res) => {
  try {
    const { amount, term } = req.body;
    if (!amount || !term || amount <= 0 || term <= 0) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }
    if (amount > 5000000) {
      return res.status(400).json({ error: 'Максимальная сумма — 5 000 000 ₸' });
    }
    if (term > 60) {
      return res.status(400).json({ error: 'Максимальный срок — 60 месяцев' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Check max 3 active credits
    const activeCredits = (user.credits || []).filter(c => c.status === 'active');
    if (activeCredits.length >= 3) {
      return res.status(400).json({ error: 'Максимум 3 активных кредита' });
    }

    // Calculate monthly payment (annuity formula)
    const annualRate = 18;
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = Math.round(
      amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
    );
    const totalPayment = monthlyPayment * term;

    const credit = {
      amount,
      remainingAmount: totalPayment,
      monthlyPayment,
      interestRate: annualRate,
      term,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    user.credits.push(credit);

    // Credit amount to Electronic card
    const electronic = user.cards.find(c => c.name === 'WavePay Electronic');
    if (electronic) {
      electronic.balance = (electronic.balance || 0) + amount;
      user.internalBalance = electronic.balance;
    }

    user.transactions.unshift({
      type: 'income',
      amount,
      name: `Кредит одобрен: ${amount.toLocaleString()} ₸ на ${term} мес`,
      date: new Date().toISOString(),
    });

    await user.save();
    res.json({ success: true, credit: user.credits[user.credits.length - 1], user });
  } catch (err) {
    console.error('Credit apply error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/credits/pay — make a payment on credit
router.post('/pay', auth, async (req, res) => {
  try {
    const { creditId, amount, fromCardIndex } = req.body;
    if (!creditId || !amount || amount <= 0 || fromCardIndex === undefined) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const credit = user.credits.id(creditId);
    if (!credit || credit.status !== 'active') {
      return res.status(404).json({ error: 'Кредит не найден или уже погашен' });
    }

    const card = user.cards[fromCardIndex];
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });
    if ((card.balance || 0) < amount) {
      return res.status(400).json({ error: 'Недостаточно средств' });
    }

    // Pay
    const payAmount = Math.min(amount, credit.remainingAmount);
    card.balance -= payAmount;
    credit.remainingAmount -= payAmount;

    if (credit.remainingAmount <= 0) {
      credit.remainingAmount = 0;
      credit.status = 'paid';
    }

    const elCard = user.cards.find(c => c.name === 'WavePay Electronic');
    user.internalBalance = elCard ? elCard.balance : 0;

    user.transactions.unshift({
      type: 'expense',
      amount: payAmount,
      name: `Оплата кредита (${credit.amount.toLocaleString()} ₸)`,
      date: new Date().toISOString(),
    });

    await user.save();
    res.json({ success: true, credit, user });
  } catch (err) {
    console.error('Credit pay error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
