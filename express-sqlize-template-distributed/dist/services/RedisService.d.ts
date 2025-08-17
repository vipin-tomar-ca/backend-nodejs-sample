import { LoggerService } from './LoggerService';
import { DistributedCache, DistributedLock, DistributedRateLimiter, DistributedEventBus } from '../utils/distributed';
export declare class RedisService {
    private redisClient;
    private cache;
    private rateLimiter;
    private eventBus;
    private logger;
    private isConnected;
    constructor(logger: LoggerService);
    initialize(): Promise<void>;
    getClient(): any;
    isRedisConnected(): boolean;
    getCache(): DistributedCache;
    getRateLimiter(): DistributedRateLimiter;
    getEventBus(): DistributedEventBus;
    createLock(lockKey: string, options?: any): DistributedLock;
    executeWithRetry<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    healthCheck(): Promise<boolean>;
    getInfo(): Promise<any>;
    getMemoryUsage(): Promise<any>;
    flushAll(): Promise<void>;
    close(): Promise<void>;
    private parseRedisInfo;
    private sleep;
}
//# sourceMappingURL=RedisService.d.ts.map