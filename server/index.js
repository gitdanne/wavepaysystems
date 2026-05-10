import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { initSocket } from './socket.js';

// Импорт роутов
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import transfersRoutes from './routes/transfers.js';
import depositsRoutes from './routes/deposits.js';
import cryptoRoutes from './routes/crypto.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/crypto', cryptoRoutes);

// Раздача статики (React фронтенд) в production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  const clientPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Подключение к БД
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WaveCoin')
  .then(() => {
    console.log('✅ Подключено к MongoDB');
    // Запуск сервера после подключения к БД или сразу (как было раньше)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT} (с поддержкой WebSockets)`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    // Даже если БД не подключена, запустим сервер, чтобы Render не ругался
    httpServer.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT} (БД не подключена)`);
    });
  });
