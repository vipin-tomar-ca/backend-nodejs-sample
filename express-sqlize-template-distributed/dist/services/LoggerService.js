"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const ioc_1 = require("../container/ioc");
const winston = __importStar(require("winston"));
const DailyRotateFile = __importStar(require("winston-daily-rotate-file"));
let LoggerService = LoggerService_1 = class LoggerService {
    constructor() {
        this.initializeLogger();
    }
    initializeLogger() {
        const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
        const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        }));
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { service: 'express-template' },
            transports: [
                new winston.transports.Console({
                    format: consoleFormat,
                }),
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
                new DailyRotateFile({
                    filename: 'logs/combined-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
            ],
        });
        this.logger.exceptions.handle(new DailyRotateFile({
            filename: 'logs/exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }));
        this.logger.rejections.handle(new DailyRotateFile({
            filename: 'logs/rejections-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }));
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    log(level, message, meta) {
        this.logger.log(level, message, meta);
    }
    logRequest(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            responseTime: responseTime ? `${responseTime}ms` : undefined,
            correlationId: req.correlationId,
            userId: req.user?.id,
        };
        if (res.statusCode >= 400) {
            this.warn('HTTP Request', logData);
        }
        else {
            this.info('HTTP Request', logData);
        }
    }
    logDatabaseQuery(sql, duration, params) {
        this.debug('Database Query', {
            sql,
            duration: `${duration}ms`,
            params,
        });
    }
    logBusinessOperation(operation, data, userId) {
        this.info('Business Operation', {
            operation,
            data,
            userId,
            timestamp: new Date().toISOString(),
        });
    }
    logSecurityEvent(event, details, userId) {
        this.warn('Security Event', {
            event,
            details,
            userId,
            timestamp: new Date().toISOString(),
            ip: details.ip,
        });
    }
    logPerformanceMetric(metric, value, unit = 'ms') {
        this.info('Performance Metric', {
            metric,
            value: `${value}${unit}`,
            timestamp: new Date().toISOString(),
        });
    }
    child(meta) {
        const childLogger = new LoggerService_1();
        childLogger.logger = this.logger.child(meta);
        return childLogger;
    }
    getLogger() {
        return this.logger;
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = LoggerService_1 = __decorate([
    (0, ioc_1.injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
//# sourceMappingURL=LoggerService.js.map