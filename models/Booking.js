const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date/time is required']
    },
    amount: {
      type: Number,
      required: [true, 'Booking amount is required'],
      min: [0, 'Amount must be a positive number']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
        message: '{VALUE} is not a valid status. Allowed: pending, confirmed, in_progress, completed, cancelled, rejected'
      },
      default: 'pending'
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup by user and provider
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ service: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
