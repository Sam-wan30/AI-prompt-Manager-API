/**
 * Comprehensive Input Validation Middleware
 * Production-grade input validation with sanitization and XSS protection
 */

const Joi = require('joi');
const DOMPurify = require('isomorphic-dompurify');
const { sanitize } = require('sanitize-html');
const logger = require('../utils/logger');

// XSS protection configuration
const sanitizeConfig = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'code', 'pre'],
  allowedAttributes: {
    'a': ['href', 'title'],
    'code': ['class'],
    'pre': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    'a': ['http', 'https', 'mailto']
  }
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
  if (typeof html !== 'string') {
    return html;
  }
  return sanitize(html, sanitizeConfig);
};

// Sanitize and validate text input
const sanitizeText = (text, options = {}) => {
  if (typeof text !== 'string') {
    return text;
  }
  
  // Remove HTML tags and entities
  let sanitized = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Length validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    throw new Error(`Text exceeds maximum length of ${options.maxLength} characters`);
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    throw new Error(`Text must be at least ${options.minLength} characters long`);
  }
  
  return sanitized;
};

// Sanitize email
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

// Sanitize password
const sanitizePassword = (password) => {
  if (typeof password !== 'string') {
    return password;
  }
  
  // Basic validation - no sanitization needed for passwords
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    throw new Error('Password must be less than 128 characters long');
  }
  
  return password;
};

// Sanitize MongoDB ObjectId
const sanitizeObjectId = (id) => {
  if (typeof id !== 'string') {
    return id;
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new Error('Invalid ID format');
  }
  
  return id;
};

// Sanitize pagination parameters
const sanitizePagination = (params) => {
  const sanitized = {};
  
  if (params.page) {
    const page = parseInt(params.page, 10);
    if (isNaN(page) || page < 1) {
      sanitized.page = 1;
    } else if (page > 1000) {
      sanitized.page = 1000;
    } else {
      sanitized.page = page;
    }
  } else {
    sanitized.page = 1;
  }
  
  if (params.limit) {
    const limit = parseInt(params.limit, 10);
    if (isNaN(limit) || limit < 1) {
      sanitized.limit = 10;
    } else if (limit > 100) {
      sanitized.limit = 100;
    } else {
      sanitized.limit = limit;
    }
  } else {
    sanitized.limit = 10;
  }
  
  if (params.sortBy) {
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'usageCount', 'category'];
    if (allowedSortFields.includes(params.sortBy)) {
      sanitized.sortBy = params.sortBy;
    }
  }
  
  if (params.sortOrder) {
    if (['asc', 'desc'].includes(params.sortOrder.toLowerCase())) {
      sanitized.sortOrder = params.sortOrder.toLowerCase();
    }
  }
  
  return sanitized;
};

// Sanitize search parameters
const sanitizeSearch = (params) => {
  const sanitized = sanitizePagination(params);
  
  if (params.q) {
    sanitized.q = sanitizeText(params.q, { maxLength: 100 });
  }
  
  if (params.category) {
    const allowedCategories = ['writing', 'coding', 'marketing', 'business', 'education', 'creative', 'research', 'other'];
    if (allowedCategories.includes(params.category.toLowerCase())) {
      sanitized.category = params.category.toLowerCase();
    }
  }
  
  if (params.tags) {
    if (typeof params.tags === 'string') {
      sanitized.tags = params.tags.split(',').map(tag => sanitizeText(tag.trim(), { maxLength: 50 })).filter(Boolean);
    } else if (Array.isArray(params.tags)) {
      sanitized.tags = params.tags.map(tag => sanitizeText(tag, { maxLength: 50 })).filter(Boolean);
    }
  }
  
  return sanitized;
};

// Validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  }),

  // Prompt creation
  createPrompt: Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
    promptText: Joi.string().min(20).max(5000).required().messages({
      'string.empty': 'Prompt text is required',
      'string.min': 'Prompt text must be at least 20 characters long',
      'string.max': 'Prompt text cannot exceed 5000 characters',
      'any.required': 'Prompt text is required'
    }),
    category: Joi.string().valid('writing', 'coding', 'marketing', 'business', 'education', 'creative', 'research', 'other').required().messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required'
    }),
    tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.min': 'Tag must be at least 1 character long',
      'string.max': 'Tag cannot exceed 50 characters'
    })
  }),

  // Prompt update
  updatePrompt: Joi.object({
    title: Joi.string().min(3).max(100).messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
    description: Joi.string().min(10).max(500).messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 500 characters'
    }),
    promptText: Joi.string().min(20).max(5000).messages({
      'string.min': 'Prompt text must be at least 20 characters long',
      'string.max': 'Prompt text cannot exceed 5000 characters'
    }),
    category: Joi.string().valid('writing', 'coding', 'marketing', 'business', 'education', 'creative', 'research', 'other').messages({
      'any.only': 'Invalid category'
    }),
    tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.min': 'Tag must be at least 1 character long',
      'string.max': 'Tag cannot exceed 50 characters'
    })
  }),

  // AI generation
  aiGenerate: Joi.object({
    topic: Joi.string().min(3).max(200).required().messages({
      'string.empty': 'Topic is required',
      'string.min': 'Topic must be at least 3 characters long',
      'string.max': 'Topic cannot exceed 200 characters',
      'any.required': 'Topic is required'
    }),
    category: Joi.string().valid('writing', 'coding', 'marketing', 'business', 'education', 'creative', 'research', 'other').default('marketing').messages({
      'any.only': 'Invalid category'
    }),
    tone: Joi.string().valid('professional', 'casual', 'formal', 'friendly', 'technical', 'creative', 'academic', 'conversational').default('professional').messages({
      'any.only': 'Invalid tone'
    })
  }),

  // AI improve
  aiImprove: Joi.object({
    prompt: Joi.string().min(10).max(2000).required().messages({
      'string.empty': 'Prompt is required',
      'string.min': 'Prompt must be at least 10 characters long',
      'string.max': 'Prompt cannot exceed 2000 characters',
      'any.required': 'Prompt is required'
    })
  }),

  // Password change
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required'
    })
  }),

  // Profile update
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
      notifications: Joi.boolean().default(true),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt').default('en')
    })
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    // Sanitize input before validation
    const sanitizedData = sanitizeInput(data, schema);
    
    const { error, value } = schema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      logger.warn('Input validation failed', {
        path: req.path,
        method: req.method,
        errors: validationErrors,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }
    
    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

// Sanitize input based on schema
const sanitizeInput = (data, schema) => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic XSS protection
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return sanitizeText(item);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Custom validation middleware for specific cases
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      req.params[paramName] = sanitizeObjectId(id);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: {
          code: 'INVALID_ID',
          details: error.message
        }
      });
    }
  };
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  try {
    req.query = sanitizePagination(req.query);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters',
      error: {
        code: 'INVALID_PAGINATION',
        details: error.message
      }
    });
  }
};

// Validate search parameters
const validateSearch = (req, res, next) => {
  try {
    req.query = sanitizeSearch(req.query);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid search parameters',
      error: {
        code: 'INVALID_SEARCH',
        details: error.message
      }
    });
  }
};

// Content security middleware
const contentSecurity = (req, res, next) => {
  // Check for potential XSS attacks
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            logger.warn('Potential XSS attack detected', {
              path: req.path,
              method: req.method,
              field: key,
              ip: req.ip,
              userAgent: req.get('User-Agent')
            });
            
            return res.status(400).json({
              success: false,
              message: 'Invalid content detected',
              error: {
                code: 'SECURITY_VIOLATION',
                details: 'Content contains potentially harmful code'
              }
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkObject(value);
        if (result) return result;
      }
    }
  };
  
  // Check request body
  if (req.body) {
    const result = checkObject(req.body);
    if (result) return result;
  }
  
  // Check query parameters
  if (req.query) {
    const result = checkObject(req.query);
    if (result) return result;
  }
  
  next();
};

// User activity logger middleware
const userActivityLogger = (activity) => {
  return (req, res, next) => {
    logger.info(`User activity: ${activity}`, {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    next();
  };
};

module.exports = {
  validate,
  schemas,
  validateObjectId,
  validatePagination,
  validateSearch,
  contentSecurity,
  sanitizeText,
  sanitizeEmail,
  sanitizePassword,
  sanitizeHtml,
  sanitizeObjectId,
  sanitizePagination,
  sanitizeSearch,
  userActivityLogger
};
