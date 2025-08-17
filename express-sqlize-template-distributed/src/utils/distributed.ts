// Distributed Architecture Utilities

import { v4 as uuidv4 } from 'uuid';

export interface DistributedLockOptions {
  ttl: number; // Time to live in milliseconds
  retryAttempts: number;
  retryDelay: number;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedErrors: string[];
}

export interface DistributedMetrics {
  requestId: string;
  serviceId: string;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}

/**
 * Distributed Lock Implementation (Redis-based)
 */
export class DistributedLock {
  private lockKey: string;
  private lockValue: string;
  private ttl: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    private redisClient: any,
    lockKey: string,
    options: Partial<DistributedLockOptions> = {}
  ) {
    this.lockKey = `lock:${lockKey}`;
    this.lockValue = uuidv4();
    this.ttl = options.ttl || 30000; // 30 seconds default
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 second
  }

  async acquire(): Promise<boolean> {
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      const result = await this.redisClient.set(
        this.lockKey,
        this.lockValue,
        'PX',
        this.ttl,
        'NX'
      );

      if (result === 'OK') {
        return true;
      }

      if (attempt < this.retryAttempts - 1) {
        await this.sleep(this.retryDelay);
      }
    }

    return false;
  }

  async release(): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redisClient.eval(script, 1, this.lockKey, this.lockValue);
    return result === 1;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit Breaker Pattern Implementation
 */
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private recoveryTimeout: number;
  private expectedErrors: string[];

  constructor(options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold;
    this.recoveryTimeout = options.recoveryTimeout;
    this.expectedErrors = options.expectedErrors;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(error: any): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Distributed Cache with TTL
 */
export class DistributedCache {
  constructor(private redisClient: any) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.setex(key, Math.ceil(ttl / 1000), serializedValue);
      } else {
        await this.redisClient.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
}

/**
 * Distributed Rate Limiter
 */
export class DistributedRateLimiter {
  constructor(private redisClient: any) {}

  async isAllowed(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove expired entries
      await this.redisClient.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      const currentCount = await this.redisClient.zcard(key);

      if (currentCount >= limit) {
        return false;
      }

      // Add current request
      await this.redisClient.zadd(key, now, `${now}-${Math.random()}`);
      await this.redisClient.expire(key, Math.ceil(windowMs / 1000));

      return true;
    } catch (error) {
      console.error('Rate limiter error:', error);
      return true; // Allow on error
    }
  }
}

/**
 * Distributed Event Bus
 */
export class DistributedEventBus {
  private subscribers: Map<string, Function[]> = new Map();

  constructor(private redisClient: any) {
    this.setupSubscriber();
  }

  async publish(channel: string, event: any): Promise<void> {
    try {
      const message = JSON.stringify({
        id: uuidv4(),
        timestamp: Date.now(),
        data: event,
      });

      await this.redisClient.publish(channel, message);
    } catch (error) {
      console.error('Event publish error:', error);
    }
  }

  subscribe(channel: string, handler: Function): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(handler);
  }

  private async setupSubscriber(): Promise<void> {
    const subscriber = this.redisClient.duplicate();
    
    subscriber.on('message', (channel: string, message: string) => {
      try {
        const event = JSON.parse(message);
        const handlers = this.subscribers.get(channel) || [];
        
        handlers.forEach(handler => {
          handler(event);
        });
      } catch (error) {
        console.error('Event handling error:', error);
      }
    });

    // Subscribe to all channels
    for (const channel of this.subscribers.keys()) {
      await subscriber.subscribe(channel);
    }
  }
}

/**
 * Generate distributed request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Generate service instance ID
 */
export function generateServiceId(): string {
  return `${process.env.SERVICE_NAME || 'unknown'}-${process.pid}-${Date.now()}`;
}

/**
 * Distributed transaction coordinator
 */
export class DistributedTransactionCoordinator {
  private transactions: Map<string, any> = new Map();

  async beginTransaction(transactionId: string): Promise<void> {
    this.transactions.set(transactionId, {
      id: transactionId,
      status: 'pending',
      participants: [],
      startTime: Date.now(),
    });
  }

  async commitTransaction(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return false;
    }

    // Implement 2PC (Two-Phase Commit) logic here
    try {
      // Phase 1: Prepare
      const allPrepared = await this.preparePhase(transaction);
      if (!allPrepared) {
        await this.rollbackTransaction(transactionId);
        return false;
      }

      // Phase 2: Commit
      await this.commitPhase(transaction);
      transaction.status = 'committed';
      return true;
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      return false;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.status = 'rolled_back';
      // Implement rollback logic for all participants
    }
  }

  private async preparePhase(transaction: any): Promise<boolean> {
    // Implement prepare phase logic
    return true;
  }

  private async commitPhase(transaction: any): Promise<void> {
    // Implement commit phase logic
  }
}
