// Distributed functionality routes

import { Router } from 'express';
import { container } from '../container';
import { HealthCheckUtils } from '../utils/health';
import { MetricsUtils } from '../utils/metrics';
import { RedisService } from '../services/RedisService';
import { config } from '../config';

const router = Router();

// Get services from container
const redisService = container.get<RedisService>('RedisService');
const metrics = MetricsUtils.getInstance();

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const healthResult = await HealthCheckUtils.runHealthChecks();
    
    const statusCode = healthResult.status === 'healthy' ? 200 : 
                      healthResult.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      status: healthResult.status,
      timestamp: healthResult.timestamp,
      uptime: healthResult.uptime,
      version: healthResult.version,
      checks: healthResult.checks,
      metadata: healthResult.metadata,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: Date.now(),
    });
  }
});

/**
 * Readiness check endpoint
 */
router.get('/ready', async (req, res) => {
  try {
    const healthResult = await HealthCheckUtils.runHealthChecks();
    const criticalChecks = Object.values(healthResult.checks).filter(
      check => check.status === 'unhealthy'
    );
    
    if (criticalChecks.length > 0) {
      return res.status(503).json({
        status: 'not ready',
        error: 'Critical health checks failed',
        failedChecks: criticalChecks.map(check => check.error),
        timestamp: Date.now(),
      });
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: 'Readiness check failed',
      timestamp: Date.now(),
    });
  }
});

/**
 * Liveness check endpoint
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now(),
    pid: process.pid,
    uptime: process.uptime(),
  });
});

/**
 * Metrics endpoint (Prometheus format)
 */
router.get('/metrics', (req, res) => {
  try {
    const prometheusMetrics = metrics.exportPrometheus();
    res.set('Content-Type', 'text/plain');
    res.status(200).send(prometheusMetrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export metrics',
      timestamp: Date.now(),
    });
  }
});

/**
 * Metrics endpoint (JSON format)
 */
router.get('/metrics/json', (req, res) => {
  try {
    const jsonMetrics = metrics.exportJSON();
    res.set('Content-Type', 'application/json');
    res.status(200).send(jsonMetrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export metrics',
      timestamp: Date.now(),
    });
  }
});

/**
 * Redis status endpoint
 */
router.get('/redis/status', async (req, res) => {
  try {
    const isConnected = redisService.isRedisConnected();
    const health = await redisService.healthCheck();
    const info = await redisService.getInfo();
    const memory = await redisService.getMemoryUsage();
    
    res.status(200).json({
      connected: isConnected,
      health: health,
      info: info,
      memory: memory,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get Redis status',
      timestamp: Date.now(),
    });
  }
});

/**
 * Cache operations endpoint
 */
router.get('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const cache = redisService.getCache();
    const value = await cache.get(key);
    
    if (value === null) {
      return res.status(404).json({
        error: 'Key not found',
        key,
        timestamp: Date.now(),
      });
    }
    
    res.status(200).json({
      key,
      value,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get cache value',
      timestamp: Date.now(),
    });
  }
});

router.post('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, ttl } = req.body;
    const cache = redisService.getCache();
    
    await cache.set(key, value, ttl);
    
    res.status(201).json({
      message: 'Cache value set successfully',
      key,
      ttl,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set cache value',
      timestamp: Date.now(),
    });
  }
});

router.delete('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const cache = redisService.getCache();
    
    await cache.delete(key);
    
    res.status(200).json({
      message: 'Cache value deleted successfully',
      key,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete cache value',
      timestamp: Date.now(),
    });
  }
});

/**
 * Distributed lock endpoint
 */
router.post('/lock/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { ttl = 30000, retryAttempts = 3, retryDelay = 1000 } = req.body;
    
    const lock = redisService.createLock(key, { ttl, retryAttempts, retryDelay });
    const acquired = await lock.acquire();
    
    if (!acquired) {
      return res.status(409).json({
        error: 'Failed to acquire lock',
        key,
        timestamp: Date.now(),
      });
    }
    
    res.status(200).json({
      message: 'Lock acquired successfully',
      key,
      ttl,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to acquire lock',
      timestamp: Date.now(),
    });
  }
});

router.delete('/lock/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const lock = redisService.createLock(key);
    const released = await lock.release();
    
    if (!released) {
      return res.status(409).json({
        error: 'Failed to release lock',
        key,
        timestamp: Date.now(),
      });
    }
    
    res.status(200).json({
      message: 'Lock released successfully',
      key,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to release lock',
      timestamp: Date.now(),
    });
  }
});

/**
 * Rate limiting test endpoint
 */
router.get('/rate-limit/test', async (req, res) => {
  try {
    const identifier = req.ip || 'unknown';
    const rateLimiter = redisService.getRateLimiter();
    const allowed = await rateLimiter.isAllowed(identifier, 10, 60000); // 10 requests per minute
    
    if (!allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        identifier,
        timestamp: Date.now(),
      });
    }
    
    res.status(200).json({
      message: 'Rate limit check passed',
      identifier,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Rate limit check failed',
      timestamp: Date.now(),
    });
  }
});

/**
 * Event bus endpoint
 */
router.post('/events/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const event = req.body;
    const eventBus = redisService.getEventBus();
    
    await eventBus.publish(channel, event);
    
    res.status(200).json({
      message: 'Event published successfully',
      channel,
      event,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to publish event',
      timestamp: Date.now(),
    });
  }
});

/**
 * Configuration endpoint
 */
router.get('/config', (req, res) => {
  try {
    const appConfig = config.getConfig();
    
    // Remove sensitive information
    const safeConfig = {
      ...appConfig,
      jwt: {
        ...appConfig.jwt,
        secret: '***HIDDEN***',
      },
      database: {
        ...appConfig.database,
        password: '***HIDDEN***',
      },
      redis: appConfig.redis ? {
        ...appConfig.redis,
        password: '***HIDDEN***',
      } : undefined,
    };
    
    res.status(200).json({
      config: safeConfig,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get configuration',
      timestamp: Date.now(),
    });
  }
});

/**
 * Service information endpoint
 */
router.get('/info', (req, res) => {
  try {
    const distributedConfig = config.get('distributed');
    const healthStats = HealthCheckUtils.getHealthStats();
    
    res.status(200).json({
      service: {
        name: distributedConfig.serviceName,
        id: distributedConfig.serviceId,
        version: distributedConfig.version,
        instanceId: distributedConfig.instanceId,
        region: distributedConfig.region,
        zone: distributedConfig.zone,
      },
      health: {
        totalChecks: healthStats.totalChecks,
        criticalChecks: healthStats.criticalChecks,
        registeredChecks: healthStats.registeredChecks,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get service information',
      timestamp: Date.now(),
    });
  }
});

export default router;
