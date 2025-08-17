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
exports.AuthMiddleware = void 0;
const ioc_1 = require("../container/ioc");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
let AuthMiddleware = class AuthMiddleware {
    constructor() {
        this.authenticate = async (req, res, next) => {
            try {
                const profileId = req.headers['profile_id'];
                if (!profileId) {
                    res.status(401).json({
                        success: false,
                        error: 'Profile ID is required',
                        message: 'Please provide a profile_id in the request headers',
                    });
                    return;
                }
                const profileIdNum = parseInt(profileId, 10);
                if (isNaN(profileIdNum)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid Profile ID',
                        message: 'Profile ID must be a valid number',
                    });
                    return;
                }
                try {
                    const profile = await models_1.Profile.findByPk(profileIdNum);
                    if (!profile) {
                        res.status(404).json({
                            success: false,
                            error: 'Profile not found',
                            message: `Profile with ID ${profileId} not found`,
                        });
                        return;
                    }
                    req.profile = {
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
                    logger_1.default.info(`Authenticated profile: ${profile.id} (${profile.firstName} ${profile.lastName})`);
                    next();
                }
                catch (error) {
                    logger_1.default.error('Authentication error:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Authentication failed',
                        message: 'Internal server error during authentication',
                    });
                }
            }
            catch (error) {
                logger_1.default.error('Auth middleware error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Authentication failed',
                    message: 'Internal server error',
                });
            }
        };
        this.authorizeClient = this.authorizeProfileType(['client']);
        this.authorizeContractor = this.authorizeProfileType(['contractor']);
        this.authorizeAny = this.authorizeProfileType(['client', 'contractor']);
    }
    authorizeProfileType(allowedTypes) {
        return (req, res, next) => {
            const authenticatedReq = req;
            if (!authenticatedReq.profile) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Please authenticate first',
                });
                return;
            }
            if (!allowedTypes.includes(authenticatedReq.profile.type)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    message: `Access denied. Required profile type: ${allowedTypes.join(' or ')}`,
                });
                return;
            }
            next();
        };
    }
    validateResourceOwnership(resourceIdParam) {
        return (req, res, next) => {
            const authenticatedReq = req;
            if (!authenticatedReq.profile) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Please authenticate first',
                });
                return;
            }
            const resourceId = parseInt(req.params[resourceIdParam], 10);
            if (isNaN(resourceId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid resource ID',
                    message: 'Resource ID must be a valid number',
                });
                return;
            }
            logger_1.default.info(`Resource ownership validated for profile ${authenticatedReq.profile.id} accessing resource ${resourceId}`);
            next();
        };
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, ioc_1.injectable)()
], AuthMiddleware);
//# sourceMappingURL=auth.js.map