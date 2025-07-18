// backend/middleware/errorMiddleware.js
// Custom error handling middleware for Express

const errorHandler = (err, req, res, next) => {
  // Determine the status code based on the response status or default to 500 (Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode); // Set the response status code

  // Send a JSON response with the error message and stack trace (in development)
  res.json({
    message: err.message, // The error message
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Stack trace only in development
  });
};

module.exports = {
  errorHandler,
};
