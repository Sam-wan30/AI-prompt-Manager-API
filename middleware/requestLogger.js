/**
 * Centralized Request Logging Middleware
 * Production-grade logging with structured logs and monitoring
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  const startTime = Date.now();
  
  // Extract relevant information
  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    userRole: req.user?.role,
    userTier: req.user?.tier
  };
  
  // Log sensitive data only in development
  if (process.env.NODE_ENV === 'development') {
    logData.headers = req.headers;
    if (req.body && Object.keys(req.body).length > 0) {
      logData.body = sanitizeRequestBody(req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      logData.query = req.query;
    }
  }
  
  logger.info('Request started', logData);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log response completion
    const responseLogData = {
      requestId,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
      userId: req.user?.id
    };
    
    // Add response body only in development for small responses
    if (process.env.NODE_ENV === 'development' && chunk && chunk.length < 1000) {
      try {
        responseLogData.responseBody = JSON.parse(chunk);
      } catch (error) {
        responseLogData.responseBody = chunk.toString();
      }
    }
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', responseLogData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', responseLogData);
    } else if (res.statusCode >= 300) {
      logger.info('Request completed with redirect', responseLogData);
    } else {
      logger.info('Request completed successfully', responseLogData);
    }
    
    // Performance monitoring
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        ...responseLogData,
        performanceWarning: true
      });
    }
    
    // Call original end
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Sanitize request body for logging (remove sensitive data)
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitized = {};
  
  for (const [key, value] of Object.entries(body)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// API analytics middleware
const apiAnalytics = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to track API responses
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Track API usage
    const analyticsData = {
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      userRole: req.user?.role,
      userTier: req.user?.tier,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: data?.success || false,
      error: data?.error?.code || null
    };
    
    // Log analytics data
    logger.info('API analytics', analyticsData);
    
    // Store in database for analytics (in production)
    if (process.env.NODE_ENV === 'production' && req.user?.id) {
      // This would be stored in analytics collection
      // For now, just log it
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Security event logging
const securityLogger = (event, metadata = {}) => {
  const securityData = {
    event,
    timestamp: new Date().toISOString(),
    severity: 'high',
    ...metadata
  };
  
  logger.warn('Security event detected', securityData);
  
  // In production, you might want to send this to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
  }
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorData = {
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    method: req.method,
    url: req.url,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  };
  
  logger.error('Unhandled error', errorData);
  
  next(err);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    const performanceData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // Log slow requests
    if (duration > 500) {
      logger.warn('Performance warning', performanceData);
    } else {
      logger.debug('Performance metrics', performanceData);
    }
  });
  
  next();
};

// User activity logging
const userActivityLogger = (action, details = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const activityData = {
      userId: req.user.id,
      action,
      details: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        ...details
      }
    };
    
    logger.info('User activity', activityData);
    
    next();
  };
};

// Database query logging (for debugging)
const queryLogger = (query, params, duration) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database query', {
      query: query.toString(),
      params,
      duration: `${duration}ms`
    });
  }
};

// Business event logging
const businessEventLogger = (event, data) => {
  const businessData = {
    event,
    timestamp: new Date().toISOString(),
    data
  };
  
  logger.info('Business event', businessData);
};

module.exports = {
  requestLogger,
  apiAnalytics,
  securityLogger,
  errorLogger,
  performanceMonitor,
  userActivityLogger,
  queryLogger,
  businessEventLogger,
  sanitizeRequestBody
};
