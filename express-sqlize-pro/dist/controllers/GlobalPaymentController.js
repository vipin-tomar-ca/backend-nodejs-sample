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
exports.GlobalPaymentController = void 0;
const ioc_1 = require("../container/ioc");
const logger_1 = __importDefault(require("../utils/logger"));
let GlobalPaymentController = class GlobalPaymentController {
    constructor(globalPaymentService) {
        this.globalPaymentService = globalPaymentService;
    }
    async processPayment(req, res) {
        try {
            const authenticatedReq = req;
            const { jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction } = req.body;
            if (!jobId || !clientId || !contractorId || !amount || !sourceCurrency || !targetCurrency || !jurisdiction) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, and jurisdiction are required',
                });
                return;
            }
            if (authenticatedReq.profile.id !== clientId) {
                res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'You can only process payments for your own account',
                });
                return;
            }
            const payment = await this.globalPaymentService.processGlobalPayment(jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction);
            res.status(201).json({
                success: true,
                data: payment,
                message: 'Global payment processed successfully',
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Global payment processing failed:', error);
            res.status(500).json({
                success: false,
                error: 'Payment processing failed',
                message: error.message,
                timestamp: new Date(),
            });
        }
    }
    async processBatchPayments(req, res) {
        try {
            const { payments } = req.body;
            if (!Array.isArray(payments) || payments.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid payments array',
                    message: 'payments must be a non-empty array',
                });
                return;
            }
            const authenticatedReq = req;
            const unauthorizedPayments = payments.filter(payment => payment.clientId !== authenticatedReq.profile.id);
            if (unauthorizedPayments.length > 0) {
                res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'You can only process payments for your own account',
                });
                return;
            }
            const results = await this.globalPaymentService.processBatchPayments(payments);
            res.status(201).json({
                success: true,
                data: results,
                message: `Processed ${results.length} payments successfully`,
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Batch payment processing failed:', error);
            res.status(500).json({
                success: false,
                error: 'Batch payment processing failed',
                message: error.message,
                timestamp: new Date(),
            });
        }
    }
    async getPaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                res.status(400).json({
                    success: false,
                    error: 'Missing payment ID',
                    message: 'paymentId is required',
                });
                return;
            }
            const payment = await this.globalPaymentService.getPaymentStatus(paymentId);
            res.status(200).json({
                success: true,
                data: payment,
                message: 'Payment status retrieved successfully',
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get payment status:', error);
            res.status(404).json({
                success: false,
                error: 'Payment not found',
                message: error.message,
                timestamp: new Date(),
            });
        }
    }
    async getPaymentAnalytics(req, res) {
        try {
            const { jurisdiction, currency, startDate, endDate } = req.query;
            const filters = {};
            if (jurisdiction)
                filters.jurisdiction = jurisdiction;
            if (currency)
                filters.currency = currency;
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            const analytics = await this.globalPaymentService.getPaymentAnalytics(filters);
            res.status(200).json({
                success: true,
                data: analytics,
                message: 'Payment analytics retrieved successfully',
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get payment analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve payment analytics',
                message: error.message,
                timestamp: new Date(),
            });
        }
    }
    async getPaymentStatistics(req, res) {
        try {
            const statistics = this.globalPaymentService.getPaymentStatistics();
            res.status(200).json({
                success: true,
                data: statistics,
                message: 'Payment statistics retrieved successfully',
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get payment statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve payment statistics',
                message: error.message,
                timestamp: new Date(),
            });
        }
    }
    async healthCheck(req, res) {
        try {
            const statistics = this.globalPaymentService.getPaymentStatistics();
            res.status(200).json({
                success: true,
                data: {
                    service: 'Global Payment Service',
                    status: 'healthy',
                    uptime: process.uptime(),
                    statistics,
                    timestamp: new Date(),
                },
                message: 'Global payment service is healthy',
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Global payment service health check failed:', error);
            res.status(503).json({
                success: false,
                error: 'Service unhealthy',
                message: 'Global payment service is not responding',
                timestamp: new Date(),
            });
        }
    }
};
exports.GlobalPaymentController = GlobalPaymentController;
exports.GlobalPaymentController = GlobalPaymentController = __decorate([
    (0, ioc_1.injectable)(),
    __param(0, (0, ioc_1.inject)('GlobalPaymentService')),
    __metadata("design:paramtypes", [Object])
], GlobalPaymentController);
//# sourceMappingURL=GlobalPaymentController.js.map