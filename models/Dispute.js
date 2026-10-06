const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required']
    },
    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'under_review', 'resolved', 'rejected'],
        message: '{VALUE} is not a valid dispute status'
      },
      default: 'open'
    },
    resolution: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

disputeSchema.index({ booking: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
