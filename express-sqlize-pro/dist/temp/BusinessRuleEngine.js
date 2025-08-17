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
exports.BusinessRuleEngine = void 0;
const inversify_1 = require("inversify");
const global_payroll_1 = require("@/types/global-payroll");
const logger_1 = __importDefault(require("@/utils/logger"));
let BusinessRuleEngine = class BusinessRuleEngine {
    constructor() {
        this.rules = new Map();
        this.ruleSets = new Map();
    }
    registerRule(rule) {
        const ruleKey = this.generateRuleKey(rule);
        this.rules.set(ruleKey, rule);
        if (!this.ruleSets.has(rule.ruleSet)) {
            this.ruleSets.set(rule.ruleSet, []);
        }
        this.ruleSets.get(rule.ruleSet).push(ruleKey);
        logger_1.default.info(`Registered business rule: ${rule.name} in rule set: ${rule.ruleSet}`);
    }
    registerRules(rules) {
        rules.forEach(rule => this.registerRule(rule));
    }
    async executeRules(ruleSet, context) {
        const ruleKeys = this.ruleSets.get(ruleSet) || [];
        const results = [];
        logger_1.default.info(`Executing ${ruleKeys.length} rules for rule set: ${ruleSet}`);
        for (const ruleKey of ruleKeys) {
            const rule = this.rules.get(ruleKey);
            if (!rule)
                continue;
            try {
                const result = await this.executeRule(rule, context);
                results.push(result);
            }
            catch (error) {
                logger_1.default.error(`Error executing rule ${rule.name}:`, error);
                results.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    passed: false,
                    severity: global_payroll_1.BusinessRuleSeverity.ERROR,
                    message: `Rule execution failed: ${error.message}`,
                    context: context,
                    timestamp: new Date(),
                });
            }
        }
        return results;
    }
    async executeRule(rule, context) {
        const startTime = Date.now();
        try {
            const conditionResult = await this.evaluateCondition(rule.condition, context);
            let actionResult = null;
            if (conditionResult) {
                actionResult = await this.executeAction(rule.action, context);
            }
            const executionTime = Date.now() - startTime;
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: conditionResult,
                severity: rule.severity,
                message: conditionResult ? rule.successMessage : rule.failureMessage,
                context: context,
                actionResult,
                executionTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                passed: false,
                severity: global_payroll_1.BusinessRuleSeverity.ERROR,
                message: `Rule execution error: ${error.message}`,
                context: context,
                executionTime,
                timestamp: new Date(),
            };
        }
    }
    async evaluateCondition(condition, context) {
        try {
            const evalContext = {
                ...context,
                isJurisdiction: (jurisdiction) => context.jurisdiction === jurisdiction,
                isEmployeeType: (type) => context.employeeType === type,
                isCurrency: (currency) => context.currency === currency,
                amountBetween: (min, max) => context.amount >= min && context.amount <= max,
                hasDocument: (documentType) => context.documents?.includes(documentType) || false,
                isCompliant: () => context.complianceStatus === 'compliant',
                isCurrentYear: (year) => new Date().getFullYear() === year,
                isWithinDays: (days) => {
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - days);
                    return context.paymentDate >= cutoffDate;
                },
            };
            const conditionFunction = new Function('context', `return ${condition}`);
            return conditionFunction(evalContext);
        }
        catch (error) {
            logger_1.default.error(`Error evaluating condition: ${condition}`, error);
            throw new Error(`Condition evaluation failed: ${error.message}`);
        }
    }
    async executeAction(action, context) {
        try {
            const actionContext = {
                ...context,
                setComplianceStatus: (status) => {
                    context.complianceStatus = status;
                },
                addWarning: (message) => {
                    if (!context.warnings)
                        context.warnings = [];
                    context.warnings.push(message);
                },
                addError: (message) => {
                    if (!context.errors)
                        context.errors = [];
                    context.errors.push(message);
                },
                setTaxRate: (rate) => {
                    context.taxRate = rate;
                },
                setExchangeRate: (rate) => {
                    context.exchangeRate = rate;
                },
                requireDocument: (documentType) => {
                    if (!context.requiredDocuments)
                        context.requiredDocuments = [];
                    if (!context.requiredDocuments.includes(documentType)) {
                        context.requiredDocuments.push(documentType);
                    }
                },
            };
            const actionFunction = new Function('context', action);
            return actionFunction(actionContext);
        }
        catch (error) {
            logger_1.default.error(`Error executing action: ${action}`, error);
            throw new Error(`Action execution failed: ${error.message}`);
        }
    }
    async loadRulesFromSource(source) {
        try {
            logger_1.default.info(`Loading business rules from source: ${source}`);
            const rules = await this.fetchRulesFromSource(source);
            this.registerRules(rules);
            logger_1.default.info(`Loaded ${rules.length} business rules from ${source}`);
        }
        catch (error) {
            logger_1.default.error(`Error loading rules from source ${source}:`, error);
            throw error;
        }
    }
    async fetchRulesFromSource(source) {
        const mockRules = [
            {
                id: 'US_001',
                name: 'US Contractor Payment Limit',
                ruleSet: 'US_COMPLIANCE',
                type: global_payroll_1.BusinessRuleType.COMPLIANCE,
                severity: global_payroll_1.BusinessRuleSeverity.ERROR,
                condition: 'context.isJurisdiction("US") && context.isEmployeeType("contractor") && context.amount > 100000',
                action: 'context.addError("US contractor payments cannot exceed $100,000"); context.setComplianceStatus("non-compliant");',
                successMessage: 'US contractor payment limit check passed',
                failureMessage: 'US contractor payment exceeds limit',
                jurisdiction: 'US',
                employeeType: 'contractor',
                version: '1.0',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'US_002',
                name: 'US W9 Document Required',
                ruleSet: 'US_COMPLIANCE',
                type: global_payroll_1.BusinessRuleType.DOCUMENTATION,
                severity: global_payroll_1.BusinessRuleSeverity.ERROR,
                condition: 'context.isJurisdiction("US") && context.isEmployeeType("contractor") && !context.hasDocument("w9")',
                action: 'context.requireDocument("w9"); context.addError("W9 form is required for US contractors");',
                successMessage: 'W9 document requirement satisfied',
                failureMessage: 'W9 document is required for US contractors',
                jurisdiction: 'US',
                employeeType: 'contractor',
                version: '1.0',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'UK_001',
                name: 'UK Contractor Payment Limit',
                ruleSet: 'UK_COMPLIANCE',
                type: global_payroll_1.BusinessRuleType.COMPLIANCE,
                severity: global_payroll_1.BusinessRuleSeverity.ERROR,
                condition: 'context.isJurisdiction("UK") && context.isEmployeeType("contractor") && context.amount > 50000',
                action: 'context.addError("UK contractor payments cannot exceed £50,000"); context.setComplianceStatus("non-compliant");',
                successMessage: 'UK contractor payment limit check passed',
                failureMessage: 'UK contractor payment exceeds limit',
                jurisdiction: 'UK',
                employeeType: 'contractor',
                version: '1.0',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'CURRENCY_001',
                name: 'High Value Currency Conversion',
                ruleSet: 'CURRENCY_COMPLIANCE',
                type: global_payroll_1.BusinessRuleType.CURRENCY,
                severity: global_payroll_1.BusinessRuleSeverity.WARNING,
                condition: 'context.amount > 10000 && context.sourceCurrency !== context.targetCurrency',
                action: 'context.addWarning("High value currency conversion requires additional verification");',
                successMessage: 'Currency conversion check passed',
                failureMessage: 'High value currency conversion requires verification',
                version: '1.0',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'TAX_001',
                name: 'US Federal Tax Rate',
                ruleSet: 'TAX_CALCULATION',
                type: global_payroll_1.BusinessRuleType.TAX,
                severity: global_payroll_1.BusinessRuleSeverity.INFO,
                condition: 'context.isJurisdiction("US") && context.amount > 0',
                action: 'context.setTaxRate(0.22);',
                successMessage: 'US federal tax rate applied',
                failureMessage: 'Failed to apply US federal tax rate',
                jurisdiction: 'US',
                version: '1.0',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        return mockRules;
    }
    getRulesBySet(ruleSet) {
        const ruleKeys = this.ruleSets.get(ruleSet) || [];
        return ruleKeys.map(key => this.rules.get(key)).filter(Boolean);
    }
    getActiveRules() {
        return Array.from(this.rules.values()).filter(rule => rule.active);
    }
    updateRule(ruleId, updates) {
        const ruleKey = Array.from(this.rules.keys()).find(key => key.includes(ruleId));
        if (!ruleKey) {
            throw new Error(`Rule ${ruleId} not found`);
        }
        const existingRule = this.rules.get(ruleKey);
        const updatedRule = { ...existingRule, ...updates, updatedAt: new Date() };
        this.rules.set(ruleKey, updatedRule);
        logger_1.default.info(`Updated business rule: ${ruleId}`);
    }
    deactivateRule(ruleId) {
        this.updateRule(ruleId, { active: false });
    }
    activateRule(ruleId) {
        this.updateRule(ruleId, { active: true });
    }
    generateRuleKey(rule) {
        return `${rule.ruleSet}_${rule.id}_${rule.version}`;
    }
    getRuleStatistics() {
        const activeRules = this.getActiveRules();
        const rulesByType = {
            [global_payroll_1.BusinessRuleType.COMPLIANCE]: 0,
            [global_payroll_1.BusinessRuleType.TAX]: 0,
            [global_payroll_1.BusinessRuleType.CURRENCY]: 0,
            [global_payroll_1.BusinessRuleType.DOCUMENTATION]: 0,
            [global_payroll_1.BusinessRuleType.BUSINESS]: 0,
        };
        activeRules.forEach(rule => {
            rulesByType[rule.type]++;
        });
        return {
            totalRules: this.rules.size,
            activeRules: activeRules.length,
            ruleSets: this.ruleSets.size,
            rulesByType,
        };
    }
};
exports.BusinessRuleEngine = BusinessRuleEngine;
exports.BusinessRuleEngine = BusinessRuleEngine = __decorate([
    (0, inversify_1.injectable)()
], BusinessRuleEngine);
//# sourceMappingURL=BusinessRuleEngine.js.map