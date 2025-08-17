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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const inversify_1 = require("inversify");
const container_1 = require("@/container");
const models_1 = require("@/models");
const BusinessRuleEngine_1 = require("./BusinessRuleEngine");
const global_payroll_1 = require("@/types/global-payroll");
const logger_1 = __importDefault(require("@/utils/logger"));
let ComplianceService = class ComplianceService {
    constructor(businessRuleEngine) {
        this.jurisdictionRules = new Map();
        this.businessRuleEngine = businessRuleEngine;
    }
    async validatePayment(amount, jurisdiction, employeeType) {
        try {
            logger_1.default.info(`Validating payment compliance for jurisdiction: ${jurisdiction}, employee type: ${employeeType}`);
            const ruleContext = {
                amount,
                currency: 'USD',
                jurisdiction,
                employeeType,
                paymentDate: new Date(),
                complianceStatus: 'pending',
                documents: [],
                requiredDocuments: [],
                warnings: [],
                errors: [],
            };
            const complianceRuleSet = `${jurisdiction.toUpperCase()}_COMPLIANCE`;
            const complianceResults = await this.businessRuleEngine.executeRules(complianceRuleSet, ruleContext);
            const documentationRuleSet = `${jurisdiction.toUpperCase()}_DOCUMENTATION`;
            const documentationResults = await this.businessRuleEngine.executeRules(documentationRuleSet, ruleContext);
            const currencyRuleSet = 'CURRENCY_COMPLIANCE';
            const currencyResults = await this.businessRuleEngine.executeRules(currencyRuleSet, ruleContext);
            const allResults = [...complianceResults, ...documentationResults, ...currencyResults];
            const criticalFailures = allResults.filter(result => result.severity === 'critical' && !result.passed);
            const errorFailures = allResults.filter(result => result.severity === 'error' && !result.passed);
            let complianceStatus = 'compliant';
            if (criticalFailures.length > 0) {
                complianceStatus = 'non-compliant';
            }
            else if (errorFailures.length > 0) {
                complianceStatus = 'non-compliant';
            }
            else if (allResults.some(result => result.severity === 'warning' && !result.passed)) {
                complianceStatus = 'under_review';
            }
            const traditionalValidation = await this.performTraditionalValidation(amount, jurisdiction, employeeType);
            const validation = {
                isCompliant: complianceStatus === 'compliant',
                requiredDocuments: ruleContext.requiredDocuments || [],
                missingDocuments: ruleContext.requiredDocuments?.filter(doc => !ruleContext.documents?.includes(doc)) || [],
                taxObligations: traditionalValidation.taxObligations,
                warnings: ruleContext.warnings || [],
                errors: ruleContext.errors || [],
                jurisdiction,
                validationDate: new Date(),
            };
            logger_1.default.info(`Compliance validation result for ${jurisdiction}: ${complianceStatus} (${allResults.length} rules executed)`);
            return validation;
        }
        catch (error) {
            logger_1.default.error(`Error validating payment compliance for ${jurisdiction}:`, error);
            throw new global_payroll_1.ComplianceError(`Failed to validate compliance for jurisdiction ${jurisdiction}`, jurisdiction, [error.message]);
        }
    }
    async generateTaxDocuments(payment, jurisdiction) {
        try {
            logger_1.default.info(`Generating tax documents for payment ${payment.id} in jurisdiction ${jurisdiction}`);
            const ruleContext = {
                amount: payment.amount,
                currency: payment.sourceCurrency,
                sourceCurrency: payment.sourceCurrency,
                targetCurrency: payment.targetCurrency,
                jurisdiction: payment.jurisdiction,
                employeeType: payment.taxCalculation.employeeType,
                paymentDate: payment.createdAt,
                complianceStatus: payment.complianceValidation.isCompliant ? 'compliant' : 'non-compliant',
                documents: [],
                requiredDocuments: [],
                clientId: payment.clientId,
                contractorId: payment.contractorId,
                jobId: payment.jobId,
                warnings: [],
                errors: [],
            };
            const documentRuleSet = `${jurisdiction.toUpperCase()}_DOCUMENTATION`;
            const documentResults = await this.businessRuleEngine.executeRules(documentRuleSet, ruleContext);
            const documents = [];
            switch (jurisdiction) {
                case 'US':
                    if (payment.taxCalculation.employeeType === 'contractor') {
                        documents.push(`1099-NEC-${payment.id}.pdf`);
                    }
                    else {
                        documents.push(`W-2-${payment.id}.pdf`);
                    }
                    break;
                case 'UK':
                    if (payment.taxCalculation.employeeType === 'employee') {
                        documents.push(`P60-${payment.id}.pdf`);
                    }
                    else {
                        documents.push(`Self-Assessment-${payment.id}.pdf`);
                    }
                    break;
                case 'DE':
                    if (payment.taxCalculation.employeeType === 'employee') {
                        documents.push(`Lohnsteuerbescheinigung-${payment.id}.pdf`);
                    }
                    else {
                        documents.push(`Rechnung-${payment.id}.pdf`);
                    }
                    break;
                case 'IN':
                    if (payment.taxCalculation.employeeType === 'employee') {
                        documents.push(`Form-16-${payment.id}.pdf`);
                    }
                    else {
                        documents.push(`GST-Invoice-${payment.id}.pdf`);
                    }
                    break;
                default:
                    documents.push(`Tax-Document-${jurisdiction}-${payment.id}.pdf`);
            }
            documents.push(`Payment-Receipt-${payment.id}.pdf`);
            logger_1.default.info(`Generated ${documents.length} tax documents for payment ${payment.id}`);
            return documents;
        }
        catch (error) {
            logger_1.default.error(`Error generating tax documents for payment ${payment.id}:`, error);
            throw error;
        }
    }
    async validateProfileCompliance(profileId, jurisdiction) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const employeeType = this.getEmployeeType(profile, jurisdiction);
            const requiredDocuments = this.getRequiredDocuments(jurisdiction, employeeType);
            const missingDocuments = await this.checkMissingDocuments(jurisdiction, employeeType, profileId);
            const ruleContext = {
                amount: 0,
                currency: 'USD',
                jurisdiction,
                employeeType,
                paymentDate: new Date(),
                complianceStatus: missingDocuments.length === 0 ? 'compliant' : 'non-compliant',
                documents: [],
                requiredDocuments,
                warnings: [],
                errors: missingDocuments.length > 0 ? [`Missing documents: ${missingDocuments.join(', ')}`] : [],
            };
            const profileRuleSet = `${jurisdiction.toUpperCase()}_PROFILE_COMPLIANCE`;
            const profileResults = await this.businessRuleEngine.executeRules(profileRuleSet, ruleContext);
            const isCompliant = missingDocuments.length === 0 &&
                !profileResults.some(result => result.severity === 'error' && !result.passed);
            return {
                isCompliant,
                requiredDocuments,
                missingDocuments,
                taxObligations: {
                    jurisdiction,
                    taxYear: 2024,
                    grossAmount: 0,
                    currency: 'USD',
                    totalTax: 0,
                    netAmount: 0,
                    taxRates: {},
                },
                warnings: ruleContext.warnings || [],
                errors: ruleContext.errors || [],
                jurisdiction,
                validationDate: new Date(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error validating profile compliance for ${profileId} in ${jurisdiction}:`, error);
            throw error;
        }
    }
    async performTraditionalValidation(amount, jurisdiction, employeeType) {
        const rules = await this.getJurisdictionRules(jurisdiction);
        const taxObligations = await this.calculateTaxObligations(amount, jurisdiction, employeeType);
        return {
            taxObligations,
            rules,
        };
    }
    async getJurisdictionRules(jurisdiction) {
        if (this.jurisdictionRules.has(jurisdiction)) {
            return this.jurisdictionRules.get(jurisdiction);
        }
        const rules = await this.loadJurisdictionRules(jurisdiction);
        this.jurisdictionRules.set(jurisdiction, rules);
        return rules;
    }
    async loadJurisdictionRules(jurisdiction) {
        const rules = {
            'US': {
                maxPaymentAmount: 100000,
                requiredDocuments: ['w9', 'taxResidency'],
                taxRates: {
                    federal: 0.22,
                    state: 0.05,
                    socialSecurity: 0.062,
                    medicare: 0.0145,
                },
                paymentLimits: {
                    contractor: 100000,
                    employee: 500000,
                },
            },
            'UK': {
                maxPaymentAmount: 50000,
                requiredDocuments: ['taxResidency', 'employmentContract'],
                taxRates: {
                    incomeTax: 0.20,
                    nationalInsurance: 0.12,
                },
                paymentLimits: {
                    contractor: 50000,
                    employee: 100000,
                },
            },
            'DE': {
                maxPaymentAmount: 75000,
                requiredDocuments: ['taxResidency', 'businessLicense'],
                taxRates: {
                    incomeTax: 0.42,
                    socialSecurity: 0.093,
                },
                paymentLimits: {
                    contractor: 75000,
                    employee: 150000,
                },
            },
            'IN': {
                maxPaymentAmount: 25000,
                requiredDocuments: ['taxRegistration', 'businessLicense'],
                taxRates: {
                    incomeTax: 0.30,
                    gst: 0.18,
                },
                paymentLimits: {
                    contractor: 25000,
                    employee: 50000,
                },
            },
        };
        return rules[jurisdiction] || {
            maxPaymentAmount: 50000,
            requiredDocuments: ['taxResidency'],
            taxRates: {},
            paymentLimits: {
                contractor: 50000,
                employee: 100000,
            },
        };
    }
    getRequiredDocuments(jurisdiction, employeeType) {
        const baseDocuments = ['taxResidency'];
        switch (jurisdiction) {
            case 'US':
                return employeeType === 'contractor' ? ['w9', 'taxResidency'] : ['w4', 'taxResidency'];
            case 'UK':
                return employeeType === 'contractor' ? ['taxResidency', 'employmentContract'] : ['p45', 'taxResidency'];
            case 'DE':
                return employeeType === 'contractor' ? ['taxResidency', 'businessLicense'] : ['taxCard', 'taxResidency'];
            case 'IN':
                return employeeType === 'contractor' ? ['taxRegistration', 'businessLicense'] : ['panCard', 'taxResidency'];
            default:
                return baseDocuments;
        }
    }
    async checkMissingDocuments(jurisdiction, employeeType, profileId) {
        const requiredDocuments = this.getRequiredDocuments(jurisdiction, employeeType);
        if (!profileId) {
            return requiredDocuments;
        }
        const profile = await models_1.Profile.findByPk(profileId);
        if (!profile) {
            return requiredDocuments;
        }
        const complianceDocuments = profile.complianceDocuments
            ? JSON.parse(profile.complianceDocuments)[jurisdiction] || {}
            : {};
        const missingDocuments = [];
        for (const document of requiredDocuments) {
            if (!complianceDocuments[document]) {
                missingDocuments.push(document);
            }
        }
        return missingDocuments;
    }
    async calculateTaxObligations(amount, jurisdiction, employeeType) {
        const rules = await this.getJurisdictionRules(jurisdiction);
        const taxRates = rules.taxRates;
        let totalTax = 0;
        const calculatedTaxes = {};
        switch (jurisdiction) {
            case 'US':
                calculatedTaxes.federalTax = amount * (taxRates.federal || 0.22);
                calculatedTaxes.stateTax = amount * (taxRates.state || 0.05);
                calculatedTaxes.socialSecurity = amount * (taxRates.socialSecurity || 0.062);
                calculatedTaxes.medicare = amount * (taxRates.medicare || 0.0145);
                totalTax = calculatedTaxes.federalTax + calculatedTaxes.stateTax +
                    calculatedTaxes.socialSecurity + calculatedTaxes.medicare;
                break;
            case 'UK':
                calculatedTaxes.incomeTax = amount * (taxRates.incomeTax || 0.20);
                calculatedTaxes.nationalInsurance = amount * (taxRates.nationalInsurance || 0.12);
                totalTax = calculatedTaxes.incomeTax + calculatedTaxes.nationalInsurance;
                break;
            case 'DE':
                calculatedTaxes.incomeTax = amount * (taxRates.incomeTax || 0.42);
                calculatedTaxes.socialSecurity = amount * (taxRates.socialSecurity || 0.093);
                totalTax = calculatedTaxes.incomeTax + calculatedTaxes.socialSecurity;
                break;
            case 'IN':
                calculatedTaxes.incomeTax = amount * (taxRates.incomeTax || 0.30);
                calculatedTaxes.gst = amount * (taxRates.gst || 0.18);
                totalTax = calculatedTaxes.incomeTax + calculatedTaxes.gst;
                break;
            default:
                calculatedTaxes.genericTax = amount * 0.20;
                totalTax = calculatedTaxes.genericTax;
        }
        return {
            jurisdiction,
            taxYear: 2024,
            grossAmount: amount,
            currency: 'USD',
            ...calculatedTaxes,
            totalTax,
            netAmount: amount - totalTax,
            taxRates,
        };
    }
    getEmployeeType(profile, jurisdiction) {
        const jurisdictions = profile.jurisdictions ? JSON.parse(profile.jurisdictions) : {};
        const jurisdictionInfo = jurisdictions[jurisdiction];
        return jurisdictionInfo?.employmentType || 'contractor';
    }
    async updateProfileComplianceStatus(profileId, jurisdiction, status) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const jurisdictions = profile.jurisdictions ? JSON.parse(profile.jurisdictions) : {};
            jurisdictions[jurisdiction] = {
                ...jurisdictions[jurisdiction],
                complianceStatus: status,
                lastComplianceCheck: new Date(),
            };
            await models_1.Profile.update({
                jurisdictions: JSON.stringify(jurisdictions),
                version: profile.version + 1,
                updatedAt: new Date(),
            }, {
                where: { id: profileId },
            });
            logger_1.default.info(`Updated compliance status for profile ${profileId} in ${jurisdiction} to ${status}`);
        }
        catch (error) {
            logger_1.default.error(`Error updating compliance status for profile ${profileId}:`, error);
            throw error;
        }
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(container_1.TYPES.BusinessRuleEngine)),
    __metadata("design:paramtypes", [BusinessRuleEngine_1.BusinessRuleEngine])
], ComplianceService);
//# sourceMappingURL=ComplianceService.js.map