require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import database and models
const { sequelize, testConnection, syncDatabase } = require('./database/connection');
const { initializeModels } = require('./models');
const { router, initializeControllers } = require('./routes');

// Import middleware
const { 
  errorHandler, 
  notFoundHandler, 
  correlationIdMiddleware,
  requestLoggingMiddleware 
} = require('./middleware/errorHandler');
const { sanitizeMiddleware } = require('./middleware/validation');

// Import logger
const logger = require('./utils/logger');

class Server {
  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
  }

  /**
   * Initialize the server
   */
  async initialize() {
    try {
      // Initialize database
      await testConnection();
      
      // Sync database (create tables) - models are initialized inside syncDatabase
      await syncDatabase(false); // false = don't force recreate tables
      
      // Get models after sync
      const { initializeModels } = require('./models');
      const models = initializeModels(sequelize);
      
      // Initialize controllers with models
      initializeControllers(models.User);
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS middleware
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request correlation ID middleware
    this.app.use(correlationIdMiddleware);

    // Request logging middleware
    this.app.use(requestLoggingMiddleware);

    // Sanitization middleware
    this.app.use(sanitizeMiddleware.sanitizeUserInput);
    this.app.use(sanitizeMiddleware.sanitizeEmail);

    logger.info('Middleware setup completed');
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // API routes
    this.app.use('/', router);

    logger.info('Routes setup completed');
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler (must be before error handler)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    logger.info('Error handling setup completed');
  }

  /**
   * Start the server
   */
  async start() {
    try {
      await this.initialize();
      
      this.app.listen(this.port, () => {
        logger.info(`Server is running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`API Documentation: http://localhost:${this.port}/api/v1`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down server...');
    
    try {
      // Close database connections
      await sequelize.close();
      
      logger.info('Server shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new Server();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.shutdown();
});

process.on('SIGINT', () => {
  server.shutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = server;
