"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const types_1 = require("@/types");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = __importDefault(require("@/utils/logger"));
const moment_1 = __importDefault(require("moment"));
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
class AdminController {
    constructor() {
        this.getBestProfession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { start, end } = req.query;
            const authenticatedReq = req;
            if (!start || !end) {
                throw new types_1.ValidationError('Start and end dates are required');
            }
            const startDate = (0, moment_1.default)(start).toDate();
            const endDate = (0, moment_1.default)(end).toDate();
            if (startDate >= endDate) {
                throw new types_1.ValidationError('Start date must be before end date');
            }
            logger_1.default.info(`Getting best profession from ${start} to ${end}`);
            const profession = await this.jobService.getBestProfession(startDate, endDate);
            if (!profession) {
                res.json({
                    success: true,
                    data: null,
                    message: 'No data found for the specified date range',
                });
                return;
            }
            res.json({
                success: true,
                data: profession,
            });
        });
        this.getBestClients = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { start, end, limit = '2' } = req.query;
            const authenticatedReq = req;
            if (!start || !end) {
                throw new types_1.ValidationError('Start and end dates are required');
            }
            const startDate = (0, moment_1.default)(start).toDate();
            const endDate = (0, moment_1.default)(end).toDate();
            const limitNum = parseInt(limit, 10);
            if (startDate >= endDate) {
                throw new types_1.ValidationError('Start date must be before end date');
            }
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                throw new types_1.ValidationError('Limit must be a number between 1 and 100');
            }
            logger_1.default.info(`Getting best clients from ${start} to ${end} with limit ${limitNum}`);
            const clients = await this.jobService.getBestClients(startDate, endDate, limitNum);
            res.json({
                success: true,
                data: clients,
            });
        });
        this.getAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { start, end } = req.query;
            const authenticatedReq = req;
            if (!start || !end) {
                throw new types_1.ValidationError('Start and end dates are required');
            }
            const startDate = (0, moment_1.default)(start).toDate();
            const endDate = (0, moment_1.default)(end).toDate();
            if (startDate >= endDate) {
                throw new types_1.ValidationError('Start date must be before end date');
            }
            logger_1.default.info(`Getting analytics from ${start} to ${end}`);
            const [bestProfession, bestClients] = await Promise.all([
                this.jobService.getBestProfession(startDate, endDate),
                this.jobService.getBestClients(startDate, endDate, 5),
            ]);
            res.json({
                success: true,
                data: {
                    bestProfession,
                    bestClients,
                    dateRange: {
                        start: startDate,
                        end: endDate,
                    },
                },
            });
        });
        this.jobService = container_1.default.get(container_2.TYPES.JobService);
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map