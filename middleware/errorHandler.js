/**
 * Production-level error handling middleware
 * Provides centralized error handling, logging, and standardized error responses
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error with context
  logError(err, req);

  // Handle different types of errors
  if (err.name === 'CastError') {
    return handleCastError(error, res);
  }

  if (err.code === 11000) {
    return handleDuplicateFieldsError(error, res);
  }

  if (err.name === 'ValidationError') {
    return handleValidationError(error, res);
  }

  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(error, res);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(error, res);
  }

  if (err.name === 'BulkWriteError') {
    return handleBulkWriteError(error, res);
  }

  // Default server error
  return handleServerError(error, res);
};

/**
 * Log errors with context information
 */
const logError = (err, req) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  };

  // Log based on error severity
  if (err.statusCode && err.statusCode < 500) {
    logger.warn('Client error:', errorInfo);
  } else {
    logger.error('Server error:', errorInfo);
  }
};

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastError = (error, res) => {
  const message = 'Resource not found';
  logger.warn(`CastError: ${error.message}`);
  
  return res.status(404).json({
    success: false,
    message,
    error: {
      type: 'CastError',
      details: 'Invalid resource ID format'
    }
  });
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateFieldsError = (error, res) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `Duplicate field value: ${field} with value: ${value}`;
  
  logger.warn(`DuplicateKeyError: ${message}`);
  
  return res.status(400).json({
    success: false,
    message: 'Duplicate field value entered',
    error: {
      type: 'DuplicateKeyError',
      field,
      value,
      details: `${field} must be unique`
    }
  });
};

/**
 * Handle Mongoose validation error
 */
const handleValidationError = (error, res) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));
  
  const message = 'Validation failed';
  logger.warn(`ValidationError: ${errors.map(e => e.message).join(', ')}`);
  
  return res.status(400).json({
    success: false,
    message,
    error: {
      type: 'ValidationError',
      details: errors
    }
  });
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error, res) => {
  const message = 'Invalid token';
  logger.warn(`JWT Error: ${error.message}`);
  
  return res.status(401).json({
    success: false,
    message,
    error: {
      type: 'JWTError',
      details: 'Token is invalid or malformed'
    }
  });
};

/**
 * Handle expired JWT errors
 */
const handleJWTExpiredError = (error, res) => {
  const message = 'Token expired';
  logger.warn(`JWT Expired Error: ${error.message}`);
  
  return res.status(401).json({
    success: false,
    message,
    error: {
      type: 'TokenExpiredError',
      details: 'Token has expired, please login again'
    }
  });
};

/**
 * Handle bulk write errors
 */
const handleBulkWriteError = (error, res) => {
  const message = 'Bulk operation failed';
  logger.warn(`BulkWriteError: ${error.message}`);
  
  return res.status(400).json({
    success: false,
    message,
    error: {
      type: 'BulkWriteError',
      details: error.writeErrors || 'Bulk write operation encountered errors'
    }
  });
};

/**
 * Handle general server errors
 */
const handleServerError = (error, res) => {
  const message = error.message || 'Internal server error';
  
  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    success: false,
    message: isDevelopment ? message : 'Internal server error',
    error: isDevelopment ? {
      type: 'ServerError',
      stack: error.stack,
      details: message
    } : {
      type: 'ServerError',
      details: 'An unexpected error occurred'
    }
  });
};

module.exports = errorHandler;
