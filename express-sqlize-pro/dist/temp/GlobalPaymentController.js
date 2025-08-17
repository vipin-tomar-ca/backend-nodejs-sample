"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalPaymentController = void 0;
const types_1 = require("@/types");
const errorHandler_1 = require("@/middleware/errorHandler");
const global_payroll_1 = require("@/types/global-payroll");
const logger_1 = __importDefault(require("@/utils/logger"));
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
class GlobalPaymentController {
    constructor() {
        this.processGlobalPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction, } = req.body;
            const authenticatedReq = req;
            if (!jobId || !clientId || !contractorId || !amount || !sourceCurrency || !targetCurrency || !jurisdiction) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields: jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            if (!this.isValidCurrency(sourceCurrency) || !this.isValidCurrency(targetCurrency)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid currency specified',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            if (!this.isValidJurisdiction(jurisdiction)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid jurisdiction specified',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            if (authenticatedReq.profile.type !== 'client') {
                throw new types_1.AuthorizationError('Only clients can process payments');
            }
            if (authenticatedReq.profile.id !== clientId) {
                throw new types_1.AuthorizationError('You can only process payments for your own jobs');
            }
            logger_1.default.info(`Processing global payment for job ${jobId} by client ${clientId}`);
            try {
                const payment = await this.globalPaymentService.processGlobalPayment(jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction);
                const response = {
                    success: true,
                    data: payment,
                    sagaId: payment.sagaId,
                    complianceStatus: payment.complianceValidation.isCompliant ? 'compliant' : 'non-compliant',
                    taxCalculation: payment.taxCalculation,
                    correlationId: payment.correlationId,
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                if (error instanceof global_payroll_1.GlobalPaymentError) {
                    res.status(400).json({
                        success: false,
                        error: error.message,
                        paymentId: error.paymentId,
                        sagaId: error.sagaId,
                        correlationId: this.generateCorrelationId(),
                        timestamp: new Date(),
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error during payment processing',
                        correlationId: this.generateCorrelationId(),
                        timestamp: new Date(),
                    });
                }
            }
        });
        this.getPaymentStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { paymentId } = req.params;
            const authenticatedReq = req;
            logger_1.default.info(`Getting payment status for ${paymentId} by user ${authenticatedReq.profile.id}`);
            try {
                const payment = await this.globalPaymentService.getPaymentStatus(paymentId);
                if (authenticatedReq.profile.id !== payment.clientId && authenticatedReq.profile.id !== payment.contractorId) {
                    throw new types_1.AuthorizationError('You can only view payments you are involved in');
                }
                const response = {
                    success: true,
                    data: payment,
                    sagaId: payment.sagaId,
                    complianceStatus: payment.complianceValidation.isCompliant ? 'compliant' : 'non-compliant',
                    taxCalculation: payment.taxCalculation,
                    correlationId: payment.correlationId,
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                if (error instanceof types_1.AuthorizationError) {
                    res.status(403).json({
                        success: false,
                        error: error.message,
                        correlationId: this.generateCorrelationId(),
                        timestamp: new Date(),
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: 'Error retrieving payment status',
                        correlationId: this.generateCorrelationId(),
                        timestamp: new Date(),
                    });
                }
            }
        });
        this.processBatchPayments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { payments } = req.body;
            const authenticatedReq = req;
            if (!Array.isArray(payments) || payments.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Payments array is required and must not be empty',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            for (const payment of payments) {
                if (!payment.jobId || !payment.clientId || !payment.contractorId || !payment.amount ||
                    !payment.sourceCurrency || !payment.targetCurrency || !payment.jurisdiction) {
                    res.status(400).json({
                        success: false,
                        error: 'Each payment must include: jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction',
                        correlationId: this.generateCorrelationId(),
                        timestamp: new Date(),
                    });
                    return;
                }
            }
            if (authenticatedReq.profile.type !== 'client') {
                throw new types_1.AuthorizationError('Only clients can process payments');
            }
            for (const payment of payments) {
                if (authenticatedReq.profile.id !== payment.clientId) {
                    throw new types_1.AuthorizationError('You can only process payments for your own jobs');
                }
            }
            logger_1.default.info(`Processing batch payments for ${payments.length} jobs by client ${authenticatedReq.profile.id}`);
            try {
                const results = await this.globalPaymentService.processBatchPayments(payments);
                const response = {
                    success: true,
                    data: {
                        totalPayments: payments.length,
                        successfulPayments: results.length,
                        failedPayments: payments.length - results.length,
                        payments: results,
                    },
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error processing batch payments',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
            }
        });
        this.getPaymentAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { jurisdiction, currency, startDate, endDate } = req.query;
            const authenticatedReq = req;
            logger_1.default.info(`Getting payment analytics for user ${authenticatedReq.profile.id}`);
            try {
                const analytics = await this.globalPaymentService.getPaymentAnalytics(jurisdiction, currency, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
                const response = {
                    success: true,
                    data: analytics,
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error retrieving payment analytics',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
            }
        });
        this.getCurrencyBalance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { currency } = req.params;
            const authenticatedReq = req;
            if (!this.isValidCurrency(currency)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid currency specified',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            logger_1.default.info(`Getting ${currency} balance for user ${authenticatedReq.profile.id}`);
            try {
                const currencyService = container_1.default.get(container_2.TYPES.CurrencyService);
                const balance = await currencyService.getBalanceInCurrency(authenticatedReq.profile.id, currency);
                const response = {
                    success: true,
                    data: {
                        userId: authenticatedReq.profile.id,
                        currency: currency,
                        balance,
                    },
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error retrieving currency balance',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
            }
        });
        this.getComplianceStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { jurisdiction } = req.params;
            const authenticatedReq = req;
            if (!this.isValidJurisdiction(jurisdiction)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid jurisdiction specified',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
                return;
            }
            logger_1.default.info(`Getting compliance status for ${jurisdiction} for user ${authenticatedReq.profile.id}`);
            try {
                const complianceService = container_1.default.get(container_2.TYPES.ComplianceService);
                const compliance = await complianceService.validateProfileCompliance(authenticatedReq.profile.id, jurisdiction);
                const response = {
                    success: true,
                    data: compliance,
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                };
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error retrieving compliance status',
                    correlationId: this.generateCorrelationId(),
                    timestamp: new Date(),
                });
            }
        });
        this.globalPaymentService = container_1.default.get(container_2.TYPES.GlobalPaymentService);
    }
    isValidCurrency(currency) {
        const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BRL', 'MXN', 'JPY', 'CNY'];
        return validCurrencies.includes(currency);
    }
    isValidJurisdiction(jurisdiction) {
        const validJurisdictions = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'IN', 'BR', 'MX', 'JP', 'CN'];
        return validJurisdictions.includes(jurisdiction);
    }
    generateCorrelationId() {
        return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.GlobalPaymentController = GlobalPaymentController;
//# sourceMappingURL=GlobalPaymentController.js.map