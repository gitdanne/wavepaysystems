import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Импорт роутов
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import transfersRoutes from './routes/transfers.js';
import cardsRoutes from './routes/cards.js';
import depositsRoutes from './routes/deposits.js';
import cryptoRoutes from './routes/crypto.js';
import cashbackRoutes from './routes/cashback.js';
import creditsRoutes from './routes/credits.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/cashback', cashbackRoutes);
app.use('/api/credits', creditsRoutes);

// Раздача статики (React фронтенд) в production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  const clientPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Запуск сервера сразу (чтобы Render не убивал процесс из-за долгого подключения к БД)
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

// Подключение к БД
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wavepay')
  .then(() => {
    console.log('✅ Подключено к MongoDB');
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
  });
