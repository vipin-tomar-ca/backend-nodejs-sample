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
const ioc_1 = require("../container/ioc");
const uuid_1 = require("uuid");
const models_1 = require("../models");
const global_payroll_1 = require("../types/global-payroll");
const BusinessRuleEngine_1 = require("./BusinessRuleEngine");
const CurrencyService_1 = require("./CurrencyService");
const ComplianceService_1 = require("./ComplianceService");
const logger_1 = __importDefault(require("../utils/logger"));
let GlobalPaymentService = class GlobalPaymentService {
    constructor(businessRuleEngine, currencyService, complianceService) {
        this.businessRuleEngine = businessRuleEngine;
        this.currencyService = currencyService;
        this.complianceService = complianceService;
    }
    async processGlobalPayment(jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction) {
        const correlationId = (0, uuid_1.v4)();
        const paymentId = (0, uuid_1.v4)();
        try {
            logger_1.default.info(`Starting global payment processing: ${paymentId}`, { correlationId });
            await this.validatePaymentInput(jobId, clientId, contractorId, amount, jurisdiction);
            const businessRuleContext = await this.createBusinessRuleContext(amount, sourceCurrency, targetCurrency, jurisdiction, 'contractor', paymentId, clientId, contractorId, jobId);
            const businessRuleResults = await this.businessRuleEngine.executeRules(`${jurisdiction}_COMPLIANCE`, businessRuleContext);
            const criticalFailures = businessRuleResults.filter(result => result.severity === 'error' || result.severity === 'critical');
            if (criticalFailures.length > 0) {
                throw new global_payroll_1.GlobalPaymentError(`Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`, paymentId);
            }
            const complianceValidation = await this.complianceService.validatePayment(amount, jurisdiction, 'contractor');
            if (!complianceValidation.isCompliant) {
                throw new global_payroll_1.GlobalPaymentError(`Compliance validation failed: ${complianceValidation.errors.join(', ')}`, paymentId);
            }
            const currencyConversion = await this.currencyService.convertCurrency(amount, sourceCurrency, targetCurrency);
            const taxCalculation = await this.calculateTaxes(amount, jurisdiction, 'contractor');
            const payment = await this.executePayment(paymentId, jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction, complianceValidation, taxCalculation, currencyConversion, correlationId);
            await this.updateBalances(clientId, contractorId, currencyConversion, jurisdiction);
            await this.generateTaxDocuments(payment, jurisdiction);
            logger_1.default.info(`Global payment completed successfully: ${paymentId}`, { correlationId });
            return payment;
        }
        catch (error) {
            logger_1.default.error(`Global payment failed: ${paymentId}`, { correlationId, error });
            throw error;
        }
    }
    async getPaymentStatus(paymentId) {
        throw new Error(`Payment ${paymentId} not found - implement payment storage`);
    }
    async processBatchPayments(payments) {
        const results = [];
        const batchId = (0, uuid_1.v4)();
        logger_1.default.info(`Starting batch payment processing: ${batchId}`, { batchSize: payments.length });
        for (const payment of payments) {
            try {
                const result = await this.processGlobalPayment(payment.jobId, payment.clientId, payment.contractorId, payment.amount, payment.sourceCurrency, payment.targetCurrency, payment.jurisdiction);
                results.push(result);
            }
            catch (error) {
                logger_1.default.error(`Batch payment failed for job ${payment.jobId}`, { batchId, error });
            }
        }
        logger_1.default.info(`Batch payment processing completed: ${batchId}`, {
            batchId,
            successful: results.length,
            failed: payments.length - results.length
        });
        return results;
    }
    async getPaymentAnalytics(filters) {
        const mockData = {
            totalPayments: 1250,
            totalAmount: 2500000,
            averageAmount: 2000,
            successRate: 0.95,
            currencyBreakdown: {
                'USD': 500000,
                'EUR': 400000,
                'GBP': 300000,
                'INR': 200000,
                'CAD': 150000,
                'AUD': 120000,
                'JPY': 100000,
                'CHF': 80000,
                'SGD': 60000,
            },
            jurisdictionBreakdown: {
                'US': 400,
                'UK': 300,
                'DE': 200,
                'IN': 150,
                'CA': 100,
                'AU': 80,
                'JP': 70,
                'FR': 60,
                'NL': 50,
                'SG': 40,
            },
        };
        return mockData;
    }
    async validatePaymentInput(jobId, clientId, contractorId, amount, jurisdiction) {
        const job = await models_1.Job.findByPk(jobId);
        if (!job) {
            throw new global_payroll_1.GlobalPaymentError(`Job ${jobId} not found`, '');
        }
        if (job.paid) {
            throw new global_payroll_1.GlobalPaymentError(`Job ${jobId} is already paid`, '');
        }
        const client = await models_1.Profile.findByPk(clientId);
        if (!client) {
            throw new global_payroll_1.GlobalPaymentError(`Client ${clientId} not found`, '');
        }
        if (client.type !== 'client') {
            throw new global_payroll_1.GlobalPaymentError(`Profile ${clientId} is not a client`, '');
        }
        const contractor = await models_1.Profile.findByPk(contractorId);
        if (!contractor) {
            throw new global_payroll_1.GlobalPaymentError(`Contractor ${contractorId} not found`, '');
        }
        if (contractor.type !== 'contractor') {
            throw new global_payroll_1.GlobalPaymentError(`Profile ${contractorId} is not a contractor`, '');
        }
        if (amount <= 0) {
            throw new global_payroll_1.GlobalPaymentError('Payment amount must be positive', '');
        }
        const supportedJurisdictions = this.complianceService.getSupportedJurisdictions();
        if (!supportedJurisdictions.includes(jurisdiction)) {
            throw new global_payroll_1.GlobalPaymentError(`Jurisdiction ${jurisdiction} is not supported`, '');
        }
    }
    async createBusinessRuleContext(amount, sourceCurrency, targetCurrency, jurisdiction, employeeType, paymentId, clientId, contractorId, jobId) {
        return {
            amount,
            currency: sourceCurrency,
            sourceCurrency,
            targetCurrency,
            jurisdiction,
            employeeType,
            paymentDate: new Date(),
            complianceStatus: 'pending',
            clientId,
            contractorId,
            jobId,
            warnings: [],
            errors: [],
        };
    }
    async calculateTaxes(amount, jurisdiction, employeeType) {
        const taxRates = {
            'federal': 0.22,
            'state': 0.05,
            'social_security': 0.062,
            'medicare': 0.0145,
        };
        const totalTaxRate = Object.values(taxRates).reduce((sum, rate) => sum + rate, 0);
        const totalTax = amount * totalTaxRate;
        const netAmount = amount - totalTax;
        return {
            employeeType,
            taxObligations: {
                jurisdiction,
                taxYear: 2024,
                grossAmount: amount,
                currency: 'USD',
                totalTax,
                netAmount,
                taxRates,
            },
            complianceStatus: 'compliant',
            calculationDate: new Date(),
        };
    }
    async executePayment(paymentId, jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction, complianceValidation, taxCalculation, currencyConversion, correlationId) {
        const job = await models_1.Job.findByPk(jobId);
        if (job) {
            job.paid = true;
            job.paymentDate = new Date();
            await job.save();
        }
        const payment = {
            id: paymentId,
            jobId,
            clientId,
            contractorId,
            amount,
            sourceCurrency,
            targetCurrency,
            jurisdiction,
            status: 'completed',
            complianceValidation,
            taxCalculation,
            currencyConversion,
            correlationId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        logger_1.default.info(`Payment executed: ${paymentId}`, { correlationId, amount, currency: targetCurrency });
        return payment;
    }
    async updateBalances(clientId, contractorId, currencyConversion, jurisdiction) {
        await this.currencyService.updateMultiCurrencyBalance(clientId, currencyConversion.fromCurrency, -currencyConversion.originalAmount);
        await this.currencyService.updateMultiCurrencyBalance(contractorId, currencyConversion.toCurrency, currencyConversion.totalAmount);
        logger_1.default.info(`Balances updated for payment`, {
            clientId,
            contractorId,
            clientDeduction: currencyConversion.originalAmount,
            contractorAddition: currencyConversion.totalAmount,
        });
    }
    async generateTaxDocuments(payment, jurisdiction) {
        try {
            const documents = await this.complianceService.generateTaxDocuments(payment, jurisdiction);
            logger_1.default.info(`Generated ${documents.length} tax documents for payment ${payment.id}`, {
                jurisdiction,
                documents,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to generate tax documents for payment ${payment.id}`, { error });
        }
    }
    getPaymentStatistics() {
        return {
            totalProcessed: 1250,
            totalAmount: 2500000,
            averageProcessingTime: 2.5,
            successRate: 0.95,
            topJurisdictions: ['US', 'UK', 'DE', 'IN', 'CA'],
            topCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD'],
        };
    }
};
exports.GlobalPaymentService = GlobalPaymentService;
exports.GlobalPaymentService = GlobalPaymentService = __decorate([
    (0, ioc_1.injectable)(),
    __param(0, (0, ioc_1.inject)('BusinessRuleEngine')),
    __param(1, (0, ioc_1.inject)('CurrencyService')),
    __param(2, (0, ioc_1.inject)('ComplianceService')),
    __metadata("design:paramtypes", [BusinessRuleEngine_1.BusinessRuleEngine,
        CurrencyService_1.CurrencyService,
        ComplianceService_1.ComplianceService])
], GlobalPaymentService);
//# sourceMappingURL=GlobalPaymentService.js.map