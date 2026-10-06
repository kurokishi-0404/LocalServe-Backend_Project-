const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer creates booking
router.post('/', protect, authorize('customer'), createBooking);

// Authenticated users get their relevant bookings
router.get('/', protect, getBookings);

// Get single booking
router.get('/:id', protect, getBookingById);

// Update booking status (Customer cancel, Provider progress, Admin override)
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
