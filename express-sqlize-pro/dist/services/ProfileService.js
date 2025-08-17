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
exports.ProfileService = void 0;
const ioc_1 = require("../container/ioc");
const models_1 = require("../models");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
let ProfileService = class ProfileService {
    async getProfileById(id, transaction) {
        const profile = await models_1.Profile.findByPk(id, { transaction });
        if (!profile) {
            throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
        }
        return {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            balance: parseFloat(profile.balance.toString()),
            type: profile.type,
            version: profile.version,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    async getAllProfiles(transaction) {
        const profiles = await models_1.Profile.findAll({ transaction });
        return profiles.map(profile => ({
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            balance: parseFloat(profile.balance.toString()),
            type: profile.type,
            version: profile.version,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        }));
    }
    async createProfile(profileData, transaction) {
        const profile = await models_1.Profile.create({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            profession: profileData.profession,
            balance: profileData.balance,
            type: profileData.type,
            version: 1,
        }, { transaction });
        logger_1.default.info(`Created profile with ID: ${profile.id}`);
        return {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            balance: parseFloat(profile.balance.toString()),
            type: profile.type,
            version: profile.version,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    async updateBalance(id, amount, transaction) {
        const profile = await models_1.Profile.findByPk(id, { transaction });
        if (!profile) {
            throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
        }
        const newBalance = parseFloat(profile.balance.toString()) + amount;
        if (newBalance < 0) {
            throw new types_1.BusinessLogicError('Insufficient balance');
        }
        profile.balance = newBalance;
        profile.version += 1;
        await profile.save({ transaction });
        logger_1.default.info(`Updated balance for profile ${id}: ${amount} (new balance: ${newBalance})`);
        return {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            balance: parseFloat(profile.balance.toString()),
            type: profile.type,
            version: profile.version,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    async getProfilesByType(type, transaction) {
        const profiles = await models_1.Profile.findAll({
            where: { type },
            transaction,
        });
        return profiles.map(profile => ({
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            balance: parseFloat(profile.balance.toString()),
            type: profile.type,
            version: profile.version,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        }));
    }
    async getProfileStats(transaction) {
        const profiles = await models_1.Profile.findAll({ transaction });
        const totalProfiles = profiles.length;
        const clients = profiles.filter(p => p.type === 'client').length;
        const contractors = profiles.filter(p => p.type === 'contractor').length;
        const totalBalance = profiles.reduce((sum, p) => sum + parseFloat(p.balance.toString()), 0);
        const averageBalance = totalProfiles > 0 ? totalBalance / totalProfiles : 0;
        return {
            totalProfiles,
            clients,
            contractors,
            totalBalance,
            averageBalance,
        };
    }
    async canAfford(id, amount, transaction) {
        const profile = await models_1.Profile.findByPk(id, { transaction });
        if (!profile) {
            throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
        }
        return parseFloat(profile.balance.toString()) >= amount;
    }
    async getProfileFullName(id, transaction) {
        const profile = await models_1.Profile.findByPk(id, { transaction });
        if (!profile) {
            throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
        }
        return `${profile.firstName} ${profile.lastName}`;
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, ioc_1.injectable)()
], ProfileService);
//# sourceMappingURL=ProfileService.js.map