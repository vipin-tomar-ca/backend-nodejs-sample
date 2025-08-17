"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfile = exports.validateAmount = exports.validatePagination = exports.validateDateRange = exports.validateProfileId = exports.validateJobId = exports.validateContractId = exports.validateAdminQuery = exports.validateDeposit = exports.validatePayJob = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = __importDefault(require("@/utils/logger"));
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        logger_1.default.warn(`Validation failed for ${req.method} ${req.path}:`, errorMessages);
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages,
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validatePayJob = [
    (0, express_validator_1.param)('job_id')
        .isInt({ min: 1 })
        .withMessage('Job ID must be a positive integer'),
    exports.handleValidationErrors,
];
exports.validateDeposit = [
    (0, express_validator_1.param)('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number greater than 0'),
    exports.handleValidationErrors,
];
exports.validateAdminQuery = [
    (0, express_validator_1.query)('start')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('end')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100'),
    exports.handleValidationErrors,
];
exports.validateContractId = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Contract ID must be a positive integer'),
    exports.handleValidationErrors,
];
exports.validateJobId = [
    (0, express_validator_1.param)('job_id')
        .isInt({ min: 1 })
        .withMessage('Job ID must be a positive integer'),
    exports.handleValidationErrors,
];
exports.validateProfileId = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('Profile ID must be a positive integer'),
    exports.handleValidationErrors,
];
exports.validateDateRange = [
    (0, express_validator_1.query)('start')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date')
        .custom((startDate, { req }) => {
        const endDate = req.query.end;
        if (endDate && new Date(startDate) >= new Date(endDate)) {
            throw new Error('Start date must be before end date');
        }
        return true;
    }),
    (0, express_validator_1.query)('end')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    exports.handleValidationErrors,
];
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100'),
    exports.handleValidationErrors,
];
exports.validateAmount = [
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number greater than 0')
        .custom((value) => {
        if (value > 1000000) {
            throw new Error('Amount cannot exceed $1,000,000');
        }
        return true;
    }),
    exports.handleValidationErrors,
];
exports.validateProfile = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('profession')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Profession must not exceed 200 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['client', 'contractor'])
        .withMessage('Type must be either "client" or "contractor"'),
    (0, express_validator_1.body)('balance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Balance must be a non-negative number'),
    exports.handleValidationErrors,
];
//# sourceMappingURL=validation.js.map