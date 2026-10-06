const dotenv = require('dotenv');
// Load environment variables immediately before any other module is imported
dotenv.config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const geolocationRoutes = require('./routes/geolocationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Connect to MongoDB Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Built-in & Third-party Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Route
app.get('/', (req, res) => {
  res.send('LocalServe API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP Server & Initialize Socket.io
const server = http.createServer(app);
initSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`LocalServe server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(
      'Tip: On macOS, AirPlay Receiver uses port 5000 by default. You can disable it in System Settings > General > AirDrop & AirPlay, or update PORT in .env.'
    );
  } else {
    console.error('Server error:', err);
  }
});

module.exports = { app, server };
