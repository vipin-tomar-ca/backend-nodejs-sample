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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleEngine = void 0;
const ioc_1 = require("../container/ioc");
const types_1 = require("../types");
let BusinessRuleEngine = class BusinessRuleEngine {
    constructor() {
        this.rules = new Map();
        this.initializeDefaultRules();
    }
    registerRule(rule) {
        const ruleSet = rule.type;
        if (!this.rules.has(ruleSet)) {
            this.rules.set(ruleSet, []);
        }
        this.rules.get(ruleSet).push(rule);
    }
    registerRules(rules) {
        rules.forEach(rule => this.registerRule(rule));
    }
    async executeRules(ruleSet, context) {
        const rules = this.rules.get(ruleSet) || [];
        const results = [];
        for (const rule of rules) {
            if (!rule.active)
                continue;
            try {
                const startTime = Date.now();
                const conditionResult = this.evaluateCondition(rule.condition, context);
                let actionResult = null;
                if (conditionResult) {
                    actionResult = this.executeAction(rule.action, context);
                }
                const executionTime = Date.now() - startTime;
                results.push({
                    ruleId: rule.id,
                    passed: conditionResult,
                    severity: rule.severity,
                    message: conditionResult ? rule.message : `Rule failed: ${rule.message}`,
                    context,
                    timestamp: new Date(),
                });
            }
            catch (error) {
                results.push({
                    ruleId: rule.id,
                    passed: false,
                    severity: types_1.BusinessRuleSeverity.ERROR,
                    message: `Rule execution error: ${error.message}`,
                    context,
                    timestamp: new Date(),
                });
            }
        }
        return results;
    }
    getRulesBySet(ruleSet) {
        return this.rules.get(ruleSet) || [];
    }
    getActiveRules() {
        const allRules = [];
        this.rules.forEach(rules => {
            allRules.push(...rules.filter(rule => rule.active));
        });
        return allRules;
    }
    getRuleStatistics() {
        const rulesByType = {
            [types_1.BusinessRuleType.VALIDATION]: 0,
            [types_1.BusinessRuleType.BUSINESS]: 0,
            [types_1.BusinessRuleType.COMPLIANCE]: 0,
            [types_1.BusinessRuleType.SECURITY]: 0,
        };
        let totalRules = 0;
        let activeRules = 0;
        this.rules.forEach(rules => {
            rules.forEach(rule => {
                totalRules++;
                if (rule.active) {
                    activeRules++;
                    rulesByType[rule.type]++;
                }
            });
        });
        return {
            totalRules,
            activeRules,
            ruleSets: this.rules.size,
            rulesByType,
        };
    }
    evaluateCondition(condition, context) {
        try {
            const safeContext = {
                ...context,
                isEmpty: (value) => !value || (typeof value === 'string' && value.trim() === ''),
                isNotEmpty: (value) => value && (typeof value !== 'string' || value.trim() !== ''),
                isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                isNumber: (value) => typeof value === 'number' && !isNaN(value),
                isString: (value) => typeof value === 'string',
                length: (value) => value ? value.length : 0,
                includes: (array, item) => Array.isArray(array) && array.includes(item),
                startsWith: (str, prefix) => typeof str === 'string' && str.startsWith(prefix),
                endsWith: (str, suffix) => typeof str === 'string' && str.endsWith(suffix),
            };
            const conditionFunction = new Function(...Object.keys(safeContext), `return ${condition}`);
            return conditionFunction(...Object.values(safeContext));
        }
        catch (error) {
            console.error('Error evaluating condition:', error);
            return false;
        }
    }
    executeAction(action, context) {
        try {
            const safeContext = {
                ...context,
                log: (message) => console.log(`[BusinessRule] ${message}`),
                setValue: (obj, key, value) => {
                    if (obj && typeof obj === 'object') {
                        obj[key] = value;
                    }
                },
                addError: (errors, error) => {
                    if (Array.isArray(errors)) {
                        errors.push(error);
                    }
                },
                addWarning: (warnings, warning) => {
                    if (Array.isArray(warnings)) {
                        warnings.push(warning);
                    }
                },
            };
            const actionFunction = new Function(...Object.keys(safeContext), action);
            return actionFunction(...Object.values(safeContext));
        }
        catch (error) {
            console.error('Error executing action:', error);
            return null;
        }
    }
    initializeDefaultRules() {
        this.registerRule({
            id: 'user-email-required',
            name: 'Email Required',
            type: types_1.BusinessRuleType.VALIDATION,
            severity: types_1.BusinessRuleSeverity.ERROR,
            condition: 'isEmpty(email)',
            action: 'addError(errors, "Email is required")',
            message: 'Email is required for user creation',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.registerRule({
            id: 'user-email-format',
            name: 'Email Format Validation',
            type: types_1.BusinessRuleType.VALIDATION,
            severity: types_1.BusinessRuleSeverity.ERROR,
            condition: 'isNotEmpty(email) && !isEmail(email)',
            action: 'addError(errors, "Invalid email format")',
            message: 'Email must be in valid format',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.registerRule({
            id: 'user-password-strength',
            name: 'Password Strength',
            type: types_1.BusinessRuleType.SECURITY,
            severity: types_1.BusinessRuleSeverity.WARNING,
            condition: 'isNotEmpty(password) && length(password) < 8',
            action: 'addWarning(warnings, "Password should be at least 8 characters long")',
            message: 'Password strength warning',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.registerRule({
            id: 'user-update-role-restriction',
            name: 'Role Update Restriction',
            type: types_1.BusinessRuleType.BUSINESS,
            severity: types_1.BusinessRuleSeverity.ERROR,
            condition: 'action === "update" && newData.role === "admin" && currentData.role !== "admin"',
            action: 'addError(errors, "Cannot promote user to admin role")',
            message: 'Role promotion restriction',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.registerRule({
            id: 'user-delete-admin-protection',
            name: 'Admin Deletion Protection',
            type: types_1.BusinessRuleType.SECURITY,
            severity: types_1.BusinessRuleSeverity.CRITICAL,
            condition: 'action === "delete" && userData.role === "admin"',
            action: 'addError(errors, "Cannot delete admin users")',
            message: 'Admin deletion protection',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
};
exports.BusinessRuleEngine = BusinessRuleEngine;
exports.BusinessRuleEngine = BusinessRuleEngine = __decorate([
    (0, ioc_1.injectable)(),
    __metadata("design:paramtypes", [])
], BusinessRuleEngine);
//# sourceMappingURL=BusinessRuleEngine.js.map