const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Provider only route
router.post('/', protect, authorize('provider'), createService);

// Provider (owner) or Admin routes
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
