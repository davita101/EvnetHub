const AppError = require('../utils/appError');
const config = require('../config/index.config');

/**
 * Handle Mongoose CastError (Invalid ObjectId)
 * Returns 404 for invalid IDs (resource not found)
 */
const handleCastErrorDB = (err) => {
  // If it's an ID field, treat as resource not found (404)
  if (err.path === '_id' || err.path === 'id' || err.path.includes('Id')) {
    const message = `${err.path === '_id' ? 'Resource' : err.path} not found`;
    return new AppError(message, 404);
  }
  // Otherwise, return 400 for invalid input
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Token Error
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Handle Multer Upload Errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large. Maximum size is 5MB per file.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum 4 images allowed.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Use "images" field for uploads.', 400);
  }
  // Generic multer error
  return new AppError(err.message || 'File upload error', 400);
};

/**
 * Send Error Response in Development Mode
 * Includes full error details and stack trace
 */
const sendErrorDev = (err, res) => {
  // Ensure statusCode is set
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    success: false,
    status: status,
    error: err,
    message: err.message || 'An error occurred',
    stack: err.stack
  });
};

/**
 * Send Error Response in Production Mode
 * Only sends safe error details to client
 * Always includes message for 404 errors
 */
const sendErrorProd = (err, res) => {
  // Ensure statusCode is set
  const statusCode = err.statusCode || 500;
  const status = err.status || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error');
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(statusCode).json({
      success: false,
      status: status,
      message: err.message || 'An error occurred'
    });
  }
  // Programming or unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);

    // For 404 errors, always return a message even if not operational
    if (statusCode === 404) {
      res.status(404).json({
        success: false,
        status: 'fail',
        message: err.message || 'Resource not found'
      });
    } else {
      // Send generic message for other errors
      res.status(statusCode).json({
        success: false,
        status: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    }
  }
};

/**
 * Global Error Handler Middleware
 * Centralized error handling for the entire application
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error (always log in production for monitoring)
  if (config.env === 'production') {
    console.error({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      error: err.message,
      statusCode: err.statusCode,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  }

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else if (config.env === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // Handle multer errors
    if (err.code && err.code.startsWith('LIMIT_')) error = handleMulterError(err);

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const message = `Cannot find ${req.originalUrl} on this server`;
  next(new AppError(message, 404));
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};
