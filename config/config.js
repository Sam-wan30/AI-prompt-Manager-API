/**
 * Application configuration management
 * Centralized configuration with environment-based overrides
 */

require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_manager',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    }
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'simple',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDir: process.env.LOG_DIR || './logs'
  },

  // API configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    rateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 seconds
    maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '10mb'
  },

  // Performance configuration
  performance: {
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableMorgan: process.env.ENABLE_MORGAN !== 'false',
    cacheEnabled: process.env.ENABLE_CACHE === 'true',
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600 // 1 hour
  },

  // Feature flags
  features: {
    enableAuth: process.env.ENABLE_AUTH !== 'false', // Enable auth by default
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true'
  },

  // External services
  services: {
    email: {
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      apiKey: process.env.EMAIL_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'noreply@example.com'
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local',
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [];
  
  if (config.features.enableAuth && !config.security.jwtSecret) {
    requiredVars.push('JWT_SECRET');
  }
  
  if (requiredVars.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredVars.join(', ')}`);
  }
};

// Development vs Production configurations
if (config.server.env === 'development') {
  config.logging.level = 'debug';
  config.security.rateLimitMax = 1000; // More lenient in development
} else if (config.server.env === 'production') {
  config.logging.level = 'warn';
  config.security.rateLimitMax = 100; // Stricter in production
}

// Log configuration on startup
const logConfig = () => {
  console.log('Application Configuration:', {
    environment: config.server.env,
    port: config.server.port,
    database: config.database.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
    features: config.features,
    logging: config.logging
  });
};

module.exports = {
  config,
  validateConfig,
  logConfig
};
