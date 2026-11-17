const { Server } = require('socket.io');

const connectedUsers = new Map();

let ioInstance = null;

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} joined with socket ${socket.id}`);
      }
    });

    socket.on('leave', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} left`);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

const emitToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

const getConnectedUsers = () => connectedUsers;

module.exports = { initSocket, getIO, emitToUser, getConnectedUsers };
