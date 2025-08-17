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
exports.JobService = void 0;
const inversify_1 = require("inversify");
const sequelize_1 = require("sequelize");
const models_1 = require("@/models");
const types_1 = require("@/types");
const ProfileService_1 = require("./ProfileService");
const logger_1 = __importDefault(require("@/utils/logger"));
const container_1 = require("@/container");
let JobService = class JobService {
    constructor(profileService) {
        this.profileService = profileService;
    }
    async findUnpaidByProfile(profileId) {
        try {
            const jobs = await models_1.Job.findAll({
                where: { paid: false },
                include: [
                    {
                        model: models_1.Contract,
                        where: {
                            status: 'in_progress',
                            [sequelize_1.Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
                        },
                        include: [
                            { model: models_1.Profile, as: 'Client' },
                            { model: models_1.Profile, as: 'Contractor' },
                        ],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
            return jobs.map(job => job.toJSON());
        }
        catch (error) {
            logger_1.default.error('Error finding unpaid jobs by profile:', error);
            throw error;
        }
    }
    async payJob(jobId, clientId, transaction) {
        try {
            const job = await models_1.Job.findOne({
                where: { id: jobId, paid: false },
                include: [
                    {
                        model: models_1.Contract,
                        where: { status: 'in_progress', ClientId: clientId },
                        include: [{ model: models_1.Profile, as: 'Contractor' }],
                    },
                ],
                transaction,
            });
            if (!job) {
                throw new types_1.NotFoundError('Job not found or not payable');
            }
            const contractorId = job.Contract.Contractor.id;
            const jobPrice = parseFloat(job.price.toString());
            const client = await models_1.Profile.findByPk(clientId, { transaction });
            if (!client || !client.canAfford(jobPrice)) {
                throw new types_1.BusinessLogicError('Insufficient balance');
            }
            await this.profileService.deductBalance(clientId, jobPrice, transaction);
            await this.profileService.updateBalance(contractorId, jobPrice, transaction);
            job.markAsPaid();
            await job.save({ transaction });
            logger_1.default.info(`Job ${jobId} paid successfully by client ${clientId} to contractor ${contractorId}`);
        }
        catch (error) {
            logger_1.default.error('Error paying for job:', error);
            throw error;
        }
    }
    async getUnpaidJobsTotal(clientId) {
        try {
            const total = await models_1.Job.sum('price', {
                where: { paid: false },
                include: [
                    {
                        model: models_1.Contract,
                        where: { status: 'in_progress', ClientId: clientId },
                    },
                ],
            });
            return total || 0;
        }
        catch (error) {
            logger_1.default.error('Error getting unpaid jobs total:', error);
            throw error;
        }
    }
    async getBestProfession(startDate, endDate) {
        try {
            const result = await models_1.Job.findOne({
                attributes: [
                    [(0, sequelize_1.col)('Contract.Contractor.profession'), 'profession'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'totalEarned'],
                ],
                where: {
                    paid: true,
                    paymentDate: { [sequelize_1.Op.between]: [startDate, endDate] },
                },
                include: [
                    {
                        model: models_1.Contract,
                        include: [{ model: models_1.Profile, as: 'Contractor', attributes: [] }],
                    },
                ],
                group: ['Contract.Contractor.profession'],
                order: [[(0, sequelize_1.literal)('totalEarned'), 'DESC']],
                limit: 1,
            });
            return result ? result.getDataValue('profession') : null;
        }
        catch (error) {
            logger_1.default.error('Error getting best profession:', error);
            throw error;
        }
    }
    async getBestClients(startDate, endDate, limit) {
        try {
            const results = await models_1.Job.findAll({
                attributes: [
                    [(0, sequelize_1.col)('Contract.Client.id'), 'id'],
                    [(0, sequelize_1.fn)('CONCAT', (0, sequelize_1.col)('Contract.Client.firstName'), ' ', (0, sequelize_1.col)('Contract.Client.lastName')), 'fullName'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('price')), 'paid'],
                ],
                where: {
                    paid: true,
                    paymentDate: { [sequelize_1.Op.between]: [startDate, endDate] },
                },
                include: [
                    {
                        model: models_1.Contract,
                        include: [{ model: models_1.Profile, as: 'Client', attributes: [] }],
                    },
                ],
                group: ['Contract.Client.id'],
                order: [[(0, sequelize_1.literal)('paid'), 'DESC']],
                limit,
            });
            return results.map(result => ({
                id: result.getDataValue('id'),
                fullName: result.getDataValue('fullName'),
                paid: parseFloat(result.getDataValue('paid')),
            }));
        }
        catch (error) {
            logger_1.default.error('Error getting best clients:', error);
            throw error;
        }
    }
    async getJobStats(profileId) {
        try {
            const jobs = await models_1.Job.findAll({
                where: { paid: false },
                include: [
                    {
                        model: models_1.Contract,
                        where: {
                            status: 'in_progress',
                            [sequelize_1.Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
                        },
                    },
                ],
                attributes: ['paid', 'price'],
            });
            const paidJobs = await models_1.Job.findAll({
                where: { paid: true },
                include: [
                    {
                        model: models_1.Contract,
                        where: {
                            [sequelize_1.Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
                        },
                    },
                ],
                attributes: ['price'],
            });
            const stats = {
                total: jobs.length + paidJobs.length,
                paid: paidJobs.length,
                unpaid: jobs.length,
                totalEarned: jobs.reduce((sum, job) => sum + parseFloat(job.price.toString()), 0),
                totalPaid: paidJobs.reduce((sum, job) => sum + parseFloat(job.price.toString()), 0),
            };
            return stats;
        }
        catch (error) {
            logger_1.default.error('Error getting job statistics:', error);
            throw error;
        }
    }
    async validateJobOwnership(jobId, profileId) {
        try {
            const job = await models_1.Job.findOne({
                where: { id: jobId },
                include: [
                    {
                        model: models_1.Contract,
                        where: {
                            [sequelize_1.Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
                        },
                    },
                ],
            });
            return !!job;
        }
        catch (error) {
            logger_1.default.error('Error validating job ownership:', error);
            return false;
        }
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(container_1.TYPES.ProfileService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService])
], JobService);
//# sourceMappingURL=JobService.js.map