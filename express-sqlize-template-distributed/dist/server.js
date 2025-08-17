"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const container_1 = require("./container");
const connection_1 = require("./database/connection");
const models_1 = require("./models");
const routes_1 = __importDefault(require("./routes"));
const health_1 = require("./utils/health");
const metrics_1 = require("./utils/metrics");
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const validation_1 = require("./middleware/validation");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3000');
        this.logger = container_1.container.get('LoggerService');
    }
    async initialize() {
        try {
            const sequelize = await (0, connection_1.initializeDatabase)();
            (0, models_1.initializeModels)(sequelize);
            await this.initializeDistributedServices();
            this.setupHealthChecks(sequelize);
            this.setupMetricsCollection();
            this.setupMiddleware();
            this.setupRoutes();
            this.setupErrorHandling();
            this.logger.info('Server initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize server:', error);
            throw error;
        }
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(errorHandler_1.correlationIdMiddleware);
        this.app.use(errorHandler_1.requestLoggingMiddleware);
        this.app.use(validation_1.sanitizeMiddleware.sanitizeUserInput);
        this.app.use(validation_1.sanitizeMiddleware.sanitizeEmail);
        this.logger.info('Middleware setup completed');
    }
    setupRoutes() {
        this.app.use('/', routes_1.default);
        this.logger.info('Routes setup completed');
    }
    async initializeDistributedServices() {
        try {
            const redisService = container_1.container.get('RedisService');
            await redisService.initialize();
            this.logger.info('Distributed services initialized successfully');
        }
        catch (error) {
            this.logger.warn('Failed to initialize distributed services:', error);
        }
    }
    setupHealthChecks(sequelize) {
        try {
            health_1.HealthCheckUtils.registerCheck(health_1.HealthCheckUtils.createDatabaseHealthCheck(sequelize));
            health_1.HealthCheckUtils.registerCheck(health_1.HealthCheckUtils.createMemoryHealthCheck());
            health_1.HealthCheckUtils.registerCheck(health_1.HealthCheckUtils.createReadinessCheck());
            health_1.HealthCheckUtils.registerCheck(health_1.HealthCheckUtils.createLivenessCheck());
            this.logger.info('Health checks setup completed');
        }
        catch (error) {
            this.logger.warn('Failed to setup health checks:', error);
        }
    }
    setupMetricsCollection() {
        try {
            metrics_1.MetricsUtils.startPeriodicCollection(config_1.config.get('metrics').collectInterval);
            this.logger.info('Metrics collection setup completed');
        }
        catch (error) {
            this.logger.warn('Failed to setup metrics collection:', error);
        }
    }
    setupErrorHandling() {
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
        this.logger.info('Error handling setup completed');
    }
    async start() {
        try {
            await this.initialize();
            this.app.listen(this.port, () => {
                this.logger.info(`Server is running on port ${this.port}`);
                this.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
                this.logger.info(`Health check: http://localhost:${this.port}/health`);
                this.logger.info(`API Documentation: http://localhost:${this.port}/api/v1`);
            });
        }
        catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        this.logger.info('Shutting down server...');
        try {
            this.logger.info('Server shutdown completed');
            process.exit(0);
        }
        catch (error) {
            this.logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}
const server = new Server();
process.on('SIGTERM', () => {
    server.shutdown();
});
process.on('SIGINT', () => {
    server.shutdown();
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map