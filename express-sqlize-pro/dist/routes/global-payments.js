"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = __importStar(require("../container"));
const router = (0, express_1.Router)();
const globalPaymentController = container_1.default.get(container_1.TYPES.GlobalPaymentController);
const authMiddleware = container_1.default.get(container_1.TYPES.AuthMiddleware);
router.use(authMiddleware.authenticate);
router.post('/process', authMiddleware.authorizeClient, globalPaymentController.processPayment.bind(globalPaymentController));
router.post('/batch', authMiddleware.authorizeClient, globalPaymentController.processBatchPayments.bind(globalPaymentController));
router.get('/status/:paymentId', authMiddleware.authorizeAny, globalPaymentController.getPaymentStatus.bind(globalPaymentController));
router.get('/analytics', authMiddleware.authorizeAny, globalPaymentController.getPaymentAnalytics.bind(globalPaymentController));
router.get('/statistics', authMiddleware.authorizeAny, globalPaymentController.getPaymentStatistics.bind(globalPaymentController));
router.get('/health', globalPaymentController.healthCheck.bind(globalPaymentController));
exports.default = router;
//# sourceMappingURL=global-payments.js.map