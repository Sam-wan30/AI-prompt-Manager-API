/**
 * Database configuration and connection management
 * Production-ready MongoDB connection with proper error handling
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

/**
 * Database connection configuration
 */
const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_manager',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  }
};

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...', {
      uri: dbConfig.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      options: dbConfig.options
    });

    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);

    logger.info('MongoDB Connected Successfully', {
      host: conn.connection.host,
      port: conn.connection.port,
      database: conn.connection.name
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle application termination
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    return conn;

  } catch (error) {
    logger.error('Database connection failed:', {
      message: error.message,
      stack: error.stack,
      uri: dbConfig.uri.replace(/\/\/.*@/, '//***:***@')
    });
    
    process.exit(1);
  }
};

/**
 * Graceful database shutdown
 */
const gracefulShutdown = async () => {
  try {
    logger.info('Closing MongoDB connection...');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during MongoDB shutdown:', error);
    process.exit(1);
  }
};

/**
 * Check database connection status
 */
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[state],
    isConnected: state === 1,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    if (!mongoose.connection.readyState) {
      throw new Error('Database not connected');
    }

    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    return {
      database: stats,
      collections: collections.map(col => ({
        name: col.name,
        type: col.type,
        options: col.options
      })),
      connectionInfo: checkConnection()
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkConnection,
  getDatabaseStats,
  gracefulShutdown,
  config: dbConfig
};
