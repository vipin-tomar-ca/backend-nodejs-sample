export interface DistributedLockOptions {
    ttl: number;
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
export declare class DistributedLock {
    private redisClient;
    private lockKey;
    private lockValue;
    private ttl;
    private retryAttempts;
    private retryDelay;
    constructor(redisClient: any, lockKey: string, options?: Partial<DistributedLockOptions>);
    acquire(): Promise<boolean>;
    release(): Promise<boolean>;
    private sleep;
}
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private lastFailureTime;
    private failureThreshold;
    private recoveryTimeout;
    private expectedErrors;
    constructor(options: CircuitBreakerOptions);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private shouldAttemptReset;
    getState(): string;
    getFailureCount(): number;
}
export declare class DistributedCache {
    private redisClient;
    constructor(redisClient: any);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export declare class DistributedRateLimiter {
    private redisClient;
    constructor(redisClient: any);
    isAllowed(identifier: string, limit: number, windowMs: number): Promise<boolean>;
}
export declare class DistributedEventBus {
    private redisClient;
    private subscribers;
    constructor(redisClient: any);
    publish(channel: string, event: any): Promise<void>;
    subscribe(channel: string, handler: Function): void;
    private setupSubscriber;
}
export declare function generateRequestId(): string;
export declare function generateServiceId(): string;
export declare class DistributedTransactionCoordinator {
    private transactions;
    beginTransaction(transactionId: string): Promise<void>;
    commitTransaction(transactionId: string): Promise<boolean>;
    rollbackTransaction(transactionId: string): Promise<void>;
    private preparePhase;
    private commitPhase;
}
//# sourceMappingURL=distributed.d.ts.map