const User = require('../models/User');
const Service = require('../models/Service');

/**
 * @desc    Get all providers with optional filters (category, location, verified)
 * @route   GET /api/providers
 * @access  Public
 */
const getProviders = async (req, res) => {
  try {
    const { category, location, verified } = req.query;
    const query = { role: 'provider' };

    if (category) {
      query.serviceCategories = { $regex: new RegExp(category, 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    const providers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching providers',
      error: error.message
    });
  }
};

/**
 * @desc    Get provider profile by ID with their listed services
 * @route   GET /api/providers/:id
 * @access  Public
 */
const getProviderById = async (req, res) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' }).select(
      '-password'
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Also get the services offered by this provider
    const services = await Service.find({ provider: provider._id });

    return res.status(200).json({
      success: true,
      data: {
        provider,
        services
      }
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching provider details',
      error: error.message
    });
  }
};

/**
 * @desc    Update provider profile
 * @route   PUT /api/providers/:id
 * @access  Private (Provider themselves or Admin)
 */
const updateProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check ownership or admin role
    const isOwner = provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own provider profile'
      });
    }

    const { name, phone, location, bio, serviceCategories, isVerified } = req.body;

    if (name) provider.name = name.trim();
    if (phone !== undefined) provider.phone = phone.trim();
    if (location !== undefined) provider.location = location.trim();
    if (bio !== undefined) provider.bio = bio.trim();
    if (serviceCategories !== undefined) {
      provider.serviceCategories = Array.isArray(serviceCategories)
        ? serviceCategories
        : [serviceCategories];
    }

    // Only Admin can verify/unverify via provider update
    if (isAdmin && isVerified !== undefined) {
      provider.isVerified = Boolean(isVerified);
    }

    await provider.save();

    const updatedProvider = await User.findById(provider._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      data: updatedProvider
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating provider profile',
      error: error.message
    });
  }
};

module.exports = {
  getProviders,
  getProviderById,
  updateProvider
};
