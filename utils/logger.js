/**
 * Production-level logging utility
 * Provides structured logging with different levels and formats
 */

const config = require('../config/database');

// Simple logger implementation (can be upgraded to Winston or similar)
const logger = {
  /**
   * Log info level messages
   * @param {string} message - Log message
   * @param {object} data - Additional data to log
   */
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'INFO',
      message,
      ...data
    };
    
    console.log(`[${timestamp}] INFO: ${message}`, data);
  },

  /**
   * Log warning level messages
   * @param {string} message - Log message
   * @param {object} data - Additional data to log
   */
  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'WARN',
      message,
      ...data
    };
    
    console.warn(`[${timestamp}] WARN: ${message}`, data);
  },

  /**
   * Log error level messages
   * @param {string} message - Log message
   * @param {object} data - Additional data to log
   */
  error: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'ERROR',
      message,
      ...data
    };
    
    console.error(`[${timestamp}] ERROR: ${message}`, data);
  },

  /**
   * Log debug level messages (only in development)
   * @param {string} message - Log message
   * @param {object} data - Additional data to log
   */
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level: 'DEBUG',
        message,
        ...data
      };
      
      console.log(`[${timestamp}] DEBUG: ${message}`, data);
    }
  },

  /**
   * Log database operations
   * @param {string} operation - Database operation type
   * @param {object} data - Operation details
   */
  database: (operation, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'DATABASE',
      operation,
      ...data
    };
    
    console.log(`[${timestamp}] DATABASE: ${operation}`, data);
  },

  /**
   * Log API requests
   * @param {object} req - Express request object
   * @param {number} statusCode - Response status code
   * @param {number} responseTime - Request response time in ms
   */
  request: (req, statusCode, responseTime) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'REQUEST',
      method: req.method,
      url: req.originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    console[logLevel](`[${timestamp}] ${req.method} ${req.originalUrl} - ${statusCode} (${responseTime}ms)`);
  },

  /**
   * Log authentication events
   * @param {string} event - Authentication event type
   * @param {object} data - Event details
   */
  auth: (event, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'AUTH',
      event,
      ...data
    };
    
    console.log(`[${timestamp}] AUTH: ${event}`, data);
  },

  /**
   * Log performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {object} data - Additional data
   */
  performance: (metric, value, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'PERFORMANCE',
      metric,
      value,
      ...data
    };
    
    console.log(`[${timestamp}] PERFORMANCE: ${metric} = ${value}`, data);
  }
};

module.exports = logger;
