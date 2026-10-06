// Ensure environment variables are loaded
require('dotenv').config();

let admin = null;
let getMessaging = null;
let getAuth = null;
let authInstance = null;
let isFirebaseInitialized = false;

try {
  admin = require('firebase-admin');
  try {
    getMessaging = require('firebase-admin/messaging').getMessaging;
  } catch (err) {
    // Modular messaging fallback
  }

  try {
    getAuth = require('firebase-admin/auth').getAuth;
  } catch (err) {
    // Modular auth fallback
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    let formattedKey = privateKey.trim();

    // Strip surrounding matching double or single quotes if present
    if (
      (formattedKey.startsWith('"') && formattedKey.endsWith('"')) ||
      (formattedKey.startsWith("'") && formattedKey.endsWith("'"))
    ) {
      formattedKey = formattedKey.slice(1, -1);
    }

    // Convert literal escaped newlines to real newline characters
    formattedKey = formattedKey.replace(/\\n/g, '\n');

    let app = null;
    // Prevent duplicate initialization on nodemon reloads
    if (!admin.getApps || admin.getApps().length === 0) {
      app = admin.initializeApp({
        credential: admin.cert({
          projectId: projectId.trim(),
          clientEmail: clientEmail.trim(),
          privateKey: formattedKey
        })
      });
    } else {
      app = admin.getApp();
    }

    if (getAuth && app) {
      authInstance = getAuth(app);
      admin.auth = () => authInstance;
    }

    isFirebaseInitialized = true;
    console.log('[Firebase] Firebase Admin (Auth & FCM) initialized successfully.');
  } else {
    console.log(
      '[Firebase] Credentials not detected in environment variables. Falling back to Mock Notification mode.'
    );
  }
} catch (err) {
  console.warn(
    `[Firebase] Could not initialize Firebase Admin: ${err.message}. Operating in Mock mode.`
  );
  isFirebaseInitialized = false;
}

/**
 * Send a push notification (e.g. for booking confirmation)
 * @param {object} params
 * @param {string} params.token - Target FCM device token or topic
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {object} [params.data] - Additional custom data payload
 * @returns {Promise<object>} Status result
 */
const sendBookingNotification = async ({ token, title, body, data = {} }) => {
  if (isFirebaseInitialized && token) {
    try {
      const messaging = getMessaging ? getMessaging() : null;
      if (messaging) {
        const message = {
          notification: {
            title,
            body
          },
          data: Object.entries(data).reduce((acc, [k, v]) => {
            acc[k] = String(v);
            return acc;
          }, {}),
          token
        };

        const response = await messaging.send(message);
        return {
          success: true,
          mocked: false,
          messageId: response,
          message: 'Firebase push notification sent successfully'
        };
      }
    } catch (error) {
      console.error('[Firebase] Send Error:', error.message);
      return {
        success: false,
        mocked: false,
        error: error.message
      };
    }
  }

  // Graceful fallback for viva / local demonstration
  console.log('--------------------------------------------------');
  console.log('[Firebase Notification Simulator]');
  console.log(`Target Token: ${token || 'N/A (Dev Test Device)'}`);
  console.log(`Title: ${title}`);
  console.log(`Body: ${body}`);
  console.log(`Data:`, data);
  console.log('--------------------------------------------------');

  return {
    success: true,
    mocked: true,
    message: 'Notification simulated successfully (Firebase credentials not configured)',
    payload: {
      token: token || 'device_token_mock',
      title,
      body,
      data
    }
  };
};

module.exports = {
  admin,
  sendBookingNotification,
  getFirebaseAuth: () => authInstance,
  isFirebaseInitialized: () => isFirebaseInitialized
};
