import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import container and services
import { container } from './container';
import { initializeDatabase } from './database/connection';
import { initializeModels } from './models';
import routes from './routes';
import { RedisService } from './services/RedisService';
import { HealthCheckUtils } from './utils/health';
import { MetricsUtils } from './utils/metrics';
import { config } from './config';

// Import middleware
import { 
  errorHandler, 
  notFoundHandler, 
  correlationIdMiddleware,
  requestLoggingMiddleware 
} from './middleware/errorHandler';
import { sanitizeMiddleware } from './middleware/validation';

// Import services
import { LoggerService } from './services/LoggerService';

class Server {
  private app: express.Application;
  private port: number;
  private logger: LoggerService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.logger = container.get<LoggerService>('LoggerService');
  }

  /**
   * Initialize the server
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize database
      const sequelize = await initializeDatabase();
      
      // Initialize models
      initializeModels(sequelize);
      
      // Initialize distributed services
      await this.initializeDistributedServices();
      
      // Setup health checks
      this.setupHealthChecks(sequelize);
      
      // Setup metrics collection
      this.setupMetricsCollection();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      this.logger.info('Server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
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

    this.logger.info('Middleware setup completed');
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/', routes);

    this.logger.info('Routes setup completed');
  }

  /**
   * Initialize distributed services
   */
  private async initializeDistributedServices(): Promise<void> {
    try {
      // Initialize Redis service
      const redisService = container.get<RedisService>('RedisService');
      await redisService.initialize();
      
      this.logger.info('Distributed services initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize distributed services:', error);
      // Continue without distributed services
    }
  }

  /**
   * Setup health checks
   */
  private setupHealthChecks(sequelize: any): void {
    try {
      // Register health checks
      HealthCheckUtils.registerCheck(
        HealthCheckUtils.createDatabaseHealthCheck(sequelize)
      );
      
      HealthCheckUtils.registerCheck(
        HealthCheckUtils.createMemoryHealthCheck()
      );
      
      HealthCheckUtils.registerCheck(
        HealthCheckUtils.createReadinessCheck()
      );
      
      HealthCheckUtils.registerCheck(
        HealthCheckUtils.createLivenessCheck()
      );
      
      this.logger.info('Health checks setup completed');
    } catch (error) {
      this.logger.warn('Failed to setup health checks:', error);
    }
  }

  /**
   * Setup metrics collection
   */
  private setupMetricsCollection(): void {
    try {
      // Start periodic metrics collection
      MetricsUtils.startPeriodicCollection(
        config.get('metrics').collectInterval
      );
      
      this.logger.info('Metrics collection setup completed');
    } catch (error) {
      this.logger.warn('Failed to setup metrics collection:', error);
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler (must be before error handler)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    this.logger.info('Error handling setup completed');
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initialize();
      
      this.app.listen(this.port, () => {
        this.logger.info(`Server is running on port ${this.port}`);
        this.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        this.logger.info(`Health check: http://localhost:${this.port}/health`);
        this.logger.info(`API Documentation: http://localhost:${this.port}/api/v1`);
      });
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down server...');
    
    try {
      // Close database connections
      // await closeDatabase(sequelize);
      
      this.logger.info('Server shutdown completed');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
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

export default server;
