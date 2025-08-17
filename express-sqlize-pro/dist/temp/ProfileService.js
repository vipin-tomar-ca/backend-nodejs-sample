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
const inversify_1 = require("inversify");
const models_1 = require("@/models");
const types_1 = require("@/types");
const logger_1 = __importDefault(require("@/utils/logger"));
let ProfileService = class ProfileService {
    async findById(id) {
        try {
            const profile = await models_1.Profile.findByPk(id);
            return profile?.toJSON() || null;
        }
        catch (error) {
            logger_1.default.error('Error finding profile by ID:', error);
            throw error;
        }
    }
    async findByProfileId(profileId) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                logger_1.default.warn(`Profile not found with ID: ${profileId}`);
                return null;
            }
            return profile.toJSON();
        }
        catch (error) {
            logger_1.default.error('Error finding profile by profile ID:', error);
            throw error;
        }
    }
    async updateBalance(id, amount, transaction) {
        try {
            const profile = await models_1.Profile.findByPk(id, { transaction });
            if (!profile) {
                throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
            }
            if (typeof amount !== 'number' || isNaN(amount)) {
                throw new types_1.BusinessLogicError('Invalid amount provided');
            }
            profile.addAmount(amount);
            await profile.save({ transaction });
            logger_1.default.info(`Updated balance for profile ${id} by ${amount}`);
        }
        catch (error) {
            logger_1.default.error('Error updating profile balance:', error);
            throw error;
        }
    }
    async deductBalance(id, amount, transaction) {
        try {
            const profile = await models_1.Profile.findByPk(id, { transaction });
            if (!profile) {
                throw new types_1.NotFoundError(`Profile with ID ${id} not found`);
            }
            if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
                throw new types_1.BusinessLogicError('Invalid amount provided');
            }
            if (!profile.canAfford(amount)) {
                throw new types_1.BusinessLogicError('Insufficient balance');
            }
            profile.deductAmount(amount);
            await profile.save({ transaction });
            logger_1.default.info(`Deducted ${amount} from profile ${id} balance`);
        }
        catch (error) {
            logger_1.default.error('Error deducting from profile balance:', error);
            throw error;
        }
    }
    async getProfileWithFullName(id) {
        try {
            const profile = await models_1.Profile.findByPk(id, {
                attributes: ['id', 'firstName', 'lastName'],
            });
            if (!profile) {
                return null;
            }
            return {
                id: profile.id,
                fullName: profile.getFullName(),
            };
        }
        catch (error) {
            logger_1.default.error('Error getting profile with full name:', error);
            throw error;
        }
    }
    async validateProfileType(id, type) {
        try {
            const profile = await models_1.Profile.findByPk(id);
            return profile?.type === type;
        }
        catch (error) {
            logger_1.default.error('Error validating profile type:', error);
            return false;
        }
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, inversify_1.injectable)()
], ProfileService);
//# sourceMappingURL=ProfileService.js.map