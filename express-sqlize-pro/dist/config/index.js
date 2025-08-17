"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.databaseConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const envSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid('development', 'production', 'test').default('development'),
    PORT: joi_1.default.number().default(9900),
    API_VERSION: joi_1.default.string().default('v1'),
    DB_DIALECT: joi_1.default.string().default('sqlite'),
    DB_STORAGE: joi_1.default.string().default('./database.sqlite3'),
    DB_LOGGING: joi_1.default.boolean().default(false),
    JWT_SECRET: joi_1.default.string().default('your-secret-key'),
    JWT_EXPIRES_IN: joi_1.default.string().default('24h'),
    BCRYPT_ROUNDS: joi_1.default.number().default(12),
    RATE_LIMIT_WINDOW_MS: joi_1.default.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: joi_1.default.number().default(100),
    LOG_LEVEL: joi_1.default.string().valid('error', 'warn', 'info', 'debug').default('info'),
    LOG_FILE_PATH: joi_1.default.string().default('./logs/app.log'),
    CORS_ORIGIN: joi_1.default.string().default('http://localhost:9900'),
    API_KEY_HEADER: joi_1.default.string().default('profile_id'),
}).unknown();
const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.config = {
    port: parseInt(envVars.PORT, 10),
    nodeEnv: envVars.NODE_ENV,
    apiVersion: envVars.API_VERSION,
    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN,
    bcryptRounds: parseInt(envVars.BCRYPT_ROUNDS, 10),
    rateLimitWindowMs: parseInt(envVars.RATE_LIMIT_WINDOW_MS, 10),
    rateLimitMaxRequests: parseInt(envVars.RATE_LIMIT_MAX_REQUESTS, 10),
    logLevel: envVars.LOG_LEVEL,
    logFilePath: envVars.LOG_FILE_PATH,
    corsOrigin: envVars.CORS_ORIGIN,
    apiKeyHeader: envVars.API_KEY_HEADER,
};
exports.databaseConfig = {
    dialect: envVars.DB_DIALECT,
    storage: envVars.DB_STORAGE,
    logging: envVars.DB_LOGGING === 'true',
};
exports.isDevelopment = exports.config.nodeEnv === 'development';
exports.isProduction = exports.config.nodeEnv === 'production';
exports.isTest = exports.config.nodeEnv === 'test';
//# sourceMappingURL=index.js.map