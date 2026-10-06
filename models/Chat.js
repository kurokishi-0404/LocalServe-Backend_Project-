const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required']
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        message: {
          type: String,
          required: [true, 'Message text is required'],
          trim: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

chatSchema.index({ customer: 1, provider: 1 });
chatSchema.index({ booking: 1 });

module.exports = mongoose.model('Chat', chatSchema);
