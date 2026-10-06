const { admin, getFirebaseAuth, isFirebaseInitialized } = require('../services/firebaseService');

/**
 * Middleware to verify Firebase ID tokens
 * Expected Header: Authorization: Bearer <Firebase ID Token>
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: No Firebase ID token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!isFirebaseInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Firebase Admin authentication is not configured on this server'
      });
    }

    const auth = getFirebaseAuth ? getFirebaseAuth() : (admin && admin.auth ? admin.auth() : null);

    if (!auth) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Auth service instance is not available'
      });
    }

    // Verify Firebase ID token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);

    // Attach decoded Firebase user information to req.firebaseUser
    req.firebaseUser = decodedToken;

    next();
  } catch (error) {
    console.error('[Firebase Auth Error] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired Firebase ID token',
      error: error.message
    });
  }
};

module.exports = { verifyFirebaseToken };
