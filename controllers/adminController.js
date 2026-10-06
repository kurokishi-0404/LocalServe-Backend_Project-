const User = require('../models/User');
const Service = require('../models/Service');
const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');

/**
 * @desc    Get all providers for admin management
 * @route   GET /api/admin/providers
 * @access  Private (Admin only)
 */
const getAdminProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Enhance provider list with service count
    const enhancedProviders = await Promise.all(
      providers.map(async (provider) => {
        const servicesCount = await Service.countDocuments({ provider: provider._id });
        const bookingsCount = await Booking.countDocuments({ provider: provider._id });
        return {
          ...provider.toObject(),
          servicesCount,
          bookingsCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enhancedProviders.length,
      data: enhancedProviders
    });
  } catch (error) {
    console.error('Error fetching admin providers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching providers',
      error: error.message
    });
  }
};

/**
 * @desc    Verify or unverify a service provider
 * @route   PUT /api/admin/verify/:id
 * @access  Private (Admin only)
 */
const verifyProvider = async (req, res) => {
  try {
    const { isVerified = true } = req.body;
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    provider.isVerified = Boolean(isVerified);
    await provider.save();

    return res.status(200).json({
      success: true,
      message: `Provider ${provider.isVerified ? 'verified' : 'unverified'} successfully`,
      data: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        isVerified: provider.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying provider:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying provider',
      error: error.message
    });
  }
};

/**
 * @desc    Get all disputes
 * @route   GET /api/admin/disputes
 * @access  Private (Admin only)
 */
const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('booking', 'status amount bookingDate address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching disputes',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new dispute for a booking
 * @route   POST /api/admin/disputes
 * @access  Private (Customer or Provider involved in booking)
 */
const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description } = req.body;

    if (!bookingId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId, reason, and description'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only raise disputes on your own bookings'
      });
    }

    const dispute = await Dispute.create({
      customer: booking.customer,
      provider: booking.provider,
      booking: booking._id,
      reason: reason.trim(),
      description: description.trim(),
      status: 'open'
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute filed successfully',
      data: dispute
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while filing dispute',
      error: error.message
    });
  }
};

/**
 * @desc    Resolve or update dispute status
 * @route   PUT /api/admin/disputes/:id
 * @access  Private (Admin only)
 */
const resolveDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const allowedStatuses = ['open', 'under_review', 'resolved', 'rejected'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid dispute status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    if (resolution !== undefined) {
      dispute.resolution = resolution.trim();
    }

    await dispute.save();

    return res.status(200).json({
      success: true,
      message: `Dispute marked as '${status}'`,
      data: dispute
    });
  } catch (error) {
    console.error('Error updating dispute:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating dispute',
      error: error.message
    });
  }
};

module.exports = {
  getAdminProviders,
  verifyProvider,
  getDisputes,
  createDispute,
  resolveDispute
};
