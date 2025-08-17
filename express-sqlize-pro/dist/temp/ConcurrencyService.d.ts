export interface IDistributedLock {
    acquire(): Promise<boolean>;
    release(): Promise<void>;
    isLocked(): Promise<boolean>;
}
export interface IOptimisticLock {
    version: number;
    updatedAt: Date;
}
export declare class ConcurrencyService {
    private locks;
    updateBalanceWithOptimisticLock(profileId: number, amount: number, expectedVersion: number): Promise<{
        success: boolean;
        newVersion: number;
        newBalance: number;
    }>;
    acquireDistributedLock(resourceId: string, ttl?: number): Promise<IDistributedLock>;
    lockJobForPayment(jobId: number, clientId: number): Promise<boolean>;
    releaseJobLock(jobId: number): Promise<void>;
    updateBalanceWithRetry(profileId: number, amount: number, maxRetries?: number): Promise<{
        success: boolean;
        newBalance: number;
    }>;
    processJobPaymentWithConcurrencyControl(jobId: number, clientId: number, contractorId: number, amount: number): Promise<{
        success: boolean;
        sagaId?: string;
    }>;
    private delay;
    getLockStatus(resourceId: string): Promise<boolean>;
    forceReleaseAllLocks(): Promise<void>;
}
//# sourceMappingURL=ConcurrencyService.d.ts.map