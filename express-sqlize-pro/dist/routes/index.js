"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const global_payments_1 = __importDefault(require("./global-payments"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Deel Backend Assignment - Global Payroll System is running!',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        features: {
            core: true,
            globalPayroll: true,
            multiCurrency: true,
            compliance: true,
            sagaPattern: true,
            eventSourcing: true,
            businessRuleEngine: true,
            ioc: true,
            dependencyInjection: true,
        },
        architecture: {
            cleanArchitecture: true,
            solidPrinciples: true,
            iocContainer: true,
            businessRuleEngine: true,
            distributedTransactions: true,
            eventSourcing: true,
            multiCurrency: true,
            compliance: true,
        },
    });
});
router.use('/global-payments', global_payments_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map