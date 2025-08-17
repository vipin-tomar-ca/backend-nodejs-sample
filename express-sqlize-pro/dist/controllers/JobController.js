"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const types_1 = require("@/types");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = __importDefault(require("@/utils/logger"));
const database_1 = __importDefault(require("@/database"));
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
class JobController {
    constructor() {
        this.getUnpaidJobs = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const authenticatedReq = req;
            logger_1.default.info(`Getting unpaid jobs for profile ${authenticatedReq.profile.id}`);
            const jobs = await this.jobService.findUnpaidByProfile(authenticatedReq.profile.id);
            res.json({
                success: true,
                data: jobs,
            });
        });
        this.payJob = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { job_id } = req.params;
            const authenticatedReq = req;
            const jobId = parseInt(job_id, 10);
            if (authenticatedReq.profile.type !== 'client') {
                throw new types_1.AuthorizationError('Only clients can pay for jobs');
            }
            logger_1.default.info(`Processing payment for job ${jobId} by client ${authenticatedReq.profile.id}`);
            const transaction = await database_1.default.transaction();
            try {
                await this.jobService.payJob(jobId, authenticatedReq.profile.id, transaction);
                await transaction.commit();
                res.json({
                    success: true,
                    message: 'Payment processed successfully',
                });
            }
            catch (error) {
                await transaction.rollback();
                throw error;
            }
        });
        this.getJobStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const authenticatedReq = req;
            logger_1.default.info(`Getting job stats for profile ${authenticatedReq.profile.id}`);
            const stats = await this.jobService.getJobStats(authenticatedReq.profile.id);
            res.json({
                success: true,
                data: stats,
            });
        });
        this.jobService = container_1.default.get(container_2.TYPES.JobService);
    }
}
exports.JobController = JobController;
//# sourceMappingURL=JobController.js.map