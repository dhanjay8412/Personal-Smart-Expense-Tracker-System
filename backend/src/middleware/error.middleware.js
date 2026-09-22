const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'SERVER_ERROR';
  let details = err.errors || [];

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    error.message = message;
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    error.message = message;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error.message = message;
  }

  if (statusCode >= 500) {
    logger.error(`[Server Error] ${req.method} ${req.originalUrl}: ${err.stack || err.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: {
      code: errorCode,
      details: details.length > 0 ? details : undefined,
    },
  });
};

module.exports = errorHandler;
