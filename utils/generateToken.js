const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT containing user ID and role
 * @param {string} userId - The MongoDB ObjectId of the user
 * @param {string} role - The role of the user ('customer', 'provider', 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
