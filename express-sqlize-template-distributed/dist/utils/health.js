"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckUtils = void 0;
class HealthCheckUtils {
    static registerCheck(check) {
        this.checks.set(check.name, check);
    }
    static unregisterCheck(name) {
        return this.checks.delete(name);
    }
    static async runHealthChecks() {
        const startTime = Date.now();
        const results = {};
        let overallStatus = 'healthy';
        const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
            const checkStartTime = Date.now();
            let status = 'healthy';
            let error;
            let details = undefined;
            try {
                const timeout = check.timeout || 5000;
                const checkPromise = check.check();
                const result = await Promise.race([
                    checkPromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), timeout))
                ]);
                if (!result) {
                    status = check.critical ? 'unhealthy' : 'degraded';
                    error = 'Health check returned false';
                }
            }
            catch (err) {
                status = check.critical ? 'unhealthy' : 'degraded';
                error = err instanceof Error ? err.message : 'Unknown error';
                details = err;
            }
            const responseTime = Date.now() - checkStartTime;
            results[name] = {
                status,
                responseTime,
                error,
                details,
            };
            if (status === 'unhealthy') {
                overallStatus = 'unhealthy';
            }
            else if (status === 'degraded' && overallStatus === 'healthy') {
                overallStatus = 'degraded';
            }
        });
        await Promise.all(checkPromises);
        return {
            status: overallStatus,
            timestamp: Date.now(),
            uptime: Date.now() - this.startTime,
            version: process.env.npm_package_version || '1.0.0',
            checks: results,
            metadata: {
                serviceId: process.env.SERVICE_NAME || 'unknown',
                instanceId: `${process.pid}-${Date.now()}`,
                environment: process.env.NODE_ENV || 'development',
                region: process.env.AWS_REGION || process.env.REGION,
                zone: process.env.AWS_AVAILABILITY_ZONE || process.env.ZONE,
            },
        };
    }
    static createDatabaseHealthCheck(sequelize) {
        return {
            name: 'database',
            critical: true,
            timeout: 3000,
            check: async () => {
                try {
                    await sequelize.authenticate();
                    return true;
                }
                catch (error) {
                    return false;
                }
            },
        };
    }
    static createRedisHealthCheck(redisClient) {
        return {
            name: 'redis',
            critical: false,
            timeout: 2000,
            check: async () => {
                try {
                    await redisClient.ping();
                    return true;
                }
                catch (error) {
                    return false;
                }
            },
        };
    }
    static createMemoryHealthCheck(threshold = 0.9) {
        return {
            name: 'memory',
            critical: false,
            timeout: 1000,
            check: async () => {
                const usage = process.memoryUsage();
                const heapUsedRatio = usage.heapUsed / usage.heapTotal;
                return heapUsedRatio < threshold;
            },
        };
    }
    static createDiskHealthCheck(path = '/', threshold = 0.9) {
        return {
            name: 'disk',
            critical: false,
            timeout: 2000,
            check: async () => {
                try {
                    const fs = require('fs');
                    const stats = fs.statfsSync(path);
                    const freeRatio = stats.bavail / stats.blocks;
                    return freeRatio > (1 - threshold);
                }
                catch (error) {
                    return false;
                }
            },
        };
    }
    static createHttpHealthCheck(url, options = {}) {
        return {
            name: `http-${url}`,
            critical: false,
            timeout: options.timeout || 5000,
            check: async () => {
                try {
                    const https = require('https');
                    const http = require('http');
                    return new Promise((resolve) => {
                        const client = url.startsWith('https') ? https : http;
                        const req = client.request(url, {
                            method: options.method || 'GET',
                            headers: options.headers || {},
                            timeout: options.timeout || 5000,
                        }, (res) => {
                            const expectedStatus = options.expectedStatus || 200;
                            resolve(res.statusCode === expectedStatus);
                        });
                        req.on('error', () => resolve(false));
                        req.on('timeout', () => {
                            req.destroy();
                            resolve(false);
                        });
                        req.end();
                    });
                }
                catch (error) {
                    return false;
                }
            },
        };
    }
    static createReadinessCheck() {
        return {
            name: 'readiness',
            critical: true,
            timeout: 1000,
            check: async () => {
                return true;
            },
        };
    }
    static createLivenessCheck() {
        return {
            name: 'liveness',
            critical: true,
            timeout: 1000,
            check: async () => {
                return true;
            },
        };
    }
    static getHealthStats() {
        const checks = Array.from(this.checks.values());
        return {
            totalChecks: checks.length,
            criticalChecks: checks.filter(check => check.critical).length,
            registeredChecks: checks.map(check => check.name),
        };
    }
}
exports.HealthCheckUtils = HealthCheckUtils;
HealthCheckUtils.checks = new Map();
HealthCheckUtils.startTime = Date.now();
//# sourceMappingURL=health.js.map