const express = require('express');
const router = express.Router();
const {
  createOrSendMessage,
  getChatById,
  getUserChats
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Get all chats for the logged in user
router.get('/', protect, getUserChats);

// Send message or start chat
router.post('/', protect, createOrSendMessage);

// Get chat by ID
router.get('/:id', protect, getChatById);

module.exports = router;
