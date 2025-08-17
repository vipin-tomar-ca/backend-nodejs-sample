// Health check utilities for distributed systems

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

/**
 * Health check utilities for distributed systems
 */
export class HealthCheckUtils {
  private static checks: Map<string, HealthCheck> = new Map();
  private static startTime: number = Date.now();

  /**
   * Register a health check
   */
  static registerCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  /**
   * Unregister a health check
   */
  static unregisterCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  /**
   * Run all health checks
   */
  static async runHealthChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const results: HealthCheckResult['checks'] = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Run all checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      const checkStartTime = Date.now();
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let error: string | undefined;
      let details: any = undefined;

      try {
        const timeout = check.timeout || 5000; // 5 seconds default
        const checkPromise = check.check();
        
        const result = await Promise.race([
          checkPromise,
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), timeout)
          )
        ]);

        if (!result) {
          status = check.critical ? 'unhealthy' : 'degraded';
          error = 'Health check returned false';
        }
      } catch (err) {
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

      // Update overall status
      if (status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (status === 'degraded' && overallStatus === 'healthy') {
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

  /**
   * Create a database health check
   */
  static createDatabaseHealthCheck(sequelize: any): HealthCheck {
    return {
      name: 'database',
      critical: true,
      timeout: 3000,
      check: async () => {
        try {
          await sequelize.authenticate();
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * Create a Redis health check
   */
  static createRedisHealthCheck(redisClient: any): HealthCheck {
    return {
      name: 'redis',
      critical: false,
      timeout: 2000,
      check: async () => {
        try {
          await redisClient.ping();
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * Create a memory usage health check
   */
  static createMemoryHealthCheck(threshold: number = 0.9): HealthCheck {
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

  /**
   * Create a disk space health check
   */
  static createDiskHealthCheck(path: string = '/', threshold: number = 0.9): HealthCheck {
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
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * Create a custom HTTP health check
   */
  static createHttpHealthCheck(url: string, options: {
    method?: string;
    timeout?: number;
    expectedStatus?: number;
    headers?: Record<string, string>;
  } = {}): HealthCheck {
    return {
      name: `http-${url}`,
      critical: false,
      timeout: options.timeout || 5000,
      check: async () => {
        try {
          const https = require('https');
          const http = require('http');
          
          return new Promise<boolean>((resolve) => {
            const client = url.startsWith('https') ? https : http;
            const req = client.request(url, {
              method: options.method || 'GET',
              headers: options.headers || {},
              timeout: options.timeout || 5000,
            }, (res: any) => {
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
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * Create a readiness check
   */
  static createReadinessCheck(): HealthCheck {
    return {
      name: 'readiness',
      critical: true,
      timeout: 1000,
      check: async () => {
        // Add your readiness logic here
        // For example, check if the application has fully started
        return true;
      },
    };
  }

  /**
   * Create a liveness check
   */
  static createLivenessCheck(): HealthCheck {
    return {
      name: 'liveness',
      critical: true,
      timeout: 1000,
      check: async () => {
        // Add your liveness logic here
        // For example, check if the application is responsive
        return true;
      },
    };
  }

  /**
   * Get health check statistics
   */
  static getHealthStats(): {
    totalChecks: number;
    criticalChecks: number;
    registeredChecks: string[];
  } {
    const checks = Array.from(this.checks.values());
    return {
      totalChecks: checks.length,
      criticalChecks: checks.filter(check => check.critical).length,
      registeredChecks: checks.map(check => check.name),
    };
  }
}
