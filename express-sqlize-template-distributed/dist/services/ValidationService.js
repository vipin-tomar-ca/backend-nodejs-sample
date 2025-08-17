"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const ioc_1 = require("../container/ioc");
let ValidationService = class ValidationService {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidPassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push({
                field: 'password',
                message: 'Password must be at least 8 characters long',
                value: password,
            });
        }
        if (!/[A-Z]/.test(password)) {
            errors.push({
                field: 'password',
                message: 'Password must contain at least one uppercase letter',
                value: password,
            });
        }
        if (!/[a-z]/.test(password)) {
            errors.push({
                field: 'password',
                message: 'Password must contain at least one lowercase letter',
                value: password,
            });
        }
        if (!/\d/.test(password)) {
            errors.push({
                field: 'password',
                message: 'Password must contain at least one number',
                value: password,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateRequired(data, requiredFields) {
        const errors = [];
        requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors.push({
                    field,
                    message: `${field} is required`,
                    value: data[field],
                });
            }
        });
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateStringLength(value, field, min, max) {
        const errors = [];
        if (value.length < min) {
            errors.push({
                field,
                message: `${field} must be at least ${min} characters long`,
                value,
            });
        }
        if (value.length > max) {
            errors.push({
                field,
                message: `${field} must be no more than ${max} characters long`,
                value,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateNumericRange(value, field, min, max) {
        const errors = [];
        if (value < min) {
            errors.push({
                field,
                message: `${field} must be at least ${min}`,
                value,
            });
        }
        if (value > max) {
            errors.push({
                field,
                message: `${field} must be no more than ${max}`,
                value,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidPhoneNumber(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    isValidDate(date) {
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj.getTime());
    }
    isFutureDate(date) {
        const dateObj = new Date(date);
        const now = new Date();
        return dateObj > now;
    }
    isPastDate(date) {
        const dateObj = new Date(date);
        const now = new Date();
        return dateObj < now;
    }
    validateArrayLength(array, field, min, max) {
        const errors = [];
        if (!Array.isArray(array)) {
            errors.push({
                field,
                message: `${field} must be an array`,
                value: array,
            });
            return { isValid: false, errors };
        }
        if (array.length < min) {
            errors.push({
                field,
                message: `${field} must have at least ${min} items`,
                value: array,
            });
        }
        if (array.length > max) {
            errors.push({
                field,
                message: `${field} must have no more than ${max} items`,
                value: array,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateEnum(value, field, allowedValues) {
        const errors = [];
        if (!allowedValues.includes(value)) {
            errors.push({
                field,
                message: `${field} must be one of: ${allowedValues.join(', ')}`,
                value,
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateObjectStructure(obj, requiredKeys) {
        const errors = [];
        if (typeof obj !== 'object' || obj === null) {
            errors.push({
                field: 'object',
                message: 'Value must be an object',
                value: obj,
            });
            return { isValid: false, errors };
        }
        requiredKeys.forEach(key => {
            if (!(key in obj)) {
                errors.push({
                    field: key,
                    message: `Missing required key: ${key}`,
                    value: undefined,
                });
            }
        });
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    sanitizeString(input) {
        return input
            .trim()
            .replace(/[<>]/g, '')
            .replace(/[&]/g, '&amp;')
            .replace(/["]/g, '&quot;')
            .replace(/[']/g, '&#x27;');
    }
    sanitizeEmail(email) {
        return email.trim().toLowerCase();
    }
    combineValidationResults(results) {
        const allErrors = [];
        let allValid = true;
        results.forEach(result => {
            if (!result.isValid) {
                allValid = false;
                allErrors.push(...result.errors);
            }
        });
        return {
            isValid: allValid,
            errors: allErrors,
        };
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, ioc_1.injectable)()
], ValidationService);
//# sourceMappingURL=ValidationService.js.map