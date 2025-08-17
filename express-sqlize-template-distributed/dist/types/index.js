"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = exports.LogLevel = exports.BusinessRuleSeverity = exports.BusinessRuleType = void 0;
var BusinessRuleType;
(function (BusinessRuleType) {
    BusinessRuleType["VALIDATION"] = "validation";
    BusinessRuleType["BUSINESS"] = "business";
    BusinessRuleType["COMPLIANCE"] = "compliance";
    BusinessRuleType["SECURITY"] = "security";
})(BusinessRuleType || (exports.BusinessRuleType = BusinessRuleType = {}));
var BusinessRuleSeverity;
(function (BusinessRuleSeverity) {
    BusinessRuleSeverity["INFO"] = "info";
    BusinessRuleSeverity["WARNING"] = "warning";
    BusinessRuleSeverity["ERROR"] = "error";
    BusinessRuleSeverity["CRITICAL"] = "critical";
})(BusinessRuleSeverity || (exports.BusinessRuleSeverity = BusinessRuleSeverity = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, errors) {
        super(message, 400);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=index.js.map