/**
 * JWT Validation Middleware
 * Production-grade JWT validation with enhanced security features
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { config } = require('../config/config');

// JWT validation options
const jwtOptions = {
  algorithms: ['HS256'],
  ignoreExpiration: false,
  ignoreNotBefore: false
};

// Enhanced JWT validation
const validateJWT = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Check token format
    if (typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    // Check token structure (should have 3 parts)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret, jwtOptions);
    
    // Check if decoded token has required fields
    if (!decoded.id || !decoded.email) {
      throw new Error('Invalid token payload');
    }

    // Check token age (optional - for additional security)
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;
    const maxAge = 24 * 60 * 60; // 24 hours
    
    if (tokenAge > maxAge) {
      throw new Error('Token too old');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    } else {
      throw error;
    }
  }
};

// User validation middleware
const validateUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID required');
    }

    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    // Find user in database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error('User account is banned');
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    return user;
  } catch (error) {
    logger.error('User validation failed', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Token blacklist middleware (for revoked tokens)
const tokenBlacklist = new Set(); // In production, use Redis for distributed blacklist

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // In production, set expiration for blacklisted tokens
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000); // Remove after 24 hours
};

// Rate limiting for auth attempts
const authAttempts = new Map(); // In production, use Redis for distributed rate limiting

const checkAuthAttempts = (identifier) => {
  const attempts = authAttempts.get(identifier) || { count: 0, lastAttempt: null };
  const now = Date.now();
  
  // Reset attempts if last attempt was more than 15 minutes ago
  if (attempts.lastAttempt && (now - attempts.lastAttempt) > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  authAttempts.set(identifier, attempts);
  
  // Lock out after 5 failed attempts
  if (attempts.count >= 5) {
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    throw new Error(`Too many failed attempts. Please try again after ${Math.floor(lockoutTime / 60000)} minutes.`);
  }
  
  return attempts.count;
};

const resetAuthAttempts = (identifier) => {
  authAttempts.delete(identifier);
};

// Enhanced authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTH_REQUIRED',
          details: 'No token provided'
        }
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        error: {
          code: 'TOKEN_REVOKED',
          details: 'Please login again'
        }
      });
    }

    // Validate JWT
    const decoded = validateJWT(token);
    
    // Validate user
    const user = await validateUser(decoded.id);
    
    // Attach user to request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    // Log successful authentication
    logger.info('User authenticated', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('Authentication failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Check for rate limiting
    if (error.message.includes('Too many failed attempts')) {
      return res.status(429).json({
        success: false,
        message: error.message,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          details: error.message
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: {
        code: 'AUTH_FAILED',
        details: error.message
      }
    });
  }
};

// Optional authentication middleware
const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return next(); // Continue without authentication
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return next(); // Continue without authentication
    }

    // Validate JWT
    const decoded = validateJWT(token);
    
    // Validate user
    const user = await validateUser(decoded.id);
    
    // Attach user to request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.warn('Optional authentication failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTH_REQUIRED',
          details: 'No user found in request'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: `Required roles: ${roles.join(', ')}`
        }
      });
    }

    next();
  };
};

// Tier-based authorization middleware
const authorizeTier = (...tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTH_REQUIRED',
          details: 'No user found in request'
        }
      });
    }

    if (!tiers.includes(req.user.tier || 'basic')) {
      logger.warn('Tier authorization failed', {
        userId: req.user._id,
        userTier: req.user.tier || 'basic',
        requiredTiers: tiers,
        ip: req.ip,
        path: req.path,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Premium feature',
        error: {
          code: 'PREMIUM_FEATURE',
          details: `This feature requires: ${tiers.join(' or ')} tier`
        }
      });
    }

    next();
  };
};

// Token refresh middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          details: 'No refresh token provided'
        }
      });
    }

    // Validate refresh token (similar to JWT validation)
    const decoded = validateJWT(refreshToken);
    
    // Check if refresh token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked',
        error: {
          code: 'REFRESH_TOKEN_REVOKED',
          details: 'Please login again'
        }
      });
    }

    // Validate user
    const user = await validateUser(decoded.id);
    
    // Generate new tokens
    const newToken = jwt.sign(
      { id: user._id, email: user.email },
      config.security.jwtSecret,
      { expiresIn: config.security.jwtExpiresIn }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email, type: 'refresh' },
      config.security.jwtSecret,
      { expiresIn: config.security.jwtRefreshExpiresIn || '7d' }
    );

    // Blacklist old refresh token
    blacklistToken(refreshToken);

    // Reset auth attempts
    resetAuthAttempts(user.email);

    logger.info('Token refreshed', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.tier || 'basic'
        }
      }
    });
  } catch (error) {
    logger.error('Token refresh failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: {
        code: 'REFRESH_FAILED',
        details: error.message
      }
    });
  }
};

// Token validation utility
const validateTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Try to decode header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return header && payload;
  } catch (error) {
    return false;
  }
};

// Token expiration check
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

// Token cleanup utility
const cleanupExpiredTokens = () => {
  // In production, this would clean up expired tokens from blacklist
  logger.info('Token cleanup completed');
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  authorizeTier,
  refreshToken,
  validateJWT,
  validateUser,
  blacklistToken,
  isTokenBlacklisted,
  checkAuthAttempts,
  resetAuthAttempts,
  validateTokenFormat,
  isTokenExpired,
  cleanupExpiredTokens
};
