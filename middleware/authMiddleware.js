/**
 * Authentication Middleware - Production-ready JWT authentication
 * Protects routes and adds user object to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/config');
const { errorResponse, unauthorizedResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT token and add user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    logger.warn('Access denied - No token provided', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json(
      unauthorizedResponse('Access denied. No token provided.')
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      logger.warn('Access denied - User not found', {
        userId: decoded.id,
        ip: req.ip,
        url: req.originalUrl
      });
      return res.status(401).json(
        unauthorizedResponse('Access denied. User not found.')
      );
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Access denied - User inactive', {
        userId: user._id,
        ip: req.ip,
        url: req.originalUrl
      });
      return res.status(401).json(
        unauthorizedResponse('Access denied. Account has been deactivated.')
      );
    }

    // Add user to request object
    req.user = user;
    
    logger.debug('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      url: req.originalUrl
    });

    next();
  } catch (error) {
    logger.warn('Access denied - Invalid token', {
      error: error.message,
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        unauthorizedResponse('Access denied. Invalid token.')
      );
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        unauthorizedResponse('Access denied. Token expired.')
      );
    } else {
      return res.status(401).json(
        unauthorizedResponse('Access denied. Token verification failed.')
      );
    }
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        unauthorizedResponse('Access denied. Authentication required.')
      );
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - Insufficient permissions', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        url: req.originalUrl
      });
      return res.status(403).json(
        errorResponse('Access denied. Insufficient permissions.', {
          type: 'InsufficientPermissionsError',
          userRole: req.user.role,
          requiredRoles: roles
        })
      );
    }

    logger.debug('User authorized', {
      userId: req.user._id,
      userRole: req.user.role,
      ip: req.ip,
      url: req.originalUrl
    });

    next();
  };
};

/**
 * Optional authentication - Doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token, continue without authentication
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
      
      logger.debug('Optional authentication successful', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        url: req.originalUrl
      });
    }
  } catch (error) {
    // Log error but don't fail the request
    logger.debug('Optional authentication failed', {
      error: error.message,
      ip: req.ip,
      url: req.originalUrl
    });
  }

  next();
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + ':' + req.originalUrl;
    const now = Date.now();
    const userAttempts = attempts.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if window has passed
    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (userAttempts.count >= maxAttempts) {
      logger.warn('Authentication rate limit exceeded', {
        ip: req.ip,
        url: req.originalUrl,
        attempts: userAttempts.count
      });
      
      return res.status(429).json(
        errorResponse('Too many authentication attempts. Please try again later.', {
          type: 'RateLimitError',
          retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
        })
      );
    }

    // Increment attempt count
    userAttempts.count++;
    attempts.set(key, userAttempts);

    // Clean up old entries
    if (attempts.size > 10000) {
      for (const [k, v] of attempts.entries()) {
        if (now > v.resetTime) {
          attempts.delete(k);
        }
      }
    }

    next();
  };
};

/**
 * Validate user input for authentication
 */
const validateAuthInput = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  // Email validation
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
  }

  // Password validation
  if (password) {
    if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }
    if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
    }
  }

  // Name validation
  if (name) {
    if (name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    }
    if (name.length > 50) {
      errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json(
      errorResponse('Validation failed', {
        type: 'ValidationError',
        details: errors
      })
    );
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  authRateLimit,
  validateAuthInput
};
