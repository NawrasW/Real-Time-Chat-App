// src/pages/api/socket.ts
import { Server } from 'socket.io';

let io;
const userSocketMap = new Map(); // Maps userId to socketId

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');

    // Dynamically set the origin based on the environment (development vs production)
    const origin =
      process.env.NODE_ENV === 'production'
        ? 'https://real-time-chat-app-eta-eight.vercel.app/'  // production domain
        : 'http://localhost:3000';  // Local development

    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: origin,
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('register', (userId) => {
        userSocketMap.set(userId, socket.id);
        io.emit('userStatus', { userId, status: 'online' });
        console.log(`User ${userId} registered with socket ${socket.id}`);
      });

      socket.on('message', (message) => {
        io.emit('message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const userId = Array.from(userSocketMap.entries()).find(([_, id]) => id === socket.id)?.[0];
        if (userId) {
          userSocketMap.delete(userId);
          io.emit('userStatus', { userId, status: 'offline' });
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  } else {
    console.log('Socket.IO server already set up.');
  }
  res.end();
}
