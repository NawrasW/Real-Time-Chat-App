import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('message', (message) => {
        io.emit('message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  } else {
    console.log('Socket.IO server already set up.');
  }
  res.end();
}
