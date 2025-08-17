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
const balanceController = container_1.default.get(container_2.TYPES.BalanceController);
router.use(authMiddleware.authenticate);
router.get('/:userId', validation_1.validateProfileId, balanceController.getBalance);
router.post('/deposit/:userId', validation_1.validateDeposit, balanceController.depositBalance);
exports.default = router;
//# sourceMappingURL=balances.js.map