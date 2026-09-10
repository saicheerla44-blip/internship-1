// middleware/errorMiddleware.js
// Express global error handling middleware

/**
 * Handles errors passed to next() or thrown inside route handlers.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Middleware] ${err.stack || err.message}`);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };
