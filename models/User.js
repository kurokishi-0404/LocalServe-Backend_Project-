const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'provider', 'admin'],
        message: '{VALUE} is not a valid role. Allowed: customer, provider, admin'
      },
      default: 'customer'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    },
    serviceCategories: {
      type: [String],
      default: []
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', userSchema);
