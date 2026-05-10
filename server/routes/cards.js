import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/cards/add — add a new card
router.post('/add', auth, async (req, res) => {
  try {
    const { cardType, cardName, typeName } = req.body;
    if (!cardType || !cardName || !typeName) {
      return res.status(400).json({ error: 'Не все данные для карты предоставлены' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const num = () => String(Math.floor(1000 + Math.random() * 9000));
    const prefix = cardType === 'mastercard' ? '5500' : '4400';
    
    const newCard = {
      type: cardType,
      name: cardName,
      number: `${prefix} ${num()} ${num()} ${num()}`,
      typeName
    };

    user.cards.push(newCard);
    await user.save();

    // The newly added card will be the last one in the array
    const addedCard = user.cards[user.cards.length - 1];
    res.json({ success: true, card: addedCard });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/cards/settings
router.post('/settings', auth, async (req, res) => {
  try {
    const { cardIndex, settings } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user || !user.cards || !user.cards[cardIndex]) {
      return res.status(404).json({ error: 'Карта не найдена' });
    }

    if (settings.defaultCrypto !== undefined) {
      user.cards[cardIndex].defaultCrypto = settings.defaultCrypto;
    }

    await user.save();
    res.json({ success: true, cards: user.cards });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/cards/close
router.post('/close', auth, async (req, res) => {
  try {
    const { cardIndex } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user || !user.cards || !user.cards[cardIndex]) {
      return res.status(404).json({ error: 'Карта не найдена' });
    }

    const cardToClose = user.cards[cardIndex];
    if (cardToClose.name === 'WaveCoin Electronic') {
      return res.status(400).json({ error: 'Нельзя закрыть основную карту' });
    }

    // Transfer remaining balance to WaveCoin Electronic
    const electronicCardIndex = user.cards.findIndex(c => c.name === 'WaveCoin Electronic');
    if (electronicCardIndex !== -1 && cardToClose.balance > 0) {
      user.cards[electronicCardIndex].balance += cardToClose.balance;
      
      user.transactions.unshift({
        type: 'income',
        amount: cardToClose.balance,
        name: `Перевод остатка с закрытой карты ${cardToClose.name}`,
        date: new Date().toISOString(),
      });
    }

    // Remove the card
    user.cards.splice(cardIndex, 1);
    
    // Recalculate internal balance
    const electronicCard = user.cards.find(c => c.name === 'WaveCoin Electronic');
    user.internalBalance = electronicCard ? electronicCard.balance : 0;
    
    await user.save();
    res.json({ success: true, cards: user.cards });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
