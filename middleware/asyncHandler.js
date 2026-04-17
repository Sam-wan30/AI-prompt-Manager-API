/**
 * Async wrapper to eliminate try-catch repetition in controllers
 * Automatically catches errors and forwards them to the error handler
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
