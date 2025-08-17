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
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): AppConfig;
    get<K extends keyof AppConfig>(key: K): AppConfig[K];
    update<K extends keyof AppConfig>(key: K, value: Partial<AppConfig[K]>): void;
    private loadConfig;
    validate(): {
        isValid: boolean;
        errors: string[];
    };
    getEnvironmentConfig(): Partial<AppConfig>;
    exportForExternal(): Record<string, any>;
}
export declare const config: ConfigManager;
//# sourceMappingURL=index.d.ts.map