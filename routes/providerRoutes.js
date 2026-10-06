const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderById,
  updateProvider
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProviders);
router.get('/:id', getProviderById);

// Provider updates own profile or Admin updates provider
router.put('/:id', protect, authorize('provider', 'admin'), updateProvider);

module.exports = router;
