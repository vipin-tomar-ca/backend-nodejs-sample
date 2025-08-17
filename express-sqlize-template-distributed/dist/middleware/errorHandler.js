"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggingMiddleware = exports.correlationIdMiddleware = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = void 0;
const types_1 = require("../types");
const container_1 = require("../container");
const errorHandler = (error, req, res, next) => {
    const logger = container_1.container.get('LoggerService');
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
    });
    if (error instanceof types_1.ValidationError) {
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message,
            details: error.errors,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error instanceof types_1.NotFoundError) {
        res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error instanceof types_1.UnauthorizedError) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: error.message,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error instanceof types_1.ForbiddenError) {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: error.message,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error instanceof types_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: error.name,
            message: error.message,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
        }));
        res.status(400).json({
            success: false,
            error: 'Database Validation Error',
            message: 'Validation failed',
            details: validationErrors,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        const constraintErrors = error.errors.map((err) => ({
            field: err.path,
            message: `${err.path} already exists`,
            value: err.value,
        }));
        res.status(409).json({
            success: false,
            error: 'Duplicate Entry',
            message: 'Resource already exists',
            details: constraintErrors,
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).json({
            success: false,
            error: 'Foreign Key Constraint Error',
            message: 'Referenced resource does not exist',
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid Token',
            message: 'Invalid authentication token',
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Token Expired',
            message: 'Authentication token has expired',
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    if (error instanceof SyntaxError) {
        res.status(400).json({
            success: false,
            error: 'Invalid JSON',
            message: 'Invalid JSON in request body',
            timestamp: new Date(),
            correlationId: req.correlationId,
        });
        return;
    }
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        ...(isDevelopment && { stack: error.stack }),
        timestamp: new Date(),
        correlationId: req.correlationId,
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date(),
        correlationId: req.correlationId,
    });
};
exports.notFoundHandler = notFoundHandler;
const correlationIdMiddleware = (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] ||
        req.headers['x-request-id'] ||
        generateCorrelationId();
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
};
exports.correlationIdMiddleware = correlationIdMiddleware;
function generateCorrelationId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const requestLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const logger = container_1.container.get('LoggerService');
    logger.info('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
    });
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            correlationId: req.correlationId,
        });
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLoggingMiddleware = requestLoggingMiddleware;
//# sourceMappingURL=errorHandler.js.map