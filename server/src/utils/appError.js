/**
 * Custom Application Error Class
 * Extends native Error with statusCode and operational flag
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors vs programming errors

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
