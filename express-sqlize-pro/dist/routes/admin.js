"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("@/middleware/validation");
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
const router = (0, express_1.Router)();
const authMiddleware = container_1.default.get(container_2.TYPES.AuthMiddleware);
const adminController = container_1.default.get(container_2.TYPES.AdminController);
router.use(authMiddleware.authenticate);
router.get('/best-profession', validation_1.validateDateRange, adminController.getBestProfession);
router.get('/best-clients', validation_1.validateAdminQuery, adminController.getBestClients);
router.get('/analytics', validation_1.validateDateRange, adminController.getAnalytics);
exports.default = router;
//# sourceMappingURL=admin.js.map