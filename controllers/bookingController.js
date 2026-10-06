const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { emitSocketEvent } = require('../socket/socketHandler');
const { sendBookingNotification } = require('../services/firebaseService');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer only)
 */
const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, address, notes } = req.body;

    if (!serviceId || !bookingDate || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId, bookingDate, and service address'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      provider: service.provider,
      service: service._id,
      bookingDate: new Date(bookingDate),
      amount: service.price,
      status: 'pending',
      address: address.trim(),
      notes: notes ? notes.trim() : ''
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title category price location');

    // Emit real-time Socket.io event for the provider and globally
    emitSocketEvent('booking:created', populatedBooking, `user_${service.provider}`);
    emitSocketEvent('booking:created', populatedBooking);

    // Trigger Notification for the provider
    await sendBookingNotification({
      token: 'provider_device_fcm_token',
      title: 'New Booking Request',
      body: `You received a new booking request for ${service.title}`,
      data: {
        bookingId: booking._id.toString(),
        type: 'booking_created'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get bookings (role-filtered: customer sees own, provider sees own, admin sees all)
 * @route   GET /api/bookings
 * @access  Private (All authenticated roles)
 */
const getBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    }
    // Admin sees all

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone rating isVerified')
      .populate('service', 'title category price location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Participants or Admin)
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone rating isVerified')
      .populate('service', 'title category price location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
      error: error.message
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Customer can cancel, Provider updates progress, Admin overrides)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'rejected'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title price')
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Not authorized to modify this booking'
      });
    }

    // Role-specific transition rules
    if (isCustomer && !isAdmin) {
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Customers can only cancel a booking'
        });
      }
      if (booking.status === 'completed' || booking.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel a booking that is already ${booking.status}`
        });
      }
    }

    if (isProvider && !isAdmin) {
      const providerAllowedTransitions = {
        pending: ['confirmed', 'rejected'],
        confirmed: ['in_progress', 'cancelled'],
        in_progress: ['completed']
      };

      const validNextStates = providerAllowedTransitions[booking.status] || [];
      if (!validNextStates.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${booking.status}' to '${status}' for provider`
        });
      }
    }

    booking.status = status;
    await booking.save();

    // Real-time Socket.io notification
    const eventPayload = {
      bookingId: booking._id,
      status: booking.status,
      updatedAt: booking.updatedAt
    };

    emitSocketEvent('booking:status', eventPayload, `user_${booking.customer._id}`);
    emitSocketEvent('booking:status', eventPayload, `user_${booking.provider._id}`);
    emitSocketEvent('booking:status', eventPayload, `booking_${booking._id}`);
    emitSocketEvent('booking:updated', booking);

    // Send Firebase Confirmation Notification when confirmed
    if (status === 'confirmed') {
      await sendBookingNotification({
        token: 'customer_device_fcm_token',
        title: 'Booking Confirmed!',
        body: `Your booking for "${booking.service.title}" has been confirmed by ${booking.provider.name}.`,
        data: {
          bookingId: booking._id.toString(),
          status: 'confirmed'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}' successfully`,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating booking status',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
};
