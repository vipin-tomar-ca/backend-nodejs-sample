"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedTransactionCoordinator = exports.DistributedEventBus = exports.DistributedRateLimiter = exports.DistributedCache = exports.CircuitBreaker = exports.DistributedLock = void 0;
exports.generateRequestId = generateRequestId;
exports.generateServiceId = generateServiceId;
const uuid_1 = require("uuid");
class DistributedLock {
    constructor(redisClient, lockKey, options = {}) {
        this.redisClient = redisClient;
        this.lockKey = `lock:${lockKey}`;
        this.lockValue = (0, uuid_1.v4)();
        this.ttl = options.ttl || 30000;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }
    async acquire() {
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            const result = await this.redisClient.set(this.lockKey, this.lockValue, 'PX', this.ttl, 'NX');
            if (result === 'OK') {
                return true;
            }
            if (attempt < this.retryAttempts - 1) {
                await this.sleep(this.retryDelay);
            }
        }
        return false;
    }
    async release() {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.DistributedLock = DistributedLock;
class CircuitBreaker {
    constructor(options) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.failureThreshold = options.failureThreshold;
        this.recoveryTimeout = options.recoveryTimeout;
        this.expectedErrors = options.expectedErrors;
    }
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.state = 'HALF_OPEN';
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    onFailure(error) {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    shouldAttemptReset() {
        return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failureCount;
    }
}
exports.CircuitBreaker = CircuitBreaker;
class DistributedCache {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async get(key) {
        try {
            const value = await this.redisClient.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.redisClient.setex(key, Math.ceil(ttl / 1000), serializedValue);
            }
            else {
                await this.redisClient.set(key, serializedValue);
            }
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async delete(key) {
        try {
            await this.redisClient.del(key);
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    async exists(key) {
        try {
            const result = await this.redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
}
exports.DistributedCache = DistributedCache;
class DistributedRateLimiter {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async isAllowed(identifier, limit, windowMs) {
        const key = `rate_limit:${identifier}`;
        const now = Date.now();
        const windowStart = now - windowMs;
        try {
            await this.redisClient.zremrangebyscore(key, 0, windowStart);
            const currentCount = await this.redisClient.zcard(key);
            if (currentCount >= limit) {
                return false;
            }
            await this.redisClient.zadd(key, now, `${now}-${Math.random()}`);
            await this.redisClient.expire(key, Math.ceil(windowMs / 1000));
            return true;
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            return true;
        }
    }
}
exports.DistributedRateLimiter = DistributedRateLimiter;
class DistributedEventBus {
    constructor(redisClient) {
        this.redisClient = redisClient;
        this.subscribers = new Map();
        this.setupSubscriber();
    }
    async publish(channel, event) {
        try {
            const message = JSON.stringify({
                id: (0, uuid_1.v4)(),
                timestamp: Date.now(),
                data: event,
            });
            await this.redisClient.publish(channel, message);
        }
        catch (error) {
            console.error('Event publish error:', error);
        }
    }
    subscribe(channel, handler) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, []);
        }
        this.subscribers.get(channel).push(handler);
    }
    async setupSubscriber() {
        const subscriber = this.redisClient.duplicate();
        subscriber.on('message', (channel, message) => {
            try {
                const event = JSON.parse(message);
                const handlers = this.subscribers.get(channel) || [];
                handlers.forEach(handler => {
                    handler(event);
                });
            }
            catch (error) {
                console.error('Event handling error:', error);
            }
        });
        for (const channel of this.subscribers.keys()) {
            await subscriber.subscribe(channel);
        }
    }
}
exports.DistributedEventBus = DistributedEventBus;
function generateRequestId() {
    return (0, uuid_1.v4)();
}
function generateServiceId() {
    return `${process.env.SERVICE_NAME || 'unknown'}-${process.pid}-${Date.now()}`;
}
class DistributedTransactionCoordinator {
    constructor() {
        this.transactions = new Map();
    }
    async beginTransaction(transactionId) {
        this.transactions.set(transactionId, {
            id: transactionId,
            status: 'pending',
            participants: [],
            startTime: Date.now(),
        });
    }
    async commitTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            return false;
        }
        try {
            const allPrepared = await this.preparePhase(transaction);
            if (!allPrepared) {
                await this.rollbackTransaction(transactionId);
                return false;
            }
            await this.commitPhase(transaction);
            transaction.status = 'committed';
            return true;
        }
        catch (error) {
            await this.rollbackTransaction(transactionId);
            return false;
        }
    }
    async rollbackTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (transaction) {
            transaction.status = 'rolled_back';
        }
    }
    async preparePhase(transaction) {
        return true;
    }
    async commitPhase(transaction) {
    }
}
exports.DistributedTransactionCoordinator = DistributedTransactionCoordinator;
//# sourceMappingURL=distributed.js.map