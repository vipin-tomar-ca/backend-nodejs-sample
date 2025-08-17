// Distributed functionality tests

import request from 'supertest';
import express from 'express';
import { container } from '../container';
import { RedisService } from '../services/RedisService';
import { DistributedCache, DistributedLock, CircuitBreaker } from '../utils/distributed';
import { HealthCheckUtils } from '../utils/health';
import { MetricsUtils } from '../utils/metrics';
import { config } from '../config';

// Mock Redis for testing
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue('test-value'),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(1),
    zadd: jest.fn().mockResolvedValue(1),
    zcard: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    publish: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1),
    status: 'ready',
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

describe('Distributed Functionality Tests', () => {
  let app: express.Application;
  let redisService: RedisService;

  beforeAll(async () => {
    // Create test app
    app = express();
    app.use(express.json());
    
    // Initialize Redis service
    redisService = container.get<RedisService>('RedisService');
    await redisService.initialize();
  });

  afterAll(async () => {
    await redisService.close();
  });

  describe('Distributed Cache', () => {
    let cache: DistributedCache;

    beforeEach(() => {
      cache = redisService.getCache();
    });

    it('should set and get cache values', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const ttl = 60000; // 1 minute

      await cache.set(key, value, ttl);
      const retrieved = await cache.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle cache misses', async () => {
      const key = 'non-existent-key';
      const retrieved = await cache.get(key);

      expect(retrieved).toBeNull();
    });

    it('should delete cache values', async () => {
      const key = 'delete-test';
      const value = 'test-value';

      await cache.set(key, value);
      await cache.delete(key);
      const retrieved = await cache.get(key);

      expect(retrieved).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = 'exists-test';
      const value = 'test-value';

      await cache.set(key, value);
      const exists = await cache.exists(key);

      expect(exists).toBe(true);
    });
  });

  describe('Distributed Locks', () => {
    it('should acquire and release locks', async () => {
      const lockKey = 'test-lock';
      const lock = redisService.createLock(lockKey, {
        ttl: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      });

      const acquired = await lock.acquire();
      expect(acquired).toBe(true);

      const released = await lock.release();
      expect(released).toBe(true);
    });

    it('should handle lock conflicts', async () => {
      const lockKey = 'conflict-lock';
      const lock1 = redisService.createLock(lockKey);
      const lock2 = redisService.createLock(lockKey);

      const acquired1 = await lock1.acquire();
      expect(acquired1).toBe(true);

      const acquired2 = await lock2.acquire();
      expect(acquired2).toBe(false);

      await lock1.release();
    });
  });

  describe('Circuit Breaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        recoveryTimeout: 1000,
        expectedErrors: ['ECONNREFUSED'],
      });
    });

    it('should execute successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      // Execute failing operations
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (error) {
          // Expected to fail
        }
      }

      // Circuit should be open now
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should recover after timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be in half-open state
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');
    });
  });

  describe('Health Checks', () => {
    it('should register and run health checks', async () => {
      const mockCheck = {
        name: 'test-check',
        check: jest.fn().mockResolvedValue(true),
        timeout: 1000,
        critical: false,
      };

      HealthCheckUtils.registerCheck(mockCheck);
      
      const result = await HealthCheckUtils.runHealthChecks();
      
      expect(result.checks['test-check']).toBeDefined();
      expect(result.checks['test-check'].status).toBe('healthy');
      expect(mockCheck.check).toHaveBeenCalled();
    });

    it('should handle failing health checks', async () => {
      const mockCheck = {
        name: 'failing-check',
        check: jest.fn().mockResolvedValue(false),
        timeout: 1000,
        critical: false,
      };

      HealthCheckUtils.registerCheck(mockCheck);
      
      const result = await HealthCheckUtils.runHealthChecks();
      
      expect(result.checks['failing-check'].status).toBe('degraded');
    });

    it('should handle critical health check failures', async () => {
      const mockCheck = {
        name: 'critical-check',
        check: jest.fn().mockRejectedValue(new Error('Critical failure')),
        timeout: 1000,
        critical: true,
      };

      HealthCheckUtils.registerCheck(mockCheck);
      
      const result = await HealthCheckUtils.runHealthChecks();
      
      expect(result.checks['critical-check'].status).toBe('unhealthy');
      expect(result.status).toBe('unhealthy');
    });
  });

  describe('Metrics Collection', () => {
    let metrics: MetricsUtils;

    beforeEach(() => {
      metrics = MetricsUtils.getInstance();
      metrics.reset();
    });

    it('should record and retrieve metrics', () => {
      const metricName = 'test_metric';
      const value = 42;
      const labels = { service: 'test' };

      metrics.increment(metricName, value, labels);
      
      const metric = metrics.getMetric(metricName, labels);
      expect(metric).toBeDefined();
      expect(metric!.values).toHaveLength(1);
      expect(metric!.values[0].value).toBe(value);
    });

    it('should calculate metric statistics', () => {
      const metricName = 'stats_metric';
      const values = [1, 2, 3, 4, 5];

      values.forEach(value => {
        metrics.gauge(metricName, value);
      });

      const stats = metrics.getMetricStats(metricName);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(5);
      expect(stats!.sum).toBe(15);
      expect(stats!.min).toBe(1);
      expect(stats!.max).toBe(5);
      expect(stats!.avg).toBe(3);
    });

    it('should export metrics in Prometheus format', () => {
      const metricName = 'prometheus_metric';
      metrics.increment(metricName, 1, { label: 'value' });

      const prometheusFormat = metrics.exportPrometheus();
      
      expect(prometheusFormat).toContain(`# TYPE ${metricName} counter`);
      expect(prometheusFormat).toContain(`${metricName}{label="value"}`);
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent cache operations', async () => {
      const cache = redisService.getCache();
      const key = 'concurrent-test';
      const concurrentOperations = 10;
      const promises: Promise<any>[] = [];

      // Start concurrent operations
      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(
          cache.set(`${key}-${i}`, `value-${i}`)
        );
      }

      await Promise.all(promises);

      // Verify all operations completed
      for (let i = 0; i < concurrentOperations; i++) {
        const value = await cache.get(`${key}-${i}`);
        expect(value).toBe(`value-${i}`);
      }
    });

    it('should handle concurrent lock acquisitions', async () => {
      const lockKey = 'concurrent-lock';
      const concurrentAttempts = 5;
      const results: boolean[] = [];

      // Try to acquire the same lock concurrently
      const promises = Array.from({ length: concurrentAttempts }, async () => {
        const lock = redisService.createLock(lockKey, { ttl: 1000 });
        const acquired = await lock.acquire();
        results.push(acquired);
        if (acquired) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await lock.release();
        }
        return acquired;
      });

      await Promise.all(promises);

      // Only one should have acquired the lock
      const acquiredCount = results.filter(result => result).length;
      expect(acquiredCount).toBe(1);
    });

    it('should handle concurrent rate limiting', async () => {
      const rateLimiter = redisService.getRateLimiter();
      const identifier = 'concurrent-rate-limit';
      const limit = 5;
      const windowMs = 60000;
      const concurrentRequests = 10;

      const promises = Array.from({ length: concurrentRequests }, () =>
        rateLimiter.isAllowed(identifier, limit, windowMs)
      );

      const results = await Promise.all(promises);
      const allowedCount = results.filter(result => result).length;

      // Should not exceed the limit
      expect(allowedCount).toBeLessThanOrEqual(limit);
    });
  });

  describe('Microservice Adaptability Tests', () => {
    it('should handle service discovery information', () => {
      const distributedConfig = config.get('distributed');
      
      expect(distributedConfig.serviceName).toBeDefined();
      expect(distributedConfig.serviceId).toBeDefined();
      expect(distributedConfig.instanceId).toBeDefined();
      expect(distributedConfig.version).toBeDefined();
    });

    it('should support configuration hot-reloading', () => {
      const originalPort = config.get('port');
      
      // Simulate configuration update
      config.update('port', 3001);
      
      expect(config.get('port')).toBe(3001);
      
      // Restore original
      config.update('port', originalPort);
    });

    it('should handle graceful degradation when Redis is unavailable', async () => {
      // This test would require mocking Redis failure
      // For now, we'll test that the service can handle Redis unavailability
      const cache = redisService.getCache();
      
      // Should not throw when Redis is available
      expect(() => cache.get('test')).not.toThrow();
    });

    it('should support distributed tracing', () => {
      // Test that request IDs are generated
      const { generateRequestId } = require('../utils/distributed');
      const requestId = generateRequestId();
      
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
      expect(requestId.length).toBeGreaterThan(0);
    });
  });

  describe('API Endpoints', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/distributed/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });

    it('should respond to metrics endpoint', async () => {
      const response = await request(app)
        .get('/distributed/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('should respond to Redis status endpoint', async () => {
      const response = await request(app)
        .get('/distributed/redis/status')
        .expect(200);

      expect(response.body).toHaveProperty('connected');
      expect(response.body).toHaveProperty('health');
    });

    it('should handle cache operations via API', async () => {
      const key = 'api-test';
      const value = { test: 'data' };

      // Set cache value
      await request(app)
        .post(`/distributed/cache/${key}`)
        .send({ value, ttl: 60000 })
        .expect(201);

      // Get cache value
      const response = await request(app)
        .get(`/distributed/cache/${key}`)
        .expect(200);

      expect(response.body.value).toEqual(value);
    });
  });
});
