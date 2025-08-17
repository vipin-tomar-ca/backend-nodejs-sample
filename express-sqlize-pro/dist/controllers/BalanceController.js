"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceController = void 0;
const types_1 = require("@/types");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = __importDefault(require("@/utils/logger"));
const database_1 = __importDefault(require("@/database"));
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
class BalanceController {
    constructor() {
        this.depositBalance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const { amount } = req.body;
            const authenticatedReq = req;
            const targetUserId = parseInt(userId, 10);
            if (authenticatedReq.profile.id !== targetUserId) {
                throw new types_1.AuthorizationError('You can only deposit to your own balance');
            }
            if (authenticatedReq.profile.type !== 'client') {
                throw new types_1.AuthorizationError('Only clients can deposit money');
            }
            logger_1.default.info(`Processing deposit of ${amount} for client ${targetUserId}`);
            const transaction = await database_1.default.transaction();
            try {
                const unpaidJobsTotal = await this.jobService.getUnpaidJobsTotal(targetUserId);
                const maxDepositAmount = unpaidJobsTotal * 0.25;
                if (amount > maxDepositAmount) {
                    throw new types_1.BusinessLogicError(`Deposit amount cannot exceed 25% of unpaid jobs total ($${maxDepositAmount.toFixed(2)})`);
                }
                await this.profileService.updateBalance(targetUserId, amount, transaction);
                await transaction.commit();
                const updatedProfile = await this.profileService.findById(targetUserId);
                res.json({
                    success: true,
                    message: 'Deposit successful',
                    data: {
                        newBalance: updatedProfile?.balance,
                        depositedAmount: amount,
                    },
                });
            }
            catch (error) {
                await transaction.rollback();
                throw error;
            }
        });
        this.getBalance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const authenticatedReq = req;
            const targetUserId = parseInt(userId, 10);
            if (authenticatedReq.profile.id !== targetUserId) {
                throw new types_1.AuthorizationError('You can only view your own balance');
            }
            logger_1.default.info(`Getting balance for user ${targetUserId}`);
            const profile = await this.profileService.findById(targetUserId);
            const unpaidJobsTotal = await this.jobService.getUnpaidJobsTotal(targetUserId);
            const maxDepositAmount = unpaidJobsTotal * 0.25;
            res.json({
                success: true,
                data: {
                    balance: profile?.balance,
                    unpaidJobsTotal,
                    maxDepositAmount,
                },
            });
        });
        this.profileService = container_1.default.get(container_2.TYPES.ProfileService);
        this.jobService = container_1.default.get(container_2.TYPES.JobService);
    }
}
exports.BalanceController = BalanceController;
//# sourceMappingURL=BalanceController.js.map