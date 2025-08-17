"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.ConfigManager = void 0;
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    get(key) {
        return this.config[key];
    }
    update(key, value) {
        this.config[key] = { ...this.config[key], ...value };
    }
    loadConfig() {
        return {
            port: parseInt(process.env.PORT || '3000'),
            environment: process.env.NODE_ENV || 'development',
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
            },
            rateLimit: {
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
                max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
                message: 'Too many requests from this IP, please try again later.',
                standardHeaders: true,
                legacyHeaders: false,
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'your-secret-key',
                expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE,
            },
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                database: process.env.DB_NAME || 'template_db',
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                dialect: process.env.DB_DIALECT || 'sqlite',
                logging: process.env.NODE_ENV === 'development',
                pool: {
                    max: parseInt(process.env.DB_POOL_MAX || '5'),
                    min: parseInt(process.env.DB_POOL_MIN || '0'),
                    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
                    idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
                },
            },
            redis: process.env.REDIS_HOST ? {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0'),
                retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
                maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
            } : undefined,
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: process.env.LOG_FORMAT || 'json',
                transports: (process.env.LOG_TRANSPORTS || 'console,file').split(','),
                filename: process.env.LOG_FILENAME || 'logs/app.log',
                maxSize: process.env.LOG_MAX_SIZE || '20m',
                maxFiles: parseInt(process.env.LOG_MAX_FILES || '14'),
            },
            metrics: {
                enabled: process.env.METRICS_ENABLED === 'true',
                port: parseInt(process.env.METRICS_PORT || '9090'),
                path: process.env.METRICS_PATH || '/metrics',
                collectInterval: parseInt(process.env.METRICS_COLLECT_INTERVAL || '60000'),
            },
            healthCheck: {
                enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
                path: process.env.HEALTH_CHECK_PATH || '/health',
                timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
                interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
            },
            distributed: {
                serviceName: process.env.SERVICE_NAME || 'express-template',
                serviceId: `${process.env.SERVICE_NAME || 'express-template'}-${process.pid}`,
                region: process.env.AWS_REGION || process.env.REGION,
                zone: process.env.AWS_AVAILABILITY_ZONE || process.env.ZONE,
                instanceId: `${process.pid}-${Date.now()}`,
                version: process.env.npm_package_version || '1.0.0',
            },
        };
    }
    validate() {
        const errors = [];
        if (!this.config.jwt.secret || this.config.jwt.secret === 'your-secret-key') {
            errors.push('JWT_SECRET must be set to a secure value');
        }
        if (this.config.environment === 'production') {
            if (this.config.cors.origin === '*') {
                errors.push('CORS_ORIGIN should be restricted in production');
            }
        }
        if (this.config.database.dialect === 'sqlite' && this.config.database.host !== 'localhost') {
            errors.push('SQLite dialect should use localhost as host');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    getEnvironmentConfig() {
        const env = this.config.environment;
        switch (env) {
            case 'development':
                return {
                    logging: {
                        ...this.config.logging,
                        level: 'debug',
                        format: 'simple',
                    },
                    database: {
                        ...this.config.database,
                        logging: true,
                    },
                };
            case 'test':
                return {
                    database: {
                        ...this.config.database,
                        database: 'test_db',
                        logging: false,
                    },
                    logging: {
                        ...this.config.logging,
                        level: 'error',
                    },
                };
            case 'production':
                return {
                    logging: {
                        ...this.config.logging,
                        level: 'warn',
                        format: 'json',
                    },
                    database: {
                        ...this.config.database,
                        logging: false,
                        pool: {
                            ...this.config.database.pool,
                            max: 10,
                        },
                    },
                };
            default:
                return {};
        }
    }
    exportForExternal() {
        return {
            app: {
                port: this.config.port,
                environment: this.config.environment,
            },
            database: {
                host: this.config.database.host,
                port: this.config.database.port,
                database: this.config.database.database,
                dialect: this.config.database.dialect,
            },
            redis: this.config.redis ? {
                host: this.config.redis.host,
                port: this.config.redis.port,
            } : null,
            distributed: this.config.distributed,
        };
    }
}
exports.ConfigManager = ConfigManager;
exports.config = ConfigManager.getInstance();
//# sourceMappingURL=index.js.map