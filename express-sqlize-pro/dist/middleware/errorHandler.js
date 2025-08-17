"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.timeoutHandler = exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.default.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
const timeoutHandler = (req, res, next) => {
    req.setTimeout(30000, () => {
        logger_1.default.warn('Request timeout');
        res.status(408).json({ error: 'Request timeout' });
    });
    next();
};
exports.timeoutHandler = timeoutHandler;
const notFoundHandler = (req, res) => {
    res.json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, req, res, next) => {
    logger_1.default.error('Unhandled error:', error);
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        ...(isDevelopment && {
            message: error.message,
            stack: error.stack,
        }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map