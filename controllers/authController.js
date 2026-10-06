const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (Customer or Provider)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    // 1. Validate required inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role if specified
    const allowedRoles = ['customer', 'provider', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}`
      });
    }

    // 2. Check if user with given email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // 3. Hash password using bcrypt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: role || 'customer',
      location: location ? location.trim() : ''
    });

    // 5. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 6. Return response (excluding password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare submitted password with hashed password in database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 5. Return token and user info (excluding password)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get authenticated Firebase user profile
 * @route   GET /api/auth/firebase-profile
 * @access  Private (Firebase ID token required)
 */
const getFirebaseProfile = async (req, res) => {
  try {
    const { uid, email, email_verified, name, picture, auth_time } = req.firebaseUser;

    return res.status(200).json({
      success: true,
      message: 'Firebase ID token verified successfully',
      firebaseUser: {
        uid,
        email: email || '',
        email_verified: Boolean(email_verified),
        name: name || '',
        picture: picture || '',
        auth_time
      }
    });
  } catch (error) {
    console.error('Error in getFirebaseProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving Firebase profile',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getFirebaseProfile
};
