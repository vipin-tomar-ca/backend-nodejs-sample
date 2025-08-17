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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalPaymentService = void 0;
const inversify_1 = require("inversify");
const container_1 = require("@/container");
const CurrencyService_1 = require("./CurrencyService");
const ComplianceService_1 = require("./ComplianceService");
const SagaPatternService_1 = require("./SagaPatternService");
const ConcurrencyService_1 = require("./ConcurrencyService");
const EventSourcingService_1 = require("./EventSourcingService");
const global_payroll_1 = require("@/types/global-payroll");
const logger_1 = __importDefault(require("@/utils/logger"));
let GlobalPaymentService = class GlobalPaymentService {
    constructor(currencyService, complianceService, sagaPatternService, concurrencyService, eventSourcingService) {
        this.currencyService = currencyService;
        this.complianceService = complianceService;
        this.sagaPatternService = sagaPatternService;
        this.concurrencyService = concurrencyService;
        this.eventSourcingService = eventSourcingService;
    }
    async processGlobalPayment(jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction) {
        const correlationId = this.generateCorrelationId();
        try {
            logger_1.default.info(`Processing global payment. Correlation ID: ${correlationId}`);
            const complianceValidation = await this.complianceService.validatePayment(amount, jurisdiction, 'contractor');
            if (!complianceValidation.isCompliant) {
                throw new global_payroll_1.GlobalPaymentError(`Payment not compliant for jurisdiction ${jurisdiction}`, `payment_${correlationId}`);
            }
            const currencyConversion = await this.currencyService.convertCurrency(amount, sourceCurrency, targetCurrency, 'real-time');
            const payment = {
                id: `payment_${correlationId}`,
                jobId,
                clientId,
                contractorId,
                amount,
                sourceCurrency,
                targetCurrency,
                jurisdiction,
                exchangeRate: currencyConversion.exchangeRate,
                fees: currencyConversion.fees,
                netAmount: currencyConversion.netAmount,
                status: 'pending',
                correlationId,
                complianceValidation,
                taxCalculation: complianceValidation.taxObligations,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const saga = await this.executeGlobalPaymentSaga(payment);
            payment.status = saga.status === 'completed' ? 'completed' : 'failed';
            payment.sagaId = saga.id;
            payment.updatedAt = new Date();
            logger_1.default.info(`Global payment processed successfully. Payment ID: ${payment.id}, Saga ID: ${saga.id}`);
            return payment;
        }
        catch (error) {
            logger_1.default.error(`Error processing global payment. Correlation ID: ${correlationId}`, error);
            throw new global_payroll_1.GlobalPaymentError(`Failed to process global payment: ${error.message}`, `payment_${correlationId}`);
        }
    }
    async executeGlobalPaymentSaga(payment) {
        const sagaId = this.generateSagaId();
        const saga = {
            id: sagaId,
            status: 'pending',
            steps: [],
            currentStep: 0,
            paymentId: payment.id,
            jurisdiction: payment.jurisdiction,
            sourceCurrency: payment.sourceCurrency,
            targetCurrency: payment.targetCurrency,
            amount: payment.amount,
            correlationId: payment.correlationId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const steps = [
            {
                stepName: 'LockJob',
                stepOrder: 1,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Locking job ${payment.jobId} for payment`);
                    const locked = await this.concurrencyService.lockJobForPayment(payment.jobId, payment.clientId);
                    if (!locked) {
                        throw new Error(`Failed to lock job ${payment.jobId} for payment`);
                    }
                    saga.currentStep = 1;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Releasing job lock for ${payment.jobId}`);
                    await this.concurrencyService.releaseJobLock(payment.jobId);
                },
            },
            {
                stepName: 'ValidateClientBalance',
                stepOrder: 2,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Validating client balance for ${payment.clientId}`);
                    const clientBalance = await this.currencyService.getBalanceInCurrency(payment.clientId, payment.sourceCurrency);
                    if (clientBalance < payment.amount) {
                        throw new Error(`Insufficient balance for client ${payment.clientId}`);
                    }
                    saga.currentStep = 2;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: No compensation needed for balance validation`);
                },
            },
            {
                stepName: 'DeductClientBalance',
                stepOrder: 3,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Deducting ${payment.amount} ${payment.sourceCurrency} from client ${payment.clientId}`);
                    await this.currencyService.updateMultiCurrencyBalance(payment.clientId, payment.sourceCurrency, -payment.amount);
                    saga.currentStep = 3;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Refunding ${payment.amount} ${payment.sourceCurrency} to client ${payment.clientId}`);
                    await this.currencyService.updateMultiCurrencyBalance(payment.clientId, payment.sourceCurrency, payment.amount);
                },
            },
            {
                stepName: 'AddContractorBalance',
                stepOrder: 4,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Adding ${payment.netAmount} ${payment.targetCurrency} to contractor ${payment.contractorId}`);
                    await this.currencyService.updateMultiCurrencyBalance(payment.contractorId, payment.targetCurrency, payment.netAmount);
                    saga.currentStep = 4;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Deducting ${payment.netAmount} ${payment.targetCurrency} from contractor ${payment.contractorId}`);
                    await this.currencyService.updateMultiCurrencyBalance(payment.contractorId, payment.targetCurrency, -payment.netAmount);
                },
            },
            {
                stepName: 'MarkJobAsPaid',
                stepOrder: 5,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Marking job ${payment.jobId} as paid`);
                    saga.currentStep = 5;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Marking job ${payment.jobId} as unpaid`);
                },
            },
            {
                stepName: 'GenerateTaxDocuments',
                stepOrder: 6,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Generating tax documents for payment ${payment.id}`);
                    await this.complianceService.generateTaxDocuments(payment, payment.jurisdiction);
                    saga.currentStep = 6;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: No compensation needed for tax document generation`);
                },
            },
            {
                stepName: 'RecordEvents',
                stepOrder: 7,
                execute: async () => {
                    logger_1.default.info(`Saga ${sagaId}: Recording events for payment ${payment.id}`);
                    await this.eventSourcingService.createPaymentEvents(payment.jobId, payment.clientId, payment.contractorId, payment.amount, payment.correlationId);
                    saga.currentStep = 7;
                },
                compensate: async () => {
                    logger_1.default.info(`Saga ${sagaId}: No compensation needed for event recording`);
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
    async getPaymentStatus(paymentId) {
        try {
            const mockPayment = {
                id: paymentId,
                jobId: 1,
                clientId: 1,
                contractorId: 2,
                amount: 1000,
                sourceCurrency: 'USD',
                targetCurrency: 'EUR',
                jurisdiction: 'US',
                exchangeRate: 0.85,
                fees: 25,
                netAmount: 825,
                status: 'completed',
                correlationId: 'mock_correlation',
                complianceValidation: {
                    isCompliant: true,
                    requiredDocuments: [],
                    missingDocuments: [],
                    taxObligations: {
                        jurisdiction: 'US',
                        taxYear: 2024,
                        grossAmount: 1000,
                        currency: 'USD',
                        totalTax: 200,
                        netAmount: 800,
                        taxRates: {},
                    },
                    warnings: [],
                    errors: [],
                    jurisdiction: 'US',
                    validationDate: new Date(),
                },
                taxCalculation: {
                    jurisdiction: 'US',
                    employeeType: 'contractor',
                    taxYear: 2024,
                    grossAmount: 1000,
                    currency: 'USD',
                    taxObligations: {
                        jurisdiction: 'US',
                        taxYear: 2024,
                        grossAmount: 1000,
                        currency: 'USD',
                        totalTax: 200,
                        netAmount: 800,
                        taxRates: {},
                    },
                    complianceStatus: 'compliant',
                    calculationDate: new Date(),
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return mockPayment;
        }
        catch (error) {
            logger_1.default.error(`Error getting payment status for ${paymentId}:`, error);
            throw error;
        }
    }
    async processBatchPayments(payments) {
        const results = [];
        for (const paymentRequest of payments) {
            try {
                const payment = await this.processGlobalPayment(paymentRequest.jobId, paymentRequest.clientId, paymentRequest.contractorId, paymentRequest.amount, paymentRequest.sourceCurrency, paymentRequest.targetCurrency, paymentRequest.jurisdiction);
                results.push(payment);
            }
            catch (error) {
                logger_1.default.error(`Error processing batch payment for job ${paymentRequest.jobId}:`, error);
            }
        }
        return results;
    }
    async getPaymentAnalytics(jurisdiction, currency, startDate, endDate) {
        try {
            const analytics = {
                totalPayments: 1000,
                totalAmount: 500000,
                averageAmount: 500,
                currencyBreakdown: {
                    USD: 300000,
                    EUR: 150000,
                    GBP: 50000,
                },
                jurisdictionBreakdown: {
                    US: 400000,
                    UK: 60000,
                    DE: 40000,
                },
                statusBreakdown: {
                    completed: 950,
                    pending: 30,
                    failed: 20,
                },
            };
            return analytics;
        }
        catch (error) {
            logger_1.default.error('Error getting payment analytics:', error);
            throw error;
        }
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
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.GlobalPaymentService = GlobalPaymentService;
exports.GlobalPaymentService = GlobalPaymentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(container_1.TYPES.CurrencyService)),
    __param(1, (0, inversify_1.inject)(container_1.TYPES.ComplianceService)),
    __param(2, (0, inversify_1.inject)(container_1.TYPES.SagaPatternService)),
    __param(3, (0, inversify_1.inject)(container_1.TYPES.ConcurrencyService)),
    __param(4, (0, inversify_1.inject)(container_1.TYPES.EventSourcingService)),
    __metadata("design:paramtypes", [CurrencyService_1.CurrencyService,
        ComplianceService_1.ComplianceService,
        SagaPatternService_1.SagaPatternService,
        ConcurrencyService_1.ConcurrencyService,
        EventSourcingService_1.EventSourcingService])
], GlobalPaymentService);
//# sourceMappingURL=GlobalPaymentService.js.map