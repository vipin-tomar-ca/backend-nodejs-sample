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
const contractController = container_1.default.get(container_2.TYPES.ContractController);
router.use(authMiddleware.authenticate);
router.get('/', contractController.getContracts);
router.get('/stats', contractController.getContractStats);
router.get('/status/:status', contractController.getContractsByStatus);
router.get('/:id', validation_1.validateContractId, contractController.getContractById);
exports.default = router;
//# sourceMappingURL=contracts.js.map