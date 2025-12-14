const config = require('../config/index.config');
const { generateToken } = require('./jwt');

/**
 * Send JWT token as HTTP-only cookie
 */
const sendTokenCookie = (res, tokenPayload) => {
  const token = generateToken(tokenPayload);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: config.env === 'production',
    sameSite: 'lax'
  });

  return token;
};

/**
 * Send token cookie and JSON response for user
 */
const sendUserResponse = (res, user, statusCode = 200) => {
  sendTokenCookie(res, {
    id: user._id,
    accountType: 'user',
    role: user.role
  });

  res.status(statusCode).json({
    success: true,
    user
  });
};

module.exports = {
  sendTokenCookie,
  sendUserResponse
};
