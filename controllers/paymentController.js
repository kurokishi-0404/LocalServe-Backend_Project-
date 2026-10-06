const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

/**
 * @desc    Record a payment for a booking
 * @route   POST /api/payments
 * @access  Private (Customer or Admin)
 */
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, status } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Ensure customer owns booking or user is admin
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only pay for your own booking'
      });
    }

    const paymentAmount = amount !== undefined ? Number(amount) : booking.amount;
    const paymentStatus = status || 'paid';
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      amount: paymentAmount,
      status: paymentStatus,
      paymentMethod: paymentMethod || 'card',
      transactionId
    });

    // Update payment status on booking if paid
    if (paymentStatus === 'paid') {
      booking.paymentStatus = 'paid';
      await booking.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while recording payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment records by booking ID
 * @route   GET /api/payments/booking/:id
 * @access  Private (Participants or Admin)
 */
const getPaymentsByBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Not authorized to view payments for this booking'
      });
    }

    const payments = await Payment.find({ booking: booking._id })
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching payment details',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  getPaymentsByBooking
};
