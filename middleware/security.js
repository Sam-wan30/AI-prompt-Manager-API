/**
 * Security Middleware
 * Production-grade security features including XSS protection, input sanitization, and security headers
 */

const helmet = require('helmet');
const xss = require('xss');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { securityLogger } = require('./requestLogger');

// XSS protection configuration
const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target'],
    abbr: ['title'],
    address: [],
    area: ['shape', 'coords', 'href', 'alt'],
    article: [],
    aside: [],
    audio: ['autoplay', 'controls', 'loop', 'preload', 'src'],
    b: [],
    big: [],
    blockquote: ['cite'],
    br: [],
    caption: [],
    center: [],
    cite: [],
    code: [],
    col: ['align', 'valign', 'span', 'width'],
    colgroup: ['align', 'valign', 'span', 'width'],
    dd: [],
    del: ['datetime'],
    details: ['open'],
    div: [],
    dl: [],
    dt: [],
    em: [],
    font: ['color', 'size', 'face'],
    footer: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    header: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    ins: ['datetime'],
    li: [],
    mark: [],
    nav: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    section: [],
    small: [],
    span: [],
    strike: [],
    strong: [],
    sub: [],
    summary: [],
    sup: [],
    table: ['width', 'border'],
    tbody: [],
    td: ['align', 'valign', 'span', 'width', 'height'],
    tfoot: [],
    th: ['align', 'valign', 'span', 'width', 'height'],
    thead: [],
    tr: [],
    tt: [],
    u: [],
    ul: [],
    video: ['autoplay', 'controls', 'loop', 'preload', 'src', 'height', 'width']
  },
  css: {
    whiteList: {
      'text-align': true,
      'font-size': true,
      'font-weight': true,
      'color': true,
      'background-color': true,
      'margin': true,
      'padding': true,
      'border': true,
      'width': true,
      'height': true
    }
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
};

// Input sanitization functions
const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Apply XSS protection
  sanitized = xss(sanitized, xssOptions);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Length validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    throw new Error(`Input exceeds maximum length of ${options.maxLength} characters`);
  }

  if (options.minLength && sanitized.length < options.minLength) {
    throw new Error(`Input must be at least ${options.minLength} characters long`);
  }

  return sanitized;
};

// Email sanitization
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  // Convert to lowercase and trim
  const sanitized = email.toLowerCase().trim();

  // Validate email format
  if (!validator.isEmail(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
};

// URL sanitization
const sanitizeURL = (url) => {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }

  // Validate URL format
  if (!validator.isURL(url, { protocols: ['http', 'https', 'ftp'] })) {
    throw new Error('Invalid URL format');
  }

  return validator.normalizeURL(url);
};

// Phone number sanitization
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    throw new Error('Phone number must be a string');
  }

  // Remove non-digit characters
  const sanitized = phone.replace(/\D/g, '');

  // Validate phone number
  if (!validator.isMobilePhone(sanitized, 'any')) {
    throw new Error('Invalid phone number format');
  }

  return sanitized;
};

// MongoDB ObjectId sanitization
const sanitizeObjectId = (id) => {
  if (typeof id !== 'string') {
    throw new Error('ID must be a string');
  }

  // Validate ObjectId format
  if (!validator.isMongoId(id)) {
    throw new Error('Invalid ID format');
  }

  return id;
};

// Password sanitization (no sanitization, just validation)
const sanitizePassword = (password) => {
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }

  // Length validation
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    throw new Error('Password must be less than 128 characters long');
  }

  // Password strength validation
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
  }

  return password;
};

// Query parameter sanitization
const sanitizeQuery = (query) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      // Sanitize string values
      sanitized[key] = sanitizeInput(value, { maxLength: 1000 });
    } else if (Array.isArray(value)) {
      // Sanitize array values
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item, { maxLength: 100 }) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Object sanitization
const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// SQL injection detection
const detectSQLInjection = (input) => {
  if (typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\*\/|\/\*)/,
    /(\b(UNION|JOIN|WHERE|HAVING|GROUP BY|ORDER BY)\b)/i,
    /(\b(1=1|1 = 1|true)\b)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS detection
const detectXSS = (input) => {
  if (typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[^>]*javascript:/gi,
    /<link[^>]*href[^>]*javascript:/gi,
    /<meta[^>]*http-equiv[^>]*refresh[^>]*url/gi,
    /<\s*script[^>]*>/gi,
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /Function\s*\(/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    securityLogger('CSRF_ATTACK', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      token: token ? 'present' : 'missing',
      sessionToken: sessionToken ? 'present' : 'missing'
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      error: {
        code: 'CSRF_FAILED',
        details: 'Invalid or missing CSRF token'
      }
    });
  }

  next();
};

// Content Security Policy middleware
const contentSecurityPolicy = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    childSrc: ["'none'"],
    workerSrc: ["'self'"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: []
  }
});

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: false, // We'll use custom CSP
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allowlist: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Input validation middleware
const validateInput = (req, res, next) => {
  try {
    // Validate request body
    if (req.body) {
      req.body = sanitizeObject(req.body);

      // Check for SQL injection
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string' && detectSQLInjection(value)) {
          securityLogger('SQL_INJECTION_ATTEMPT', {
            field: key,
            value: value.substring(0, 100), // Log first 100 chars
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
          });

          return res.status(400).json({
            success: false,
            message: 'Invalid input detected',
            error: {
              code: 'INVALID_INPUT',
              details: 'Potentially malicious input detected'
            }
          });
        }

        // Check for XSS
        if (typeof value === 'string' && detectXSS(value)) {
          securityLogger('XSS_ATTEMPT', {
            field: key,
            value: value.substring(0, 100),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
          });

          return res.status(400).json({
            success: false,
            message: 'Invalid input detected',
            error: {
              code: 'INVALID_INPUT',
              details: 'Potentially malicious input detected'
            }
          });
        }
      }
    }

    // Validate query parameters
    if (req.query) {
      req.query = sanitizeQuery(req.query);
    }

    // Validate URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input validation error', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Input validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.message
      }
    });
  }
};

// Rate limiting for security-sensitive endpoints
const securityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Rate limit exceeded for security reasons'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        details: 'Rate limit exceeded for security reasons'
      }
    });
  }
});

// IP blocking middleware
const blockedIPs = new Set(); // In production, use Redis or database

const blockIP = (ip) => {
  blockedIPs.add(ip);
  securityLogger('IP_BLOCKED', { ip });
};

const unblockIP = (ip) => {
  blockedIPs.delete(ip);
  securityLogger('IP_UNBLOCKED', { ip });
};

const ipBlockMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(clientIP)) {
    securityLogger('BLOCKED_IP_ACCESS_ATTEMPT', {
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      success: false,
      message: 'Access denied',
      error: {
        code: 'IP_BLOCKED',
        details: 'Your IP address has been blocked'
      }
    });
  }

  next();
};

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // Script injection
    /javascript:/i,  // JavaScript protocol
    /data:text\/html/i,  // Data URI
    /vbscript:/i,  // VBScript
    /onload=/i,  // Event handlers
    /onerror=/i,
    /onclick=/i,
    /eval\s*\(/i,  // Code execution
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i
  ];

  const checkSuspiciousActivity = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return { field: key, pattern: pattern.toString(), value: value.substring(0, 100) };
          }
        }
      }
    }
    return null;
  };

  // Check request body
  if (req.body) {
    const suspicious = checkSuspiciousActivity(req.body);
    if (suspicious) {
      securityLogger('SUSPICIOUS_ACTIVITY', {
        type: 'body',
        ...suspicious,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      return res.status(400).json({
        success: false,
        message: 'Suspicious activity detected',
        error: {
          code: 'SUSPICIOUS_ACTIVITY',
          details: 'Potentially malicious activity detected'
        }
      });
    }
  }

  // Check query parameters
  if (req.query) {
    const suspicious = checkSuspiciousActivity(req.query);
    if (suspicious) {
      securityLogger('SUSPICIOUS_ACTIVITY', {
        type: 'query',
        ...suspicious,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      return res.status(400).json({
        success: false,
        message: 'Suspicious activity detected',
        error: {
          code: 'SUSPICIOUS_ACTIVITY',
          details: 'Potentially malicious activity detected'
        }
      });
    }
  }

  next();
};

module.exports = {
  sanitizeInput,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeObjectId,
  sanitizePassword,
  sanitizeQuery,
  sanitizeObject,
  detectSQLInjection,
  detectXSS,
  csrfProtection,
  contentSecurityPolicy,
  securityHeaders,
  validateInput,
  securityRateLimit,
  blockIP,
  unblockIP,
  ipBlockMiddleware,
  suspiciousActivityDetector
};
