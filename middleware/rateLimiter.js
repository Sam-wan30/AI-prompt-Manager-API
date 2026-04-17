/**
 * Advanced Rate Limiting Middleware
 * Production-grade rate limiting with different limits for different endpoints
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');
const { config } = require('../config/config');
const logger = require('../utils/logger');

// Redis client for distributed rate limiting
let redisClient;
let redisStore;

// Initialize Redis for rate limiting
const initializeRedis = async () => {
  try {
    if (config.redis.enabled) {
      redisClient = Redis.createClient({
        url: config.redis.url,
        password: config.redis.password,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      await redisClient.connect();
      
      redisStore = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      });
      
      logger.info('Redis rate limiting store initialized');
    }
  } catch (error) {
    logger.warn('Redis not available, falling back to memory store for rate limiting', { error: error.message });
  }
};

// Initialize Redis on module load
initializeRedis();

// Base rate limiter configuration
const baseConfig = {
  windowMs: config.security.rateLimitWindowMs,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore || 'memory',
  keyGenerator: (req) => {
    // Use IP + user ID for authenticated users
    if (req.user?.id) {
      return `user:${req.user.id}:${req.ip}`;
    }
    return `ip:${req.ip}`;
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
      }
    });
  }
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    ...baseConfig,
    max: config.security.rateLimitMax,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  }),

  // Authentication endpoints - stricter limits
  auth: rateLimit({
    ...baseConfig,
    max: 5, // 5 attempts per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      // Use email for login attempts
      if (req.body?.email) {
        return `auth:${req.body.email}:${req.ip}`;
      }
      return `auth:${req.ip}`;
    }
  }),

  // Registration - very strict limits
  register: rateLimit({
    ...baseConfig,
    max: 3, // 3 attempts per window
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req) => {
      // Use email for registration attempts
      if (req.body?.email) {
        return `register:${req.body.email}:${req.ip}`;
      }
      return `register:${req.ip}`;
    }
  }),

  // AI generation - moderate limits
  ai: rateLimit({
    ...baseConfig,
    max: 20, // 20 requests per window
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `ai:${req.user.id}`;
      }
      return `ai:${req.ip}`;
    }
  }),

  // Prompt CRUD operations
  prompts: rateLimit({
    ...baseConfig,
    max: 100, // 100 requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `prompts:${req.user.id}`;
      }
      return `prompts:${req.ip}`;
    }
  }),

  // Analytics - moderate limits
  analytics: rateLimit({
    ...baseConfig,
    max: 30, // 30 requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `analytics:${req.user.id}`;
      }
      return `analytics:${req.ip}`;
    }
  }),

  // Search endpoints
  search: rateLimit({
    ...baseConfig,
    max: 50, // 50 requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `search:${req.user.id}`;
      }
      return `search:${req.ip}`;
    }
  }),

  // File upload limits
  upload: rateLimit({
    ...baseConfig,
    max: 10, // 10 uploads per window
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `upload:${req.user.id}`;
      }
      return `upload:${req.ip}`;
    }
  }),

  // Admin endpoints - very strict
  admin: rateLimit({
    ...baseConfig,
    max: 50, // 50 requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `admin:${req.user.id}`;
      }
      return `admin:${req.ip}`;
    },
    skip: (req) => {
      // Only apply to admin users
      return !req.user?.role || req.user.role !== 'admin';
    }
  })
};

// Middleware to apply rate limiting based on route
const applyRateLimit = (type) => {
  return (req, res, next) => {
    const limiter = rateLimiters[type] || rateLimiters.general;
    return limiter(req, res, next);
  };
};

// Custom rate limiter for sensitive operations
const createCustomRateLimit = (options) => {
  return rateLimit({
    ...baseConfig,
    ...options
  });
};

// Rate limiting for specific user tiers
const tierBasedRateLimit = (req, res, next) => {
  const user = req.user;
  let maxRequests = config.security.rateLimitMax;
  let windowMs = config.security.rateLimitWindowMs;

  // Adjust limits based on user tier
  if (user?.tier === 'premium') {
    maxRequests = 1000;
    windowMs = 15 * 60 * 1000;
  } else if (user?.tier === 'pro') {
    maxRequests = 500;
    windowMs = 15 * 60 * 1000;
  } else if (user?.tier === 'basic') {
    maxRequests = 100;
    windowMs = 15 * 60 * 1000;
  }

  const limiter = createCustomRateLimit({
    max: maxRequests,
    windowMs: windowMs,
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `tier:${req.user.tier}:${req.user.id}`;
      }
      return `tier:anonymous:${req.ip}`;
    }
  });

  return limiter(req, res, next);
};

// Rate limit status checker middleware
const rateLimitStatus = (req, res, next) => {
  // Add rate limit headers to response
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());
  
  next();
};

// Rate limit bypass for trusted IPs
const bypassRateLimit = (req, res, next) => {
  const trustedIPs = config.security.trustedIPs || [];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (trustedIPs.includes(clientIP)) {
    logger.info('Rate limit bypassed for trusted IP', { ip: clientIP });
    return next();
  }
  
  next();
};

// Cleanup function for Redis connection
const cleanup = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis rate limiting client closed');
    } catch (error) {
      logger.error('Error closing Redis rate limiting client', { error: error.message });
    }
  }
};

// Handle process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

module.exports = {
  applyRateLimit,
  createCustomRateLimit,
  tierBasedRateLimit,
  rateLimitStatus,
  bypassRateLimit,
  rateLimiters,
  cleanup
};
