import dotenv from 'dotenv';
import Joi from 'joi';
import { AppConfig, DatabaseConfig } from '../types';

// Load environment variables
dotenv.config();

// Validation schema for environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(9900),
  API_VERSION: Joi.string().default('v1'),
  
  // Database
  DB_DIALECT: Joi.string().default('sqlite'),
  DB_STORAGE: Joi.string().default('./database.sqlite3'),
  DB_LOGGING: Joi.boolean().default(false),
  
  // Security
  JWT_SECRET: Joi.string().default('your-secret-key'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  BCRYPT_ROUNDS: Joi.number().default(12),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/app.log'),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:9900'),
  
  // API
  API_KEY_HEADER: Joi.string().default('profile_id'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Application configuration
export const config: AppConfig = {
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

// Database configuration
export const databaseConfig: DatabaseConfig = {
  dialect: envVars.DB_DIALECT,
  storage: envVars.DB_STORAGE,
  logging: envVars.DB_LOGGING === 'true',
};

// Export individual configs for specific use cases
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
