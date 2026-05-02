import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

const fiatRateToUsd = 450; // KZT to USD

// POST /api/crypto/buy
router.post('/buy', auth, async (req, res) => {
  try {
    const { coin, fiatAmount } = req.body;
    if (!coin || !fiatAmount || fiatAmount <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const user = await User.findById(req.userId);
    if (user.internalBalance < fiatAmount) return res.status(400).json({ error: 'Недостаточно средств' });
    
    if (!user.cryptoWallets || !user.cryptoWallets[coin]) {
      return res.status(400).json({ error: 'Неизвестная криптовалюта' });
    }

    const usdAmount = fiatAmount / fiatRateToUsd;
    const coinRate = user.cryptoWallets[coin].rate;
    const coinAmountNet = usdAmount / coinRate;
    const fee = coinAmountNet * 0.0014;
    const coinAmountReceived = coinAmountNet - fee;

    user.internalBalance -= fiatAmount;
    user.cryptoWallets[coin].balance += coinAmountReceived;
    
    user.transactions.unshift({
      type: 'expense',
      amount: fiatAmount,
      name: `Покупка ${coin}`,
      date: new Date().toISOString()
    });

    await user.save();
    res.json({ success: true, balance: user.internalBalance, cryptoWallets: user.cryptoWallets });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/crypto/sell
router.post('/sell', auth, async (req, res) => {
  try {
    const { coin, coinAmount } = req.body;
    if (!coin || !coinAmount || coinAmount <= 0) return res.status(400).json({ error: 'Некорректные данные' });

    const user = await User.findById(req.userId);
    if (!user.cryptoWallets || !user.cryptoWallets[coin]) {
      return res.status(400).json({ error: 'Неизвестная криптовалюта' });
    }

    if (user.cryptoWallets[coin].balance < coinAmount) return res.status(400).json({ error: 'Недостаточно криптовалюты' });

    const coinRate = user.cryptoWallets[coin].rate;
    const usdAmountNet = coinAmount * coinRate;
    const fiatAmountNet = usdAmountNet * fiatRateToUsd;
    const fee = fiatAmountNet * 0.0014;
    const fiatReceived = fiatAmountNet - fee;

    user.cryptoWallets[coin].balance -= coinAmount;
    user.internalBalance += fiatReceived;

    user.transactions.unshift({
      type: 'income',
      amount: fiatReceived,
      name: `Продажа ${coin}`,
      date: new Date().toISOString()
    });

    await user.save();
    res.json({ success: true, balance: user.internalBalance, cryptoWallets: user.cryptoWallets });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
