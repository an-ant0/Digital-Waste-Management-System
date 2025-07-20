// backend/middleware/errorMiddleware.js

// Custom error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  // If the response status code is already set, use it,
  // otherwise default to 500 (Internal Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode); // Set the HTTP status code for the response

  // Send a JSON response containing:
  // - the error message
  // - the stack trace only if not in production (useful for debugging)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};
