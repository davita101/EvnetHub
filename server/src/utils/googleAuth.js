const { OAuth2Client } = require('google-auth-library');
const config = require('../config/index.config');

const client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret
);

/**
 * Generate Google OAuth URL for user login
 * @returns {string} - Google OAuth authorization URL
 */
exports.getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    redirect_uri: config.google.callbackUrl
  });
};

/**
 * Get user info from Google using authorization code
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - The redirect URI used in the auth request
 * @returns {Promise<Object>} - User info from Google
 */
exports.getGoogleUserInfo = async (code, redirectUri) => {
  try {
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri
    });

    // Set credentials
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture
    };
  } catch (error) {
    throw new Error('Failed to get user info from Google');
  }
};

/**
 * Verify Google ID token (legacy method for frontend token verification)
 * @param {string} token - Google ID token from frontend
 * @returns {Promise<Object>} - User payload from Google
 */
exports.verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};
