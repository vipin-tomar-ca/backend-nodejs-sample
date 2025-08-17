"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRateLimit = exports.uploadRateLimit = exports.burstRateLimit = exports.dynamicRateLimit = exports.slowDownMiddleware = exports.authRateLimit = exports.rateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: 'Too many requests from this IP, please try again later.',
            timestamp: new Date(),
        });
    },
});
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too Many Authentication Attempts',
        message: 'Too many authentication attempts, please try again later.',
        timestamp: new Date(),
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too Many Authentication Attempts',
            message: 'Too many authentication attempts, please try again later.',
            timestamp: new Date(),
        });
    },
});
exports.slowDownMiddleware = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 500,
    maxDelayMs: 20000,
});
const dynamicRateLimit = (req, res, next) => {
    const userRole = req.user?.role || 'anonymous';
    const rateLimits = {
        admin: 1000,
        moderator: 500,
        user: 100,
        anonymous: 50,
    };
    const maxRequests = rateLimits[userRole] || 50;
    const customRateLimit = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: maxRequests,
        keyGenerator: (req) => {
            return req.user?.id || req.ip;
        },
        message: {
            success: false,
            error: 'Rate Limit Exceeded',
            message: `Rate limit exceeded for ${userRole} role. Please try again later.`,
            timestamp: new Date(),
        },
    });
    customRateLimit(req, res, next);
};
exports.dynamicRateLimit = dynamicRateLimit;
exports.burstRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        success: false,
        error: 'Burst Rate Limit Exceeded',
        message: 'Too many requests in a short time, please slow down.',
        timestamp: new Date(),
    },
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Burst Rate Limit Exceeded',
            message: 'Too many requests in a short time, please slow down.',
            timestamp: new Date(),
        });
    },
});
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Upload Rate Limit Exceeded',
        message: 'Too many file uploads, please try again later.',
        timestamp: new Date(),
    },
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Upload Rate Limit Exceeded',
            message: 'Too many file uploads, please try again later.',
            timestamp: new Date(),
        });
    },
});
exports.searchRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'Search Rate Limit Exceeded',
        message: 'Too many search requests, please try again later.',
        timestamp: new Date(),
    },
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Search Rate Limit Exceeded',
            message: 'Too many search requests, please try again later.',
            timestamp: new Date(),
        });
    },
});
//# sourceMappingURL=rateLimit.js.map