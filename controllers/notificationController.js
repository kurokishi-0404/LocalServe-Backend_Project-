const { sendBookingNotification } = require('../services/firebaseService');

/**
 * @desc    Send push notification (Firebase FCM / Mock fallback)
 * @route   POST /api/notifications/send
 * @access  Private (Authenticated users)
 */
const sendNotification = async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification title and body'
      });
    }

    const result = await sendBookingNotification({
      token: token || 'test_device_token',
      title: title.trim(),
      body: body.trim(),
      data: data || {}
    });

    return res.status(200).json({
      success: true,
      message: 'Notification processed successfully',
      result
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending notification',
      error: error.message
    });
  }
};

module.exports = {
  sendNotification
};
