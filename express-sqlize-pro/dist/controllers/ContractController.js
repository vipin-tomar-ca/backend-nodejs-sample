"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const types_1 = require("@/types");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = __importDefault(require("@/utils/logger"));
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
class ContractController {
    constructor() {
        this.getContractById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const authenticatedReq = req;
            const contractId = parseInt(id, 10);
            logger_1.default.info(`Getting contract ${contractId} for profile ${authenticatedReq.profile.id}`);
            const contract = await this.contractService.findById(contractId, authenticatedReq.profile.id);
            if (!contract) {
                throw new types_1.NotFoundError('Contract not found or not accessible');
            }
            res.json({
                success: true,
                data: contract,
            });
        });
        this.getContracts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const authenticatedReq = req;
            logger_1.default.info(`Getting contracts for profile ${authenticatedReq.profile.id}`);
            const contracts = await this.contractService.findActiveByProfile(authenticatedReq.profile.id);
            res.json({
                success: true,
                data: contracts,
            });
        });
        this.getContractStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const authenticatedReq = req;
            logger_1.default.info(`Getting contract stats for profile ${authenticatedReq.profile.id}`);
            const stats = await this.contractService.getContractStats(authenticatedReq.profile.id);
            res.json({
                success: true,
                data: stats,
            });
        });
        this.getContractsByStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { status } = req.params;
            const authenticatedReq = req;
            logger_1.default.info(`Getting contracts with status ${status} for profile ${authenticatedReq.profile.id}`);
            const contracts = await this.contractService.findByStatus(authenticatedReq.profile.id, status);
            res.json({
                success: true,
                data: contracts,
            });
        });
        this.contractService = container_1.default.get(container_2.TYPES.ContractService);
    }
}
exports.ContractController = ContractController;
//# sourceMappingURL=ContractController.js.map