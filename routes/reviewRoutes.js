const express = require('express');
const router = express.Router();
const {
  createReview,
  getServiceReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer submits review for completed booking
router.post('/', protect, authorize('customer'), createReview);

// Public gets reviews for a service
router.get('/service/:id', getServiceReviews);

module.exports = router;
