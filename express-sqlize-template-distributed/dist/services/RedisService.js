"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const ioc_1 = require("../container/ioc");
const LoggerService_1 = require("./LoggerService");
const config_1 = require("../config");
const distributed_1 = require("../utils/distributed");
let RedisService = class RedisService {
    constructor(logger) {
        this.isConnected = false;
        this.logger = logger;
    }
    async initialize() {
        try {
            const redisConfig = config_1.config.get('redis');
            if (!redisConfig) {
                this.logger.warn('Redis configuration not found, distributed features will be disabled');
                return;
            }
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
            this.redisClient.on('connect', () => {
                this.logger.info('Redis connected');
                this.isConnected = true;
            });
            this.redisClient.on('ready', () => {
                this.logger.info('Redis ready');
            });
            this.redisClient.on('error', (error) => {
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
            await this.redisClient.connect();
            this.cache = new distributed_1.DistributedCache(this.redisClient);
            this.rateLimiter = new distributed_1.DistributedRateLimiter(this.redisClient);
            this.eventBus = new distributed_1.DistributedEventBus(this.redisClient);
            this.logger.info('Redis service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis service:', error);
            throw error;
        }
    }
    getClient() {
        return this.redisClient;
    }
    isRedisConnected() {
        return this.isConnected && this.redisClient?.status === 'ready';
    }
    getCache() {
        if (!this.cache) {
            throw new Error('Redis cache not initialized');
        }
        return this.cache;
    }
    getRateLimiter() {
        if (!this.rateLimiter) {
            throw new Error('Redis rate limiter not initialized');
        }
        return this.rateLimiter;
    }
    getEventBus() {
        if (!this.eventBus) {
            throw new Error('Redis event bus not initialized');
        }
        return this.eventBus;
    }
    createLock(lockKey, options) {
        if (!this.redisClient) {
            throw new Error('Redis client not initialized');
        }
        return new distributed_1.DistributedLock(this.redisClient, lockKey, options);
    }
    async executeWithRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Redis operation failed (attempt ${attempt}/${maxRetries}):`, error);
                if (attempt < maxRetries) {
                    await this.sleep(delay * attempt);
                }
            }
        }
        throw lastError;
    }
    async healthCheck() {
        try {
            if (!this.isRedisConnected()) {
                return false;
            }
            await this.redisClient.ping();
            return true;
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    async getInfo() {
        try {
            if (!this.isRedisConnected()) {
                return null;
            }
            const info = await this.redisClient.info();
            return this.parseRedisInfo(info);
        }
        catch (error) {
            this.logger.error('Failed to get Redis info:', error);
            return null;
        }
    }
    async getMemoryUsage() {
        try {
            if (!this.isRedisConnected()) {
                return null;
            }
            const memory = await this.redisClient.memory('usage');
            return memory;
        }
        catch (error) {
            this.logger.error('Failed to get Redis memory usage:', error);
            return null;
        }
    }
    async flushAll() {
        try {
            if (!this.isRedisConnected()) {
                throw new Error('Redis not connected');
            }
            await this.redisClient.flushall();
            this.logger.info('Redis flushed all data');
        }
        catch (error) {
            this.logger.error('Failed to flush Redis:', error);
            throw error;
        }
    }
    async close() {
        try {
            if (this.redisClient) {
                await this.redisClient.quit();
                this.logger.info('Redis connection closed');
            }
        }
        catch (error) {
            this.logger.error('Error closing Redis connection:', error);
        }
    }
    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const result = {};
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        }
        return result;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, ioc_1.injectable)(),
    __param(0, (0, ioc_1.inject)('LoggerService')),
    __metadata("design:paramtypes", [LoggerService_1.LoggerService])
], RedisService);
//# sourceMappingURL=RedisService.js.map