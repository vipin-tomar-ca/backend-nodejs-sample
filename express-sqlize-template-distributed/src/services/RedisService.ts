// Redis Service for distributed functionality

import { injectable, inject } from '../container/ioc';
import { LoggerService } from './LoggerService';
import { config } from '../config';
import { 
  DistributedCache, 
  DistributedLock, 
  DistributedRateLimiter, 
  DistributedEventBus 
} from '../utils/distributed';

@injectable()
export class RedisService {
  private redisClient: any;
  private cache: DistributedCache;
  private rateLimiter: DistributedRateLimiter;
  private eventBus: DistributedEventBus;
  private logger: LoggerService;
  private isConnected: boolean = false;

  constructor(
    @inject('LoggerService') logger: LoggerService
  ) {
    this.logger = logger;
  }

  /**
   * Initialize Redis connection
   */
  async initialize(): Promise<void> {
    try {
      const redisConfig = config.get('redis');
      
      if (!redisConfig) {
        this.logger.warn('Redis configuration not found, distributed features will be disabled');
        return;
      }

      // Import Redis client dynamically
      const Redis = require('ioredis');
      
      this.redisClient = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db || 0,
        retryDelayOnFailover: redisConfig.retryDelayOnFailover || 100,
        maxRetriesPerRequest: redisConfig.maxRetriesPerRequest || 3,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      // Setup event handlers
      this.redisClient.on('connect', () => {
        this.logger.info('Redis connected');
        this.isConnected = true;
      });

      this.redisClient.on('ready', () => {
        this.logger.info('Redis ready');
      });

      this.redisClient.on('error', (error: any) => {
        this.logger.error('Redis error:', error);
        this.isConnected = false;
      });

      this.redisClient.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.info('Redis reconnecting...');
      });

      // Connect to Redis
      await this.redisClient.connect();

      // Initialize distributed services
      this.cache = new DistributedCache(this.redisClient);
      this.rateLimiter = new DistributedRateLimiter(this.redisClient);
      this.eventBus = new DistributedEventBus(this.redisClient);

      this.logger.info('Redis service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis service:', error);
      throw error;
    }
  }

  /**
   * Get Redis client
   */
  getClient(): any {
    return this.redisClient;
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.redisClient?.status === 'ready';
  }

  /**
   * Get distributed cache instance
   */
  getCache(): DistributedCache {
    if (!this.cache) {
      throw new Error('Redis cache not initialized');
    }
    return this.cache;
  }

  /**
   * Get distributed rate limiter instance
   */
  getRateLimiter(): DistributedRateLimiter {
    if (!this.rateLimiter) {
      throw new Error('Redis rate limiter not initialized');
    }
    return this.rateLimiter;
  }

  /**
   * Get distributed event bus instance
   */
  getEventBus(): DistributedEventBus {
    if (!this.eventBus) {
      throw new Error('Redis event bus not initialized');
    }
    return this.eventBus;
  }

  /**
   * Create a distributed lock
   */
  createLock(lockKey: string, options?: any): DistributedLock {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }
    return new DistributedLock(this.redisClient, lockKey, options);
  }

  /**
   * Execute a command with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Redis operation failed (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Health check for Redis
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<any> {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const info = await this.redisClient.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error);
      return null;
    }
  }

  /**
   * Get Redis memory usage
   */
  async getMemoryUsage(): Promise<any> {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const memory = await this.redisClient.memory('usage');
      return memory;
    } catch (error) {
      this.logger.error('Failed to get Redis memory usage:', error);
      return null;
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll(): Promise<void> {
    try {
      if (!this.isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      await this.redisClient.flushall();
      this.logger.info('Redis flushed all data');
    } catch (error) {
      this.logger.error('Failed to flush Redis:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        this.logger.info('Redis connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  /**
   * Parse Redis INFO command output
   */
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
