const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 * @param {object} httpServer - Node.js HTTP server
 * @returns {object} io instance
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for specific user (e.g. user_<userId>)
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
      }
    });

    // Join room for specific booking (e.g. booking_<bookingId>)
    socket.on('join_booking', (bookingId) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined booking_${bookingId}`);
      }
    });

    // Real-time chat message relay
    socket.on('send_message', (data) => {
      if (data && data.chatId) {
        socket.to(`chat_${data.chatId}`).emit('chat:message', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.io instance
 */
const getIO = () => {
  return io;
};

/**
 * Helper to emit events safely from controllers
 * @param {string} event - Event name (e.g. 'booking:created')
 * @param {object} data - Event payload
 * @param {string} [room] - Optional target room
 */
const emitSocketEvent = (event, data, room = null) => {
  if (!io) {
    return;
  }
  try {
    if (room) {
      io.to(room).emit(event, data);
    } else {
      io.emit(event, data);
    }
  } catch (err) {
    console.error(`[Socket.io] Error emitting event ${event}:`, err.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitSocketEvent
};
