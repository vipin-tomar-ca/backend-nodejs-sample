export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: number;
    uptime: number;
    version: string;
    checks: {
        [key: string]: {
            status: 'healthy' | 'unhealthy' | 'degraded';
            responseTime?: number;
            error?: string;
            details?: any;
        };
    };
    metadata?: {
        serviceId: string;
        instanceId: string;
        environment: string;
        region?: string;
        zone?: string;
    };
}
export interface HealthCheck {
    name: string;
    check: () => Promise<boolean>;
    timeout?: number;
    critical?: boolean;
}
export declare class HealthCheckUtils {
    private static checks;
    private static startTime;
    static registerCheck(check: HealthCheck): void;
    static unregisterCheck(name: string): boolean;
    static runHealthChecks(): Promise<HealthCheckResult>;
    static createDatabaseHealthCheck(sequelize: any): HealthCheck;
    static createRedisHealthCheck(redisClient: any): HealthCheck;
    static createMemoryHealthCheck(threshold?: number): HealthCheck;
    static createDiskHealthCheck(path?: string, threshold?: number): HealthCheck;
    static createHttpHealthCheck(url: string, options?: {
        method?: string;
        timeout?: number;
        expectedStatus?: number;
        headers?: Record<string, string>;
    }): HealthCheck;
    static createReadinessCheck(): HealthCheck;
    static createLivenessCheck(): HealthCheck;
    static getHealthStats(): {
        totalChecks: number;
        criticalChecks: number;
        registeredChecks: string[];
    };
}
//# sourceMappingURL=health.d.ts.map