/**
 * Standard API response format utility
 * Provides consistent response structure across all endpoints
 */

const logger = require('./logger');

/**
 * Create a standardized API response
 * @param {boolean} success - Whether the operation was successful
 * @param {any} data - The response data (optional)
 * @param {string} message - Response message (optional)
 * @param {object} meta - Additional metadata (optional)
 * @returns {object} Standardized response object
 */
const createResponse = (success = true, data = null, message = '', meta = {}) => {
  const response = {
    success,
    message: message || (success ? 'Operation successful' : 'Operation failed')
  };

  // Add data if provided
  if (data !== null) {
    response.data = data;
  }

  // Add metadata if provided
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  // Add timestamp
  response.timestamp = new Date().toISOString();

  return response;
};

/**
 * Create a success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} Success response
 */
const successResponse = (data = null, message = 'Operation successful', meta = {}) => {
  return createResponse(true, data, message, meta);
};

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {object} error - Error details
 * @param {object} meta - Additional metadata
 * @returns {object} Error response
 */
const errorResponse = (message = 'Operation failed', error = null, meta = {}) => {
  const response = createResponse(false, null, message, meta);
  
  if (error) {
    response.error = error;
  }

  return response;
};

/**
 * Create a paginated response
 * @param {array} data - Array of items
 * @param {object} pagination - Pagination metadata
 * @param {string} message - Response message
 * @returns {object} Paginated response
 */
const paginatedResponse = (data = [], pagination = {}, message = 'Data retrieved successfully') => {
  return successResponse(
    data,
    message,
    {
      pagination: {
        currentPage: pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
        totalResults: pagination.totalResults || 0,
        limit: pagination.limit || 10,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
        ...pagination
      }
    }
  );
};

/**
 * Create a validation error response
 * @param {array} errors - Array of validation errors
 * @param {string} message - Error message
 * @returns {object} Validation error response
 */
const validationErrorResponse = (errors = [], message = 'Validation failed') => {
  return errorResponse(message, {
    type: 'ValidationError',
    details: errors
  });
};

/**
 * Create a not found response
 * @param {string} resource - Resource type that was not found
 * @returns {object} Not found response
 */
const notFoundResponse = (resource = 'Resource') => {
  return errorResponse(`${resource} not found`, {
    type: 'NotFoundError',
    resource
  });
};

/**
 * Create an unauthorized response
 * @param {string} message - Error message
 * @returns {object} Unauthorized response
 */
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(message, {
    type: 'UnauthorizedError',
    details: 'Authentication required'
  });
};

/**
 * Create a forbidden response
 * @param {string} message - Error message
 * @returns {object} Forbidden response
 */
const forbiddenResponse = (message = 'Access forbidden') => {
  return errorResponse(message, {
    type: 'ForbiddenError',
    details: 'Insufficient permissions'
  });
};

/**
 * Log response for monitoring
 * @param {object} req - Express request object
 * @param {object} response - Response object
 * @param {number} statusCode - HTTP status code
 */
const logResponse = (req, response, statusCode) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    responseSize: JSON.stringify(response).length
  };

  if (statusCode >= 400) {
    logger.warn('API Error Response:', logData);
  } else {
    logger.info('API Response:', logData);
  }
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  logResponse
};
