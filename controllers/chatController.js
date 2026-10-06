const Chat = require('../models/Chat');
const User = require('../models/User');
const { emitSocketEvent } = require('../socket/socketHandler');

/**
 * @desc    Start conversation or send message
 * @route   POST /api/chats
 * @access  Private (Authenticated users)
 */
const createOrSendMessage = async (req, res) => {
  try {
    const { chatId, recipientId, bookingId, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    let chat = null;

    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat conversation not found'
        });
      }
    } else if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient user not found'
        });
      }

      // Check if conversation already exists between these two users
      chat = await Chat.findOne({
        $or: [
          { customer: req.user._id, provider: recipientId },
          { customer: recipientId, provider: req.user._id }
        ]
      });

      if (!chat) {
        // Create new chat
        const isCustomer = req.user.role === 'customer';
        chat = new Chat({
          customer: isCustomer ? req.user._id : recipientId,
          provider: isCustomer ? recipientId : req.user._id,
          booking: bookingId || null,
          messages: []
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either chatId or recipientId'
      });
    }

    const newMessage = {
      sender: req.user._id,
      message: message.trim(),
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    if (bookingId && !chat.booking) {
      chat.booking = bookingId;
    }

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('customer', 'name email role')
      .populate('provider', 'name email role')
      .populate('messages.sender', 'name role');

    // Notify other participant via Socket.io
    const recipientIdTarget =
      chat.customer.toString() === req.user._id.toString()
        ? chat.provider.toString()
        : chat.customer.toString();

    emitSocketEvent(
      'chat:message',
      {
        chatId: chat._id,
        message: newMessage,
        senderId: req.user._id
      },
      `user_${recipientIdTarget}`
    );

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedChat
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
};

/**
 * @desc    Get chat conversation by ID
 * @route   GET /api/chats/:id
 * @access  Private (Participants or Admin)
 */
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('provider', 'name email role')
      .populate('messages.sender', 'name role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    const isCustomer = chat.customer._id.toString() === req.user._id.toString();
    const isProvider = chat.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a participant in this conversation'
      });
    }

    return res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chat',
      error: error.message
    });
  }
};

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/chats
 * @access  Private (Authenticated users)
 */
const getUserChats = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : {
          $or: [{ customer: req.user._id }, { provider: req.user._id }]
        };

    const chats = await Chat.find(filter)
      .populate('customer', 'name email role')
      .populate('provider', 'name email role')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user chats',
      error: error.message
    });
  }
};

module.exports = {
  createOrSendMessage,
  getChatById,
  getUserChats
};
