/**
 * Production-ready Express server
 * Features comprehensive middleware, logging, and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Import production-level modules
const { connectDB, checkConnection } = require('./config/database');
const { config, validateConfig, logConfig } = require('./config/config');
const logger = require('./utils/logger');
const { successResponse } = require('./utils/responseFormatter');
const promptRoutes = require('./routes/promptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');

// Validate configuration
validateConfig();

// Connect to database
connectDB();

const app = express();

// Request logging middleware
if (config.performance.enableMorgan) {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Security middleware
if (config.performance.enableHelmet) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
}

// Compression middleware
if (config.performance.enableCompression) {
  app.use(compression());
}

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging and monitoring

// Rate limiting middleware
if (config.api.rateLimiting) {
  // Rate limiting will be added later
}

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.request(req, res.statusCode, responseTime);
  });
  
  next();
});

// Body parser middleware
app.use(express.json({ 
  limit: config.api.maxPayloadSize,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      logger.error('Invalid JSON payload', { 
        url: req.url, 
        ip: req.ip 
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.api.maxPayloadSize 
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json(
    successResponse(
      {
        message: 'AI Prompt Manager API',
        version: config.api.version,
        environment: config.server.env,
        endpoints: {
          auth: '/api/auth',
          prompts: '/api/prompts',
          analytics: '/api/analytics',
          ai: '/api/ai',
          health: '/api/health'
        }
      },
      'API is running successfully'
    )
  );
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = checkConnection();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.api.version,
      environment: config.server.env,
      uptime: process.uptime(),
      database: {
        connected: dbStatus.isConnected,
        host: dbStatus.host,
        name: dbStatus.name,
        state: dbStatus.state
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      },
      features: config.features
    };

    const statusCode = dbStatus.isConnected ? 200 : 503;
    res.status(statusCode).json(
      successResponse(health, 'Health check completed')
    );
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  const apiInfo = {
    name: 'Prompt Manager API',
    version: config.api.version,
    description: 'Production-ready prompt management system with authentication and analytics',
    authentication: {
      type: 'JWT Bearer Token',
      routes: {
        public: [
          'POST /api/auth/register - Register new user',
          'POST /api/auth/login - User login'
        ],
        protected: [
          'GET /api/auth/me - Get user profile',
          'PUT /api/auth/me - Update user profile',
          'POST /api/auth/logout - User logout',
          'PUT /api/auth/password - Change password',
          'DELETE /api/auth/me - Delete account',
          'GET /api/auth/stats - User statistics (admin only)'
        ]
      }
    },
    endpoints: {
      prompts: {
        base: '/api/prompts',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        authentication: 'Required',
        routes: [
          'GET / - Get all prompts with pagination',
          'POST / - Create new prompt',
          'GET /:id - Get prompt by ID',
          'PUT /:id - Update prompt',
          'DELETE /:id - Delete prompt',
          'POST /:id/use - Increment prompt usage',
          'GET /search - Search prompts',
          'GET /smart-search - Advanced search',
          'GET /top-used - Get top used prompts',
          'GET /popular - Get popular prompts',
          'GET /stats - Get statistics',
          'POST /bulk - Bulk insert prompts'
        ]
      },
      analytics: {
        base: '/api/analytics',
        methods: ['GET'],
        authentication: 'Required',
        routes: [
          'GET /prompts - Comprehensive prompt analytics',
          'GET /prompts/timerange - Time-based analytics',
          'GET /users - User analytics (admin only)',
          'GET /overview - Analytics overview'
        ],
        description: 'Real-time analytics with MongoDB aggregation pipelines'
      },
      ai: {
        base: '/api/ai',
        methods: ['GET', 'POST'],
        authentication: 'Required',
        routes: [
          'POST /generate - Generate AI prompt',
          'POST /improve - Improve existing prompt',
          'POST /variations - Generate prompt variations',
          'POST /analyze - Analyze prompt quality',
          'GET /status - AI service status',
          'GET /analytics - AI usage analytics (admin only)'
        ],
        description: 'OpenAI API integration for AI-powered prompt generation and improvement'
      },
      health: {
        base: '/api/health',
        methods: ['GET'],
        authentication: 'Not required',
        description: 'Health check endpoint'
      }
    },
    features: {
      ...config.features,
      authentication: config.features.enableAuth
    }
  };

  res.json(
    successResponse(apiInfo, 'API documentation')
  );
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Endpoint not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: {
      type: 'NotFoundError',
      path: req.originalUrl,
      method: req.method
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

const server = app.listen(PORT, HOST, () => {
  logConfig();
  logger.info('Server started successfully', {
    port: PORT,
    host: HOST,
    environment: config.server.env,
    pid: process.pid
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason,
    promise: promise.toString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  gracefulShutdown('uncaughtException');
});

module.exports = app;
