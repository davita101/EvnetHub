/**
 * Catch Async Errors Wrapper
 * Wraps async route handlers to automatically catch errors
 * and pass them to the global error handler
 *
 * Usage:
 * router.get('/route', catchAsync(async (req, res, next) => {
 *   // Your async code here
 *   // No need for try-catch!
 * }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
