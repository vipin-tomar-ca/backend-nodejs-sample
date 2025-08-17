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
exports.ContractService = void 0;
const ioc_1 = require("../container/ioc");
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
let ContractService = class ContractService {
    async getContractById(id, transaction) {
        const contract = await models_1.Contract.findByPk(id, {
            include: [
                { model: models_1.Profile, as: 'Client' },
                { model: models_1.Profile, as: 'Contractor' },
            ],
            transaction,
        });
        if (!contract) {
            throw new types_1.NotFoundError(`Contract with ID ${id} not found`);
        }
        return {
            id: contract.id,
            terms: contract.terms,
            status: contract.status,
            ClientId: contract.ClientId,
            ContractorId: contract.ContractorId,
            Client: contract.Client ? {
                id: contract.Client.id,
                firstName: contract.Client.firstName,
                lastName: contract.Client.lastName,
                profession: contract.Client.profession,
                balance: parseFloat(contract.Client.balance.toString()),
                type: contract.Client.type,
                version: contract.Client.version,
                createdAt: contract.Client.createdAt,
                updatedAt: contract.Client.updatedAt,
            } : undefined,
            Contractor: contract.Contractor ? {
                id: contract.Contractor.id,
                firstName: contract.Contractor.firstName,
                lastName: contract.Contractor.lastName,
                profession: contract.Contractor.profession,
                balance: parseFloat(contract.Contractor.balance.toString()),
                type: contract.Contractor.type,
                version: contract.Contractor.version,
                createdAt: contract.Contractor.createdAt,
                updatedAt: contract.Contractor.updatedAt,
            } : undefined,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt,
        };
    }
    async getAllContracts(transaction) {
        const contracts = await models_1.Contract.findAll({
            include: [
                { model: models_1.Profile, as: 'Client' },
                { model: models_1.Profile, as: 'Contractor' },
            ],
            transaction,
        });
        return contracts.map(contract => ({
            id: contract.id,
            terms: contract.terms,
            status: contract.status,
            ClientId: contract.ClientId,
            ContractorId: contract.ContractorId,
            Client: contract.Client ? {
                id: contract.Client.id,
                firstName: contract.Client.firstName,
                lastName: contract.Client.lastName,
                profession: contract.Client.profession,
                balance: parseFloat(contract.Client.balance.toString()),
                type: contract.Client.type,
                version: contract.Client.version,
                createdAt: contract.Client.createdAt,
                updatedAt: contract.Client.updatedAt,
            } : undefined,
            Contractor: contract.Contractor ? {
                id: contract.Contractor.id,
                firstName: contract.Contractor.firstName,
                lastName: contract.Contractor.lastName,
                profession: contract.Contractor.profession,
                balance: parseFloat(contract.Contractor.balance.toString()),
                type: contract.Contractor.type,
                version: contract.Contractor.version,
                createdAt: contract.Contractor.createdAt,
                updatedAt: contract.Contractor.updatedAt,
            } : undefined,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt,
        }));
    }
    async getContractsByStatus(status, transaction) {
        const contracts = await models_1.Contract.findAll({
            where: { status },
            include: [
                { model: models_1.Profile, as: 'Client' },
                { model: models_1.Profile, as: 'Contractor' },
            ],
            transaction,
        });
        return contracts.map(contract => ({
            id: contract.id,
            terms: contract.terms,
            status: contract.status,
            ClientId: contract.ClientId,
            ContractorId: contract.ContractorId,
            Client: contract.Client ? {
                id: contract.Client.id,
                firstName: contract.Client.firstName,
                lastName: contract.Client.lastName,
                profession: contract.Client.profession,
                balance: parseFloat(contract.Client.balance.toString()),
                type: contract.Client.type,
                version: contract.Client.version,
                createdAt: contract.Client.createdAt,
                updatedAt: contract.Client.updatedAt,
            } : undefined,
            Contractor: contract.Contractor ? {
                id: contract.Contractor.id,
                firstName: contract.Contractor.firstName,
                lastName: contract.Contractor.lastName,
                profession: contract.Contractor.profession,
                balance: parseFloat(contract.Contractor.balance.toString()),
                type: contract.Contractor.type,
                version: contract.Contractor.version,
                createdAt: contract.Contractor.createdAt,
                updatedAt: contract.Contractor.updatedAt,
            } : undefined,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt,
        }));
    }
    async getContractsByProfile(profileId, transaction) {
        const contracts = await models_1.Contract.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { ClientId: profileId },
                    { ContractorId: profileId },
                ],
            },
            include: [
                { model: models_1.Profile, as: 'Client' },
                { model: models_1.Profile, as: 'Contractor' },
            ],
            transaction,
        });
        return contracts.map(contract => ({
            id: contract.id,
            terms: contract.terms,
            status: contract.status,
            ClientId: contract.ClientId,
            ContractorId: contract.ContractorId,
            Client: contract.Client ? {
                id: contract.Client.id,
                firstName: contract.Client.firstName,
                lastName: contract.Client.lastName,
                profession: contract.Client.profession,
                balance: parseFloat(contract.Client.balance.toString()),
                type: contract.Client.type,
                version: contract.Client.version,
                createdAt: contract.Client.createdAt,
                updatedAt: contract.Client.updatedAt,
            } : undefined,
            Contractor: contract.Contractor ? {
                id: contract.Contractor.id,
                firstName: contract.Contractor.firstName,
                lastName: contract.Contractor.lastName,
                profession: contract.Contractor.profession,
                balance: parseFloat(contract.Contractor.balance.toString()),
                type: contract.Contractor.type,
                version: contract.Contractor.version,
                createdAt: contract.Contractor.createdAt,
                updatedAt: contract.Contractor.updatedAt,
            } : undefined,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt,
        }));
    }
    async createContract(contractData, transaction) {
        const contract = await models_1.Contract.create({
            terms: contractData.terms,
            status: contractData.status,
            ClientId: contractData.ClientId,
            ContractorId: contractData.ContractorId,
        }, { transaction });
        logger_1.default.info(`Created contract with ID: ${contract.id}`);
        return this.getContractById(contract.id, transaction);
    }
    async updateContractStatus(id, status, transaction) {
        const contract = await models_1.Contract.findByPk(id, { transaction });
        if (!contract) {
            throw new types_1.NotFoundError(`Contract with ID ${id} not found`);
        }
        contract.status = status;
        await contract.save({ transaction });
        logger_1.default.info(`Updated contract ${id} status to: ${status}`);
        return this.getContractById(id, transaction);
    }
    async getContractStats(transaction) {
        const contracts = await models_1.Contract.findAll({ transaction });
        const totalContracts = contracts.length;
        const activeContracts = contracts.filter(c => c.status === 'in_progress').length;
        const terminatedContracts = contracts.filter(c => c.status === 'terminated').length;
        const newContracts = contracts.filter(c => c.status === 'new').length;
        return {
            totalContracts,
            activeContracts,
            terminatedContracts,
            newContracts,
        };
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, ioc_1.injectable)()
], ContractService);
//# sourceMappingURL=ContractService.js.map