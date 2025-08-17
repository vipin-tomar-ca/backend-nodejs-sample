"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const ioc_1 = require("../container/ioc");
const models_1 = require("../models");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
let JobService = class JobService {
    async getJobById(id, transaction) {
        const job = await models_1.Job.findByPk(id, {
            include: [
                { model: models_1.Contract, include: [
                        { model: models_1.Profile, as: 'Client' },
                        { model: models_1.Profile, as: 'Contractor' },
                    ] },
            ],
            transaction,
        });
        if (!job) {
            throw new types_1.NotFoundError(`Job with ID ${id} not found`);
        }
        return {
            id: job.id,
            description: job.description,
            price: parseFloat(job.price.toString()),
            paid: job.paid,
            paymentDate: job.paymentDate,
            ContractId: job.ContractId,
            Contract: job.Contract ? {
                id: job.Contract.id,
                terms: job.Contract.terms,
                status: job.Contract.status,
                ClientId: job.Contract.ClientId,
                ContractorId: job.Contract.ContractorId,
                Client: job.Contract.Client ? {
                    id: job.Contract.Client.id,
                    firstName: job.Contract.Client.firstName,
                    lastName: job.Contract.Client.lastName,
                    profession: job.Contract.Client.profession,
                    balance: parseFloat(job.Contract.Client.balance.toString()),
                    type: job.Contract.Client.type,
                    version: job.Contract.Client.version,
                    createdAt: job.Contract.Client.createdAt,
                    updatedAt: job.Contract.Client.updatedAt,
                } : undefined,
                Contractor: job.Contract.Contractor ? {
                    id: job.Contract.Contractor.id,
                    firstName: job.Contract.Contractor.firstName,
                    lastName: job.Contract.Contractor.lastName,
                    profession: job.Contract.Contractor.profession,
                    balance: parseFloat(job.Contract.Contractor.balance.toString()),
                    type: job.Contract.Contractor.type,
                    version: job.Contract.Contractor.version,
                    createdAt: job.Contract.Contractor.createdAt,
                    updatedAt: job.Contract.Contractor.updatedAt,
                } : undefined,
                createdAt: job.Contract.createdAt,
                updatedAt: job.Contract.updatedAt,
            } : undefined,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }
    async getAllJobs(transaction) {
        const jobs = await models_1.Job.findAll({
            include: [
                { model: models_1.Contract, include: [
                        { model: models_1.Profile, as: 'Client' },
                        { model: models_1.Profile, as: 'Contractor' },
                    ] },
            ],
            transaction,
        });
        return jobs.map(job => ({
            id: job.id,
            description: job.description,
            price: parseFloat(job.price.toString()),
            paid: job.paid,
            paymentDate: job.paymentDate,
            ContractId: job.ContractId,
            Contract: job.Contract ? {
                id: job.Contract.id,
                terms: job.Contract.terms,
                status: job.Contract.status,
                ClientId: job.Contract.ClientId,
                ContractorId: job.Contract.ContractorId,
                Client: job.Contract.Client ? {
                    id: job.Contract.Client.id,
                    firstName: job.Contract.Client.firstName,
                    lastName: job.Contract.Client.lastName,
                    profession: job.Contract.Client.profession,
                    balance: parseFloat(job.Contract.Client.balance.toString()),
                    type: job.Contract.Client.type,
                    version: job.Contract.Client.version,
                    createdAt: job.Contract.Client.createdAt,
                    updatedAt: job.Contract.Client.updatedAt,
                } : undefined,
                Contractor: job.Contract.Contractor ? {
                    id: job.Contract.Contractor.id,
                    firstName: job.Contract.Contractor.firstName,
                    lastName: job.Contract.Contractor.lastName,
                    profession: job.Contract.Contractor.profession,
                    balance: parseFloat(job.Contract.Contractor.balance.toString()),
                    type: job.Contract.Contractor.type,
                    version: job.Contract.Contractor.version,
                    createdAt: job.Contract.Contractor.createdAt,
                    updatedAt: job.Contract.Contractor.updatedAt,
                } : undefined,
                createdAt: job.Contract.createdAt,
                updatedAt: job.Contract.updatedAt,
            } : undefined,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }));
    }
    async getUnpaidJobs(transaction) {
        const jobs = await models_1.Job.findAll({
            where: { paid: false },
            include: [
                { model: models_1.Contract, include: [
                        { model: models_1.Profile, as: 'Client' },
                        { model: models_1.Profile, as: 'Contractor' },
                    ] },
            ],
            transaction,
        });
        return jobs.map(job => ({
            id: job.id,
            description: job.description,
            price: parseFloat(job.price.toString()),
            paid: job.paid,
            paymentDate: job.paymentDate,
            ContractId: job.ContractId,
            Contract: job.Contract ? {
                id: job.Contract.id,
                terms: job.Contract.terms,
                status: job.Contract.status,
                ClientId: job.Contract.ClientId,
                ContractorId: job.Contract.ContractorId,
                Client: job.Contract.Client ? {
                    id: job.Contract.Client.id,
                    firstName: job.Contract.Client.firstName,
                    lastName: job.Contract.Client.lastName,
                    profession: job.Contract.Client.profession,
                    balance: parseFloat(job.Contract.Client.balance.toString()),
                    type: job.Contract.Client.type,
                    version: job.Contract.Client.version,
                    createdAt: job.Contract.Client.createdAt,
                    updatedAt: job.Contract.Client.updatedAt,
                } : undefined,
                Contractor: job.Contract.Contractor ? {
                    id: job.Contract.Contractor.id,
                    firstName: job.Contract.Contractor.firstName,
                    lastName: job.Contract.Contractor.lastName,
                    profession: job.Contract.Contractor.profession,
                    balance: parseFloat(job.Contract.Contractor.balance.toString()),
                    type: job.Contract.Contractor.type,
                    version: job.Contract.Contractor.version,
                    createdAt: job.Contract.Contractor.createdAt,
                    updatedAt: job.Contract.Contractor.updatedAt,
                } : undefined,
                createdAt: job.Contract.createdAt,
                updatedAt: job.Contract.updatedAt,
            } : undefined,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }));
    }
    async getJobsByContract(contractId, transaction) {
        const jobs = await models_1.Job.findAll({
            where: { ContractId: contractId },
            include: [
                { model: models_1.Contract, include: [
                        { model: models_1.Profile, as: 'Client' },
                        { model: models_1.Profile, as: 'Contractor' },
                    ] },
            ],
            transaction,
        });
        return jobs.map(job => ({
            id: job.id,
            description: job.description,
            price: parseFloat(job.price.toString()),
            paid: job.paid,
            paymentDate: job.paymentDate,
            ContractId: job.ContractId,
            Contract: job.Contract ? {
                id: job.Contract.id,
                terms: job.Contract.terms,
                status: job.Contract.status,
                ClientId: job.Contract.ClientId,
                ContractorId: job.Contract.ContractorId,
                Client: job.Contract.Client ? {
                    id: job.Contract.Client.id,
                    firstName: job.Contract.Client.firstName,
                    lastName: job.Contract.Client.lastName,
                    profession: job.Contract.Client.profession,
                    balance: parseFloat(job.Contract.Client.balance.toString()),
                    type: job.Contract.Client.type,
                    version: job.Contract.Client.version,
                    createdAt: job.Contract.Client.createdAt,
                    updatedAt: job.Contract.Client.updatedAt,
                } : undefined,
                Contractor: job.Contract.Contractor ? {
                    id: job.Contract.Contractor.id,
                    firstName: job.Contract.Contractor.firstName,
                    lastName: job.Contract.Contractor.lastName,
                    profession: job.Contract.Contractor.profession,
                    balance: parseFloat(job.Contract.Contractor.balance.toString()),
                    type: job.Contract.Contractor.type,
                    version: job.Contract.Contractor.version,
                    createdAt: job.Contract.Contractor.createdAt,
                    updatedAt: job.Contract.Contractor.updatedAt,
                } : undefined,
                createdAt: job.Contract.createdAt,
                updatedAt: job.Contract.updatedAt,
            } : undefined,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }));
    }
    async createJob(jobData, transaction) {
        const job = await models_1.Job.create({
            description: jobData.description,
            price: jobData.price,
            paid: jobData.paid || false,
            paymentDate: jobData.paymentDate,
            ContractId: jobData.ContractId,
        }, { transaction });
        logger_1.default.info(`Created job with ID: ${job.id}`);
        return this.getJobById(job.id, transaction);
    }
    async payJob(jobId, clientId, transaction) {
        const job = await models_1.Job.findOne({
            where: { id: jobId, paid: false },
            include: [
                { model: models_1.Contract, where: { status: 'in_progress', ClientId: clientId }, include: [
                        { model: models_1.Profile, as: 'Client' },
                        { model: models_1.Profile, as: 'Contractor' },
                    ] },
            ],
            transaction,
        });
        if (!job) {
            throw new types_1.NotFoundError(`Job with ID ${jobId} not found or not payable`);
        }
        const jobPrice = parseFloat(job.price.toString());
        const client = await models_1.Profile.findByPk(clientId, { transaction });
        if (!client || parseFloat(client.balance.toString()) < jobPrice) {
            throw new types_1.BusinessLogicError('Insufficient balance to pay job');
        }
        job.paid = true;
        job.paymentDate = new Date();
        await job.save({ transaction });
        client.balance = parseFloat(client.balance.toString()) - jobPrice;
        client.version += 1;
        await client.save({ transaction });
        const contractorId = job.Contract.Contractor.id;
        const contractor = await models_1.Profile.findByPk(contractorId, { transaction });
        if (contractor) {
            contractor.balance = parseFloat(contractor.balance.toString()) + jobPrice;
            contractor.version += 1;
            await contractor.save({ transaction });
        }
        logger_1.default.info(`Job ${jobId} paid successfully by client ${clientId}`);
        return this.getJobById(jobId, transaction);
    }
    async getJobStats(transaction) {
        const jobs = await models_1.Job.findAll({ transaction });
        const totalJobs = jobs.length;
        const paidJobs = jobs.filter(j => j.paid).length;
        const unpaidJobs = jobs.filter(j => !j.paid).length;
        const totalValue = jobs.reduce((sum, j) => sum + parseFloat(j.price.toString()), 0);
        const averageJobValue = totalJobs > 0 ? totalValue / totalJobs : 0;
        return {
            totalJobs,
            paidJobs,
            unpaidJobs,
            totalValue,
            averageJobValue,
        };
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, ioc_1.injectable)()
], JobService);
//# sourceMappingURL=JobService.js.map