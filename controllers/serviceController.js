const Service = require('../models/Service');

/**
 * @desc    Get all services with optional filters (category, search, location, price)
 * @route   GET /api/services
 * @access  Public
 */
const getServices = async (req, res) => {
  try {
    const { category, search, location, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query)
      .populate('provider', 'name email phone location rating numReviews isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching services',
      error: error.message
    });
  }
};

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'provider',
      'name email phone location bio rating numReviews isVerified'
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching service',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private (Provider only)
 */
const createService = async (req, res) => {
  try {
    const { title, description, category, price, availability, location, latitude, longitude } =
      req.body;

    if (!title || !description || !category || price === undefined || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, price, and location'
      });
    }

    const service = await Service.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      provider: req.user._id,
      price: Number(price),
      availability: availability || 'Available',
      location: location.trim(),
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating service',
      error: error.message
    });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Owning Provider or Admin)
 */
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership if not admin
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own service'
      });
    }

    const { title, description, category, price, availability, location, latitude, longitude } =
      req.body;

    if (title) service.title = title.trim();
    if (description) service.description = description.trim();
    if (category) service.category = category.trim();
    if (price !== undefined) service.price = Number(price);
    if (availability) service.availability = availability.trim();
    if (location) service.location = location.trim();
    if (latitude !== undefined) service.latitude = Number(latitude);
    if (longitude !== undefined) service.longitude = Number(longitude);

    const updatedService = await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating service',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private (Owning Provider or Admin)
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership if not admin
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own service'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting service',
      error: error.message
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
