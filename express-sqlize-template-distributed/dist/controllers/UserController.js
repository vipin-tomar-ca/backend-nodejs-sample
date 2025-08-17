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
exports.UserController = void 0;
const ioc_1 = require("../container/ioc");
const UserService_1 = require("../services/UserService");
const types_1 = require("../types");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async createUser(req, res) {
        try {
            const { email, firstName, lastName, password, role } = req.body;
            if (!email || !firstName || !lastName || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'email, firstName, lastName, and password are required',
                    timestamp: new Date(),
                });
                return;
            }
            const user = await this.userService.create({
                email,
                firstName,
                lastName,
                password,
                role: role || 'user',
            });
            const response = {
                success: true,
                data: user,
                message: 'User created successfully',
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message,
                    details: error.errors,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to create user',
                    timestamp: new Date(),
                });
            }
        }
    }
    async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'User ID must be a valid number',
                    timestamp: new Date(),
                });
                return;
            }
            const user = await this.userService.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: `User with ID ${userId} not found`,
                    timestamp: new Date(),
                });
                return;
            }
            const response = {
                success: true,
                data: user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to retrieve user',
                timestamp: new Date(),
            });
        }
    }
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const role = req.query.role;
            const search = req.query.search;
            const searchField = req.query.searchField || 'email';
            const offset = (page - 1) * limit;
            const options = {
                limit,
                offset,
                status,
                role,
                search,
                searchField,
                order: [['createdAt', 'DESC']],
            };
            const [users, total] = await Promise.all([
                this.userService.findAll(options),
                this.userService.count({ status, role }),
            ]);
            const totalPages = Math.ceil(total / limit);
            const paginatedResult = {
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
            const response = {
                success: true,
                data: paginatedResult,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to retrieve users',
                timestamp: new Date(),
            });
        }
    }
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'User ID must be a valid number',
                    timestamp: new Date(),
                });
                return;
            }
            const updateData = req.body;
            delete updateData.password;
            delete updateData.id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            const user = await this.userService.update(userId, updateData);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: `User with ID ${userId} not found`,
                    timestamp: new Date(),
                });
                return;
            }
            const response = {
                success: true,
                data: user,
                message: 'User updated successfully',
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message,
                    details: error.errors,
                    timestamp: new Date(),
                });
            }
            else if (error instanceof types_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: error.message,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to update user',
                    timestamp: new Date(),
                });
            }
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'User ID must be a valid number',
                    timestamp: new Date(),
                });
                return;
            }
            const success = await this.userService.delete(userId);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: `User with ID ${userId} not found`,
                    timestamp: new Date(),
                });
                return;
            }
            const response = {
                success: true,
                data: null,
                message: 'User deleted successfully',
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message,
                    details: error.errors,
                    timestamp: new Date(),
                });
            }
            else if (error instanceof types_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: error.message,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to delete user',
                    timestamp: new Date(),
                });
            }
        }
    }
    async getCurrentUser(req, res) {
        try {
            const authenticatedReq = req;
            if (!authenticatedReq.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                    timestamp: new Date(),
                });
                return;
            }
            const user = await this.userService.findById(authenticatedReq.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: 'User profile not found',
                    timestamp: new Date(),
                });
                return;
            }
            const response = {
                success: true,
                data: user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to retrieve user profile',
                timestamp: new Date(),
            });
        }
    }
    async updateCurrentUser(req, res) {
        try {
            const authenticatedReq = req;
            if (!authenticatedReq.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                    timestamp: new Date(),
                });
                return;
            }
            const updateData = req.body;
            delete updateData.password;
            delete updateData.role;
            delete updateData.status;
            delete updateData.id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            const user = await this.userService.update(authenticatedReq.user.id, updateData);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: 'User profile not found',
                    timestamp: new Date(),
                });
                return;
            }
            const response = {
                success: true,
                data: user,
                message: 'Profile updated successfully',
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message,
                    details: error.errors,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Failed to update profile',
                    timestamp: new Date(),
                });
            }
        }
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, ioc_1.injectable)(),
    __param(0, (0, ioc_1.inject)('UserService')),
    __metadata("design:paramtypes", [UserService_1.UserService])
], UserController);
//# sourceMappingURL=UserController.js.map