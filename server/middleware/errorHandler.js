/**
 * Centralized error handler. Any controller calling next(error) will
 * end up here. Returns a consistent JSON error shape and avoids
 * leaking stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error Details:", err.stack || err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
