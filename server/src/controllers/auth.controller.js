/**
 * Auth Controller
 *
 * Handles user authentication.
 */

const User = require('../models/user.model');
const { getGoogleAuthUrl, getGoogleUserInfo } = require('../utils/googleAuth');
const { sendTokenCookie, sendUserResponse } = require('../utils/sendToken');
const config = require('../config/index.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * User signup with email/password
 */
exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return next(new AppError('Please provide email, password, and name', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already exists', 400));
  }

  const user = await User.create({
    email,
    passwordHash: password,
    name
  });

  sendUserResponse(res, user, 201);
});

/**
 * User login with email/password
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  const isValid = await user.verifyPassword(password);
  if (!isValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendUserResponse(res, user);
});

/**
 * Google OAuth redirect
 */
exports.googleRedirect = (req, res) => {
  const authUrl = getGoogleAuthUrl();
  res.redirect(authUrl);
};

/**
 * Google OAuth callback
 */
exports.googleCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code not provided', 400));
  }

  const googleUser = await getGoogleUserInfo(code, config.google.callbackUrl);

  let user = await User.findOne({ email: googleUser.email });

  if (!user) {
    user = await User.create({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name
    });
  } else if (!user.googleId) {
    user.googleId = googleUser.googleId;
    await user.save();
  }

  if (!user.isActive) {
    return res.redirect(`${config.frontendUrl}/login?error=account_deactivated`);
  }

  sendTokenCookie(res, {
    id: user._id,
    accountType: 'user',
    role: user.role
  });

  res.redirect(`${config.frontendUrl}/dashboard`);
});

/**
 * Logout
 */
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Get current user
 */
exports.me = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

/**
 * Update user profile
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.json({
    success: true,
    user
  });
});
