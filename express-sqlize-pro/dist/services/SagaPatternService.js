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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaPatternService = void 0;
const inversify_1 = require("inversify");
const container_1 = require("@/container");
const ProfileService_1 = require("./ProfileService");
const JobService_1 = require("./JobService");
const NotificationService_1 = require("./NotificationService");
const AuditService_1 = require("./AuditService");
const logger_1 = __importDefault(require("@/utils/logger"));
let SagaPatternService = class SagaPatternService {
    constructor(profileService, jobService, notificationService, auditService) {
        this.profileService = profileService;
        this.jobService = jobService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }
    async executeJobPaymentSaga(jobId, clientId, contractorId, amount) {
        const sagaId = this.generateSagaId();
        const saga = {
            id: sagaId,
            status: 'pending',
            steps: [],
            currentStep: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const steps = [
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Validating job ${jobId}`);
                    await this.jobService.validateAndLockJob(jobId, clientId);
                    saga.currentStep = 1;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating job validation`);
                    await this.jobService.unlockJob(jobId);
                },
            },
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Deducting ${amount} from client ${clientId}`);
                    await this.profileService.deductBalanceWithLock(clientId, amount);
                    saga.currentStep = 2;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating client deduction`);
                    await this.profileService.refundBalance(clientId, amount);
                },
            },
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Adding ${amount} to contractor ${contractorId}`);
                    await this.profileService.addBalanceWithLock(contractorId, amount);
                    saga.currentStep = 3;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating contractor addition`);
                    await this.profileService.deductBalanceWithLock(contractorId, amount);
                },
            },
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Marking job ${jobId} as paid`);
                    await this.jobService.markJobAsPaid(jobId);
                    saga.currentStep = 4;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating job payment`);
                    await this.jobService.markJobAsUnpaid(jobId);
                },
            },
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Sending notifications`);
                    await this.notificationService.sendPaymentNotification(clientId, contractorId, amount);
                    saga.currentStep = 5;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating notifications`);
                    await this.notificationService.cancelPaymentNotification(clientId, contractorId);
                },
            },
            {
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Creating audit log`);
                    await this.auditService.logPaymentTransaction(sagaId, jobId, clientId, contractorId, amount);
                    saga.currentStep = 6;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Compensating audit log`);
                    await this.auditService.revertPaymentTransaction(sagaId);
                },
            },
        ];
        saga.steps = steps;
        saga.status = 'in_progress';
        try {
            for (let i = 0; i < steps.length; i++) {
                try {
                    await steps[i].execute();
                    saga.updatedAt = new Date();
                }
                catch (error) {
                    logger_1.default.error(`Saga ${sagaId}: Step ${i + 1} failed`, error);
                    await this.compensateSaga(saga, i);
                    throw error;
                }
            }
            saga.status = 'completed';
            saga.updatedAt = new Date();
            logger_1.default.info(`Saga ${sagaId}: Completed successfully`);
        }
        catch (error) {
            saga.status = 'failed';
            saga.updatedAt = new Date();
            logger_1.default.error(`Saga ${sagaId}: Failed`, error);
            throw error;
        }
        return saga;
    }
    async compensateSaga(saga, failedStepIndex) {
        logger_1.default.info(`Saga ${saga.id}: Starting compensation from step ${failedStepIndex}`);
        for (let i = failedStepIndex - 1; i >= 0; i--) {
            try {
                await saga.steps[i].compensate();
                logger_1.default.info(`Saga ${saga.id}: Step ${i + 1} compensated successfully`);
            }
            catch (compensationError) {
                logger_1.default.error(`Saga ${saga.id}: Step ${i + 1} compensation failed`, compensationError);
            }
        }
        saga.status = 'compensated';
        saga.updatedAt = new Date();
    }
    generateSagaId() {
        return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async retrySaga(sagaId) {
        throw new Error('Retry mechanism not implemented');
    }
    async getSagaStatus(sagaId) {
        throw new Error('Saga status retrieval not implemented');
    }
};
exports.SagaPatternService = SagaPatternService;
exports.SagaPatternService = SagaPatternService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(container_1.TYPES.ProfileService)),
    __param(1, (0, inversify_1.inject)(container_1.TYPES.JobService)),
    __param(2, (0, inversify_1.inject)(container_1.TYPES.NotificationService)),
    __param(3, (0, inversify_1.inject)(container_1.TYPES.AuditService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService,
        JobService_1.JobService, typeof (_a = typeof NotificationService_1.NotificationService !== "undefined" && NotificationService_1.NotificationService) === "function" ? _a : Object, typeof (_b = typeof AuditService_1.AuditService !== "undefined" && AuditService_1.AuditService) === "function" ? _b : Object])
], SagaPatternService);
//# sourceMappingURL=SagaPatternService.js.map