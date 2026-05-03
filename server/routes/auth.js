import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const defaultCryptoWallets = () => ({
  BTC: { balance: 0, rate: 68000, address: 'bc1q_' + Math.random().toString(36).substring(2, 8) },
  ETH: { balance: 0, rate: 3500, address: '0x' + Math.random().toString(36).substring(2, 8) },
  SOL: { balance: 0, rate: 150, address: 'sol_' + Math.random().toString(36).substring(2, 8) },
  BNB: { balance: 0, rate: 600, address: 'bnb_' + Math.random().toString(36).substring(2, 8) },
  ADA: { balance: 0, rate: 0.8, address: 'ada_' + Math.random().toString(36).substring(2, 8) },
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, iin } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Заполните все поля' });

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ error: 'Этот номер уже зарегистрирован' });

    const passwordHash = await bcrypt.hash(password, 10);
    const num = () => String(Math.floor(1000 + Math.random() * 9000));

    const user = await User.create({
      phone,
      passwordHash,
      iin: iin || '',
      name: 'New Client',
      internalBalance: 0,
      cards: [{ type: 'visa', name: 'WavePay Electronic', number: `4400 ${num()} ${num()} ${num()}`, typeName: 'Visa' }],
      deposits: [],
      transactions: [],
      cryptoWallets: defaultCryptoWallets(),
    });

    const token = generateToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Заполните все поля' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: 'Неверный логин или пароль' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Неверный логин или пароль' });

    const token = generateToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/pin/set
router.post('/pin/set', auth, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 4) return res.status(400).json({ error: 'ПИН должен быть 4 цифры' });

    await User.findByIdAndUpdate(req.userId, { pin });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/pin/verify
router.post('/pin/verify', auth, async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.pin === pin) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Неверный ПИН-код' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/auth/pin/status
router.get('/pin/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ hasPin: !!user.pin });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

export default router;
