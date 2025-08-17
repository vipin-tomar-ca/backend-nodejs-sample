"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMiddleware = exports.validationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
exports.validationMiddleware = {
    validateUserCreation: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .withMessage('Email must be a valid email address')
            .normalizeEmail(),
        (0, express_validator_1.body)('firstName')
            .isLength({ min: 1, max: 100 })
            .withMessage('First name must be between 1 and 100 characters')
            .trim(),
        (0, express_validator_1.body)('lastName')
            .isLength({ min: 1, max: 100 })
            .withMessage('Last name must be between 1 and 100 characters')
            .trim(),
        (0, express_validator_1.body)('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(['admin', 'user', 'moderator'])
            .withMessage('Role must be one of: admin, user, moderator'),
        handleValidationErrors,
    ],
    validateUserUpdate: [
        (0, express_validator_1.body)('email')
            .optional()
            .isEmail()
            .withMessage('Email must be a valid email address')
            .normalizeEmail(),
        (0, express_validator_1.body)('firstName')
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage('First name must be between 1 and 100 characters')
            .trim(),
        (0, express_validator_1.body)('lastName')
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage('Last name must be between 1 and 100 characters')
            .trim(),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(['admin', 'user', 'moderator'])
            .withMessage('Role must be one of: admin, user, moderator'),
        (0, express_validator_1.body)('status')
            .optional()
            .isIn(['active', 'inactive', 'deleted'])
            .withMessage('Status must be one of: active, inactive, deleted'),
        handleValidationErrors,
    ],
    validateUserId: [
        (0, express_validator_1.param)('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),
        handleValidationErrors,
    ],
    validatePagination: [
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        (0, express_validator_1.query)('status')
            .optional()
            .isIn(['active', 'inactive', 'deleted'])
            .withMessage('Status must be one of: active, inactive, deleted'),
        (0, express_validator_1.query)('role')
            .optional()
            .isIn(['admin', 'user', 'moderator'])
            .withMessage('Role must be one of: admin, user, moderator'),
        handleValidationErrors,
    ],
    validateSearch: [
        (0, express_validator_1.query)('search')
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search term must be between 1 and 100 characters'),
        (0, express_validator_1.query)('searchField')
            .optional()
            .isIn(['email', 'firstName', 'lastName'])
            .withMessage('Search field must be one of: email, firstName, lastName'),
        handleValidationErrors,
    ],
    validateField: (field, validations) => [
        (0, express_validator_1.body)(field, ...validations),
        handleValidationErrors,
    ],
    validateObject: (schema) => {
        return (req, res, next) => {
            try {
                const { error } = schema.validate(req.body);
                if (error) {
                    const validationError = new types_1.ValidationError('Validation failed', error.details.map((detail) => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value,
                    })));
                    res.status(400).json({
                        success: false,
                        error: 'Validation Error',
                        message: validationError.message,
                        details: validationError.errors,
                        timestamp: new Date(),
                    });
                    return;
                }
                next();
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Validation failed',
                    timestamp: new Date(),
                });
            }
        };
    },
};
function handleValidationErrors(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const validationError = new types_1.ValidationError('Validation failed', errors.array().map(error => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.value,
        })));
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: validationError.message,
            details: validationError.errors,
            timestamp: new Date(),
        });
        return;
    }
    next();
}
exports.sanitizeMiddleware = {
    sanitizeUserInput: (req, res, next) => {
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key]
                        .trim()
                        .replace(/[<>]/g, '')
                        .replace(/[&]/g, '&amp;')
                        .replace(/["]/g, '&quot;')
                        .replace(/[']/g, '&#x27;');
                }
            });
        }
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = req.query[key]?.toString().trim();
                }
            });
        }
        next();
    },
    sanitizeEmail: (req, res, next) => {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase().trim();
        }
        next();
    },
};
//# sourceMappingURL=validation.js.map