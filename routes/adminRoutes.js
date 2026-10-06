const express = require('express');
const router = express.Router();
const {
  getAdminProviders,
  verifyProvider,
  getDisputes,
  createDispute,
  resolveDispute
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Provider list for admin
router.get('/providers', protect, authorize('admin'), getAdminProviders);

// Verify/unverify provider
router.put('/verify/:id', protect, authorize('admin'), verifyProvider);

// Admin dispute management
router.get('/disputes', protect, authorize('admin'), getDisputes);
router.put('/disputes/:id', protect, authorize('admin'), resolveDispute);

// Create dispute on a booking (Customer, Provider, or Admin)
router.post('/disputes', protect, createDispute);

module.exports = router;
