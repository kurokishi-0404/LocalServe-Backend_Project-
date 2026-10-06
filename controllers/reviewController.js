const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

/**
 * @desc    Create a review for a completed service/booking
 * @route   POST /api/reviews
 * @access  Private (Customer only)
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId, rating (1-5), and comment'
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Ensure customer owns the booking
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only review your own bookings'
      });
    }

    // Must be a completed booking to review
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot review a booking with status '${booking.status}'. Service must be completed first.`
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      service: booking.service,
      booking: booking._id,
      rating: numericRating,
      comment: comment.trim()
    });

    // Recalculate Service average rating and numReviews
    const serviceReviews = await Review.find({ service: booking.service });
    const serviceAvgRating =
      serviceReviews.reduce((sum, item) => sum + item.rating, 0) / serviceReviews.length;

    await Service.findByIdAndUpdate(booking.service, {
      rating: Number(serviceAvgRating.toFixed(1)),
      numReviews: serviceReviews.length
    });

    // Recalculate Provider average rating and numReviews across all their services
    const providerServices = await Service.find({ provider: booking.provider });
    const providerServiceIds = providerServices.map((s) => s._id);
    const allProviderReviews = await Review.find({ service: { $in: providerServiceIds } });

    if (allProviderReviews.length > 0) {
      const providerAvgRating =
        allProviderReviews.reduce((sum, item) => sum + item.rating, 0) / allProviderReviews.length;

      await User.findByIdAndUpdate(booking.provider, {
        rating: Number(providerAvgRating.toFixed(1)),
        numReviews: allProviderReviews.length
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name')
      .populate('service', 'title category');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews for a service
 * @route   GET /api/reviews/service/:id
 * @access  Public
 */
const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getServiceReviews
};
