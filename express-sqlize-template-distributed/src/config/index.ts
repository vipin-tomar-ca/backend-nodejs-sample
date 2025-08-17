// Configuration management for distributed architecture

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  issuer?: string;
  audience?: string;
}

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export interface LoggingConfig {
  level: string;
  format: 'json' | 'simple';
  transports: string[];
  filename?: string;
  maxSize?: string;
  maxFiles?: number;
}

export interface MetricsConfig {
  enabled: boolean;
  port?: number;
  path?: string;
  collectInterval?: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  path?: string;
  timeout?: number;
  interval?: number;
}

export interface DistributedConfig {
  serviceName: string;
  serviceId: string;
  region?: string;
  zone?: string;
  instanceId: string;
  version: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  jwt: JWTConfig;
  database: DatabaseConfig;
  redis?: RedisConfig;
  logging: LoggingConfig;
  metrics: MetricsConfig;
  healthCheck: HealthCheckConfig;
  distributed: DistributedConfig;
}

/**
 * Configuration management class
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the entire configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get a specific configuration section
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Update configuration at runtime
   */
  update<K extends keyof AppConfig>(key: K, value: Partial<AppConfig[K]>): void {
    this.config[key] = { ...this.config[key] as any, ...value };
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AppConfig {
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
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
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
        dialect: (process.env.DB_DIALECT as any) || 'sqlite',
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
        format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'json',
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

  /**
   * Validate configuration
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
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

  /**
   * Get configuration for specific environment
   */
  getEnvironmentConfig(): Partial<AppConfig> {
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

  /**
   * Export configuration for external tools
   */
  exportForExternal(): Record<string, any> {
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

// Export singleton instance
export const config = ConfigManager.getInstance();
