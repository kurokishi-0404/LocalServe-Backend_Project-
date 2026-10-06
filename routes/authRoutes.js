const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getFirebaseProfile
} = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/firebaseAuthMiddleware');

// Existing JWT authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Firebase Authentication demonstration route
router.get('/firebase-profile', verifyFirebaseToken, getFirebaseProfile);

module.exports = router;
