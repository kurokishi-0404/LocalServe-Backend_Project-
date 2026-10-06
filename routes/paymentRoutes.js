const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentsByBooking
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Record payment (Customer or Admin)
router.post('/', protect, createPayment);

// Get payment records by booking ID (Participants or Admin)
router.get('/booking/:id', protect, getPaymentsByBooking);

module.exports = router;
