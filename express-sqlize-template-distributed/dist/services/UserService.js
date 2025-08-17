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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const ioc_1 = require("../container/ioc");
const User_1 = require("../models/User");
const types_1 = require("../types");
const BusinessRuleEngine_1 = require("./BusinessRuleEngine");
const ValidationService_1 = require("./ValidationService");
const LoggerService_1 = require("./LoggerService");
let UserService = class UserService {
    constructor(businessRuleEngine, validationService, logger) {
        this.businessRuleEngine = businessRuleEngine;
        this.validationService = validationService;
        this.logger = logger;
    }
    async create(data) {
        try {
            this.logger.info('Creating new user', { email: data.email });
            const validationResult = await this.validateUserData(data);
            if (!validationResult.isValid) {
                throw new types_1.ValidationError('User validation failed', validationResult.errors);
            }
            const businessRuleContext = {
                email: data.email,
                role: data.role,
                status: data.status,
                action: 'create',
            };
            const businessRuleResults = await this.businessRuleEngine.executeRules('USER_CREATION', businessRuleContext);
            const criticalFailures = businessRuleResults.filter(result => result.severity === 'error' || result.severity === 'critical');
            if (criticalFailures.length > 0) {
                throw new types_1.ValidationError(`Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`);
            }
            const existingUser = await User_1.User.findOne({ where: { email: data.email } });
            if (existingUser) {
                throw new types_1.ValidationError('User with this email already exists');
            }
            const user = await User_1.User.create(data);
            this.logger.info('User created successfully', { userId: user.id, email: user.email });
            return user;
        }
        catch (error) {
            this.logger.error('Failed to create user', { error: error.message, email: data.email });
            throw error;
        }
    }
    async findById(id) {
        try {
            const user = await User_1.User.findByPk(id);
            if (!user) {
                this.logger.warn('User not found', { userId: id });
                return null;
            }
            return user;
        }
        catch (error) {
            this.logger.error('Failed to find user by ID', { error: error.message, userId: id });
            throw error;
        }
    }
    async findAll(options) {
        try {
            const where = {};
            if (options?.status) {
                where.status = options.status;
            }
            if (options?.role) {
                where.role = options.role;
            }
            if (options?.search) {
                where[options.searchField || 'email'] = {
                    [require('sequelize').Op.like]: `%${options.search}%`
                };
            }
            const users = await User_1.User.findAll({
                where,
                order: options?.order || [['createdAt', 'DESC']],
                limit: options?.limit,
                offset: options?.offset,
            });
            return users;
        }
        catch (error) {
            this.logger.error('Failed to find users', { error: error.message, options });
            throw error;
        }
    }
    async update(id, data) {
        try {
            this.logger.info('Updating user', { userId: id });
            const user = await this.findById(id);
            if (!user) {
                throw new types_1.NotFoundError(`User with ID ${id} not found`);
            }
            const validationResult = await this.validateUserData(data, true);
            if (!validationResult.isValid) {
                throw new types_1.ValidationError('User validation failed', validationResult.errors);
            }
            const businessRuleContext = {
                userId: id,
                currentData: user,
                newData: data,
                action: 'update',
            };
            const businessRuleResults = await this.businessRuleEngine.executeRules('USER_UPDATE', businessRuleContext);
            const criticalFailures = businessRuleResults.filter(result => result.severity === 'error' || result.severity === 'critical');
            if (criticalFailures.length > 0) {
                throw new types_1.ValidationError(`Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`);
            }
            await user.update(data);
            this.logger.info('User updated successfully', { userId: id });
            return user;
        }
        catch (error) {
            this.logger.error('Failed to update user', { error: error.message, userId: id });
            throw error;
        }
    }
    async delete(id) {
        try {
            this.logger.info('Deleting user', { userId: id });
            const user = await this.findById(id);
            if (!user) {
                throw new types_1.NotFoundError(`User with ID ${id} not found`);
            }
            const businessRuleContext = {
                userId: id,
                userData: user,
                action: 'delete',
            };
            const businessRuleResults = await this.businessRuleEngine.executeRules('USER_DELETE', businessRuleContext);
            const criticalFailures = businessRuleResults.filter(result => result.severity === 'error' || result.severity === 'critical');
            if (criticalFailures.length > 0) {
                throw new types_1.ValidationError(`Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`);
            }
            await user.update({ status: 'deleted' });
            this.logger.info('User deleted successfully', { userId: id });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete user', { error: error.message, userId: id });
            throw error;
        }
    }
    async count(options) {
        try {
            const where = {};
            if (options?.status) {
                where.status = options.status;
            }
            if (options?.role) {
                where.role = options.role;
            }
            return await User_1.User.count({ where });
        }
        catch (error) {
            this.logger.error('Failed to count users', { error: error.message, options });
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const user = await User_1.User.findOne({ where: { email } });
            return user;
        }
        catch (error) {
            this.logger.error('Failed to find user by email', { error: error.message, email });
            throw error;
        }
    }
    async updateLastLogin(id) {
        try {
            await User_1.User.update({ lastLoginAt: new Date() }, { where: { id } });
        }
        catch (error) {
            this.logger.error('Failed to update last login', { error: error.message, userId: id });
            throw error;
        }
    }
    async validateUserData(data, isUpdate = false) {
        const errors = [];
        if (!isUpdate || data.email !== undefined) {
            if (!data.email) {
                errors.push({ field: 'email', message: 'Email is required' });
            }
            else if (!this.validationService.isValidEmail(data.email)) {
                errors.push({ field: 'email', message: 'Invalid email format' });
            }
        }
        if (!isUpdate) {
            if (!data.password) {
                errors.push({ field: 'password', message: 'Password is required' });
            }
            else if (data.password.length < 6) {
                errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
            }
        }
        if (!isUpdate || data.firstName !== undefined) {
            if (!data.firstName || data.firstName.trim().length === 0) {
                errors.push({ field: 'firstName', message: 'First name is required' });
            }
        }
        if (!isUpdate || data.lastName !== undefined) {
            if (!data.lastName || data.lastName.trim().length === 0) {
                errors.push({ field: 'lastName', message: 'Last name is required' });
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, ioc_1.injectable)(),
    __param(0, (0, ioc_1.inject)('BusinessRuleEngine')),
    __param(1, (0, ioc_1.inject)('ValidationService')),
    __param(2, (0, ioc_1.inject)('LoggerService')),
    __metadata("design:paramtypes", [BusinessRuleEngine_1.BusinessRuleEngine,
        ValidationService_1.ValidationService,
        LoggerService_1.LoggerService])
], UserService);
//# sourceMappingURL=UserService.js.map