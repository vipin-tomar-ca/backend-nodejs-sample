"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyService = void 0;
const inversify_1 = require("inversify");
const models_1 = require("@/models");
const logger_1 = __importDefault(require("@/utils/logger"));
let ConcurrencyService = class ConcurrencyService {
    constructor() {
        this.locks = new Map();
    }
    async updateBalanceWithOptimisticLock(profileId, amount, expectedVersion) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error('Profile not found');
            }
            if (profile.version !== expectedVersion) {
                logger_1.default.warn(`Optimistic lock failed for profile ${profileId}. Expected: ${expectedVersion}, Actual: ${profile.version}`);
                return { success: false, newVersion: profile.version, newBalance: profile.balance };
            }
            const newBalance = parseFloat(profile.balance.toString()) + amount;
            if (newBalance < 0) {
                throw new Error('Insufficient balance');
            }
            const [updatedRows] = await models_1.Profile.update({
                balance: newBalance,
                version: profile.version + 1,
                updatedAt: new Date(),
            }, {
                where: {
                    id: profileId,
                    version: expectedVersion,
                },
            });
            if (updatedRows === 0) {
                const currentProfile = await models_1.Profile.findByPk(profileId);
                return {
                    success: false,
                    newVersion: currentProfile.version,
                    newBalance: currentProfile.balance,
                };
            }
            logger_1.default.info(`Balance updated successfully for profile ${profileId}. New balance: ${newBalance}`);
            return {
                success: true,
                newVersion: profile.version + 1,
                newBalance,
            };
        }
        catch (error) {
            logger_1.default.error(`Error updating balance for profile ${profileId}:`, error);
            throw error;
        }
    }
    async acquireDistributedLock(resourceId, ttl = 30000) {
        const lockKey = `lock:${resourceId}`;
        const lock = {
            acquire: async () => {
                try {
                    if (this.locks.has(lockKey)) {
                        return false;
                    }
                    this.locks.set(lockKey, lock);
                    setTimeout(() => {
                        this.locks.delete(lockKey);
                    }, ttl);
                    logger_1.default.info(`Distributed lock acquired for resource: ${resourceId}`);
                    return true;
                }
                catch (error) {
                    logger_1.default.error(`Failed to acquire lock for resource ${resourceId}:`, error);
                    return false;
                }
            },
            release: async () => {
                try {
                    this.locks.delete(lockKey);
                    logger_1.default.info(`Distributed lock released for resource: ${resourceId}`);
                }
                catch (error) {
                    logger_1.default.error(`Failed to release lock for resource ${resourceId}:`, error);
                }
            },
            isLocked: async () => {
                return this.locks.has(lockKey);
            },
        };
        return lock;
    }
    async lockJobForPayment(jobId, clientId) {
        try {
            const lock = await this.acquireDistributedLock(`job:${jobId}`);
            const acquired = await lock.acquire();
            if (!acquired) {
                logger_1.default.warn(`Failed to acquire lock for job ${jobId}`);
                return false;
            }
            const job = await models_1.Job.findOne({
                where: {
                    id: jobId,
                    paid: false,
                    locked: false,
                },
                include: [{
                        model: models_1.Contract,
                        where: {
                            status: 'in_progress',
                            ClientId: clientId,
                        },
                    }],
            });
            if (!job) {
                await lock.release();
                return false;
            }
            await models_1.Job.update({ locked: true, lockedAt: new Date(), lockedBy: clientId }, { where: { id: jobId } });
            logger_1.default.info(`Job ${jobId} locked for payment by client ${clientId}`);
            return true;
        }
        catch (error) {
            logger_1.default.error(`Error locking job ${jobId}:`, error);
            return false;
        }
    }
    async releaseJobLock(jobId) {
        try {
            await models_1.Job.update({ locked: false, lockedAt: null, lockedBy: null }, { where: { id: jobId } });
            const lock = await this.acquireDistributedLock(`job:${jobId}`);
            await lock.release();
            logger_1.default.info(`Job ${jobId} lock released`);
        }
        catch (error) {
            logger_1.default.error(`Error releasing job lock ${jobId}:`, error);
        }
    }
    async updateBalanceWithRetry(profileId, amount, maxRetries = 3) {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                const profile = await models_1.Profile.findByPk(profileId);
                if (!profile) {
                    throw new Error('Profile not found');
                }
                const result = await this.updateBalanceWithOptimisticLock(profileId, amount, profile.version);
                if (result.success) {
                    return { success: true, newBalance: result.newBalance };
                }
                retries++;
                if (retries < maxRetries) {
                    logger_1.default.info(`Retrying balance update for profile ${profileId}. Attempt ${retries + 1}/${maxRetries}`);
                    await this.delay(100 * retries);
                }
            }
            catch (error) {
                logger_1.default.error(`Error updating balance for profile ${profileId} (attempt ${retries + 1}):`, error);
                retries++;
                if (retries >= maxRetries) {
                    throw error;
                }
                await this.delay(100 * retries);
            }
        }
        throw new Error(`Failed to update balance for profile ${profileId} after ${maxRetries} retries`);
    }
    async processJobPaymentWithConcurrencyControl(jobId, clientId, contractorId, amount) {
        try {
            const jobLocked = await this.lockJobForPayment(jobId, clientId);
            if (!jobLocked) {
                return { success: false };
            }
            const clientResult = await this.updateBalanceWithRetry(clientId, -amount);
            if (!clientResult.success) {
                await this.releaseJobLock(jobId);
                return { success: false };
            }
            const contractorResult = await this.updateBalanceWithRetry(contractorId, amount);
            if (!contractorResult.success) {
                await this.updateBalanceWithRetry(clientId, amount);
                await this.releaseJobLock(jobId);
                return { success: false };
            }
            await models_1.Job.update({
                paid: true,
                paymentDate: new Date(),
                locked: false,
                lockedAt: null,
                lockedBy: null,
            }, { where: { id: jobId } });
            await this.releaseJobLock(jobId);
            logger_1.default.info(`Job payment processed successfully: ${jobId}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error(`Error processing job payment ${jobId}:`, error);
            try {
                await this.releaseJobLock(jobId);
            }
            catch (cleanupError) {
                logger_1.default.error(`Error during cleanup for job ${jobId}:`, cleanupError);
            }
            return { success: false };
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getLockStatus(resourceId) {
        const lock = await this.acquireDistributedLock(resourceId);
        return await lock.isLocked();
    }
    async forceReleaseAllLocks() {
        this.locks.clear();
        logger_1.default.warn('All distributed locks force released');
    }
};
exports.ConcurrencyService = ConcurrencyService;
exports.ConcurrencyService = ConcurrencyService = __decorate([
    (0, inversify_1.injectable)()
], ConcurrencyService);
//# sourceMappingURL=ConcurrencyService.js.map