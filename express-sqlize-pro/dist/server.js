"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const connection_1 = require("./database/connection");
const container_1 = __importDefault(require("./container"));
require("./models");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: config_1.config.corsOrigin,
            credentials: true,
        }));
        this.app.use((0, compression_1.default)());
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: config_1.config.rateLimitWindowMs,
            max: config_1.config.rateLimitMaxRequests,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use(limiter);
        const speedLimiter = (0, express_slow_down_1.default)({
            windowMs: 15 * 60 * 1000,
            delayAfter: 1,
            delayMs: () => 500,
        });
        this.app.use(speedLimiter);
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(errorHandler_1.requestLogger);
        this.app.use(errorHandler_1.timeoutHandler);
    }
    initializeRoutes() {
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
        this.app.use('/api/v1', routes_1.default);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        try {
            await connection_1.sequelize.authenticate();
            logger_1.default.info('Database connection has been established successfully.');
            if (config_1.config.nodeEnv === 'development') {
                await connection_1.sequelize.sync({ force: false });
                logger_1.default.info('Database synchronized.');
            }
            const port = config_1.config.port;
            this.app.listen(port, () => {
                logger_1.default.info(`🚀 Server is running on port ${port}`);
                logger_1.default.info(`📊 Environment: ${config_1.config.nodeEnv}`);
                logger_1.default.info(`🔗 Health check: http://localhost:${port}/`);
                logger_1.default.info(`📚 API Documentation: http://localhost:${port}/api/v1/health`);
                logger_1.default.info(`🏗️ IoC Container: ${container_1.default.id} services registered`);
                logger_1.default.info(`🎯 Business Rule Engine: Ready for dynamic rule injection`);
                logger_1.default.info(`🌍 Global Payroll: Multi-currency and compliance ready`);
            });
        }
        catch (error) {
            logger_1.default.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.App = App;
const app = new App();
app.start().catch((error) => {
    logger_1.default.error('Failed to start application:', error);
    process.exit(1);
});
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    await connection_1.sequelize.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    await connection_1.sequelize.close();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map