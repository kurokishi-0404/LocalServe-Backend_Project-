const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required']
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount must be positive']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'paid'
    },
    paymentMethod: {
      type: String,
      default: 'card',
      trim: true
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
