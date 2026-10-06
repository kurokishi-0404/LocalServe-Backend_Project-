const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Send notification
router.post('/send', protect, sendNotification);

module.exports = router;
