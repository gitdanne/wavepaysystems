import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const userSockets = new Map(); // userId -> Set(socketId)

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId} (Socket: ${socket.id})`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

export const notifyUser = (userId, event, data) => {
  if (io && userSockets.has(userId.toString())) {
    const sockets = userSockets.get(userId.toString());
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
    return true;
  }
  return false;
};

export const getIO = () => io;
