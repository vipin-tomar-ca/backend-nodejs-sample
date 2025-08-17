import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler, requestLogger, timeoutHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { sequelize } from './database/connection';
import container from './container';

// Import models to ensure they are registered
import './models';

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
    }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Slow down middleware
    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 1,
      delayMs: () => 500, // Fixed for express-slow-down v2
    });
    this.app.use(speedLimiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Timeout handler
    this.app.use(timeoutHandler);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Deel Backend Assignment - Global Payroll System',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        features: {
          core: true,
          globalPayroll: true,
          multiCurrency: true,
          compliance: true,
          sagaPattern: true,
          eventSourcing: true,
          businessRuleEngine: true,
          ioc: true,
          dependencyInjection: true,
        },
        architecture: {
          cleanArchitecture: true,
          solidPrinciples: true,
          iocContainer: true,
          businessRuleEngine: true,
          distributedTransactions: true,
          eventSourcing: true,
          multiCurrency: true,
          compliance: true,
        },
      });
    });

    // API routes
    this.app.use('/api/v1', routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Test database connection
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');

      // Sync database (in development)
      if (config.nodeEnv === 'development') {
        await sequelize.sync({ force: false });
        logger.info('Database synchronized.');
      }

      // Start server
      const port = config.port;
      this.app.listen(port, () => {
        logger.info(`🚀 Server is running on port ${port}`);
        logger.info(`📊 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 Health check: http://localhost:${port}/`);
        logger.info(`📚 API Documentation: http://localhost:${port}/api/v1/health`);
        logger.info(`🏗️ IoC Container: ${container.id} services registered`);
        logger.info(`🎯 Business Rule Engine: Ready for dynamic rule injection`);
        logger.info(`🌍 Global Payroll: Multi-currency and compliance ready`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

export default app;
