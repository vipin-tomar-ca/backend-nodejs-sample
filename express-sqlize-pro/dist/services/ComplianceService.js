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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const ioc_1 = require("../container/ioc");
const models_1 = require("../models");
const global_payroll_1 = require("../types/global-payroll");
const logger_1 = __importDefault(require("../utils/logger"));
let ComplianceService = class ComplianceService {
    constructor() {
        this.jurisdictionRules = new Map();
        this.initializeJurisdictionRules();
    }
    initializeJurisdictionRules() {
        const rules = {
            'US': {
                jurisdiction: 'US',
                name: 'United States',
                currency: 'USD',
                taxYear: 2024,
                complianceRules: [
                    'W9 form required for contractors',
                    '1099-NEC reporting for payments over $600',
                    'State tax withholding requirements',
                    'Foreign contractor W8-BEN form',
                ],
                requiredDocuments: ['w9', 'w8ben', 'tax_residency', 'business_license'],
                paymentLimits: {
                    contractor: 100000,
                    employee: 500000,
                },
            },
            'UK': {
                jurisdiction: 'UK',
                name: 'United Kingdom',
                currency: 'GBP',
                taxYear: 2024,
                complianceRules: [
                    'IR35 compliance for contractors',
                    'P60/P45 forms for employees',
                    'VAT registration requirements',
                    'National Insurance contributions',
                ],
                requiredDocuments: ['p60', 'p45', 'vat_certificate', 'ni_number'],
                paymentLimits: {
                    contractor: 50000,
                    employee: 200000,
                },
            },
            'DE': {
                jurisdiction: 'DE',
                name: 'Germany',
                currency: 'EUR',
                taxYear: 2024,
                complianceRules: [
                    'Tax identification number required',
                    'Social security contributions',
                    'VAT compliance for business services',
                    'Work permit requirements for non-EU',
                ],
                requiredDocuments: ['tax_id', 'social_security', 'vat_certificate', 'work_permit'],
                paymentLimits: {
                    contractor: 75000,
                    employee: 300000,
                },
            },
            'IN': {
                jurisdiction: 'IN',
                name: 'India',
                currency: 'INR',
                taxYear: 2024,
                complianceRules: [
                    'PAN card required for all payments',
                    'GST registration for business services',
                    'TDS withholding requirements',
                    'Foreign exchange regulations',
                ],
                requiredDocuments: ['pan_card', 'gst_certificate', 'tds_certificate', 'fema_declaration'],
                paymentLimits: {
                    contractor: 1000000,
                    employee: 5000000,
                },
            },
            'CA': {
                jurisdiction: 'CA',
                name: 'Canada',
                currency: 'CAD',
                taxYear: 2024,
                complianceRules: [
                    'SIN number required for employees',
                    'GST/HST registration for contractors',
                    'T4/T4A reporting requirements',
                    'Provincial tax compliance',
                ],
                requiredDocuments: ['sin_number', 'gst_certificate', 'business_number', 'provincial_tax'],
                paymentLimits: {
                    contractor: 80000,
                    employee: 250000,
                },
            },
            'AU': {
                jurisdiction: 'AU',
                name: 'Australia',
                currency: 'AUD',
                taxYear: 2024,
                complianceRules: [
                    'TFN (Tax File Number) required',
                    'ABN registration for contractors',
                    'GST compliance for business services',
                    'Superannuation contributions',
                ],
                requiredDocuments: ['tfn', 'abn_certificate', 'gst_registration', 'superannuation'],
                paymentLimits: {
                    contractor: 90000,
                    employee: 300000,
                },
            },
            'JP': {
                jurisdiction: 'JP',
                name: 'Japan',
                currency: 'JPY',
                taxYear: 2024,
                complianceRules: [
                    'My Number required for residents',
                    'Consumption tax compliance',
                    'Withholding tax requirements',
                    'Residence tax obligations',
                ],
                requiredDocuments: ['my_number', 'consumption_tax', 'withholding_certificate', 'residence_tax'],
                paymentLimits: {
                    contractor: 12000000,
                    employee: 50000000,
                },
            },
            'FR': {
                jurisdiction: 'FR',
                name: 'France',
                currency: 'EUR',
                taxYear: 2024,
                complianceRules: [
                    'SIRET number required',
                    'VAT compliance for business services',
                    'Social security contributions',
                    'Income tax withholding',
                ],
                requiredDocuments: ['siret_number', 'vat_certificate', 'social_security', 'tax_declaration'],
                paymentLimits: {
                    contractor: 70000,
                    employee: 250000,
                },
            },
            'NL': {
                jurisdiction: 'NL',
                name: 'Netherlands',
                currency: 'EUR',
                taxYear: 2024,
                complianceRules: [
                    'BSN number required',
                    'VAT compliance for business services',
                    'Income tax withholding',
                    'Social security contributions',
                ],
                requiredDocuments: ['bsn_number', 'vat_certificate', 'tax_declaration', 'social_security'],
                paymentLimits: {
                    contractor: 65000,
                    employee: 200000,
                },
            },
            'SG': {
                jurisdiction: 'SG',
                name: 'Singapore',
                currency: 'SGD',
                taxYear: 2024,
                complianceRules: [
                    'NRIC/FIN required for residents',
                    'GST registration for business services',
                    'CPF contributions for employees',
                    'Withholding tax for non-residents',
                ],
                requiredDocuments: ['nric_fin', 'gst_certificate', 'cpf_declaration', 'withholding_tax'],
                paymentLimits: {
                    contractor: 80000,
                    employee: 200000,
                },
            },
        };
        Object.entries(rules).forEach(([jurisdiction, info]) => {
            this.jurisdictionRules.set(jurisdiction, info);
        });
        logger_1.default.info(`Initialized compliance rules for ${this.jurisdictionRules.size} jurisdictions`);
    }
    async validatePayment(amount, jurisdiction, employeeType) {
        try {
            const jurisdictionInfo = await this.getJurisdictionInfo(jurisdiction);
            const profileCompliance = await this.getProfileComplianceDocuments(jurisdiction);
            const requiredDocuments = jurisdictionInfo.requiredDocuments;
            const missingDocuments = requiredDocuments.filter(doc => !profileCompliance.documents.includes(doc));
            const paymentLimit = jurisdictionInfo.paymentLimits[employeeType];
            const isWithinLimit = amount <= paymentLimit;
            const warnings = [];
            const errors = [];
            if (!isWithinLimit) {
                errors.push(`${jurisdiction} payment limit exceeded: ${amount} > ${paymentLimit}`);
            }
            if (missingDocuments.length > 0) {
                errors.push(`Missing required documents for ${jurisdiction}: ${missingDocuments.join(', ')}`);
            }
            if (amount > paymentLimit * 0.8) {
                warnings.push(`Payment amount (${amount}) is approaching the limit (${paymentLimit})`);
            }
            const isCompliant = errors.length === 0;
            const validation = {
                isCompliant,
                requiredDocuments,
                missingDocuments,
                taxObligations: await this.calculateTaxObligations(amount, jurisdiction, employeeType),
                warnings,
                errors,
                jurisdiction,
                validationDate: new Date(),
            };
            logger_1.default.info(`Compliance validation for ${jurisdiction} ${employeeType}: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
            return validation;
        }
        catch (error) {
            logger_1.default.error(`Compliance validation failed for ${jurisdiction}`, error);
            throw new global_payroll_1.ComplianceError(`Failed to validate compliance for ${jurisdiction}`, jurisdiction);
        }
    }
    async generateTaxDocuments(payment, jurisdiction) {
        try {
            const jurisdictionInfo = await this.getJurisdictionInfo(jurisdiction);
            const documents = [];
            switch (jurisdiction) {
                case 'US':
                    documents.push('1099-NEC', 'W-2', 'Form 1042-S', 'State tax withholding certificate');
                    break;
                case 'UK':
                    documents.push('P60', 'P45', 'Self-assessment tax return', 'VAT return');
                    break;
                case 'DE':
                    documents.push('Lohnsteuerbescheinigung', 'VAT certificate', 'Social security certificate', 'Tax identification certificate');
                    break;
                case 'IN':
                    documents.push('TDS certificate', 'GST invoice', 'PAN card copy', 'Tax residency certificate');
                    break;
                case 'CA':
                    documents.push('T4', 'T4A', 'GST/HST return', 'Provincial tax certificate');
                    break;
                case 'AU':
                    documents.push('Payment summary', 'ABN certificate', 'GST return', 'Superannuation certificate');
                    break;
                case 'JP':
                    documents.push('Withholding tax certificate', 'Consumption tax certificate', 'Residence tax certificate', 'My Number certificate');
                    break;
                case 'FR':
                    documents.push('Tax certificate', 'VAT certificate', 'Social security certificate', 'SIRET certificate');
                    break;
                case 'NL':
                    documents.push('Tax declaration', 'VAT certificate', 'Social security certificate', 'BSN certificate');
                    break;
                case 'SG':
                    documents.push('IR8A', 'GST certificate', 'CPF certificate', 'Withholding tax certificate');
                    break;
                default:
                    documents.push('Generic tax certificate');
            }
            logger_1.default.info(`Generated ${documents.length} tax documents for ${jurisdiction} payment`);
            return documents;
        }
        catch (error) {
            logger_1.default.error(`Failed to generate tax documents for ${jurisdiction}`, error);
            throw new global_payroll_1.ComplianceError(`Failed to generate tax documents for ${jurisdiction}`, jurisdiction);
        }
    }
    async validateProfileCompliance(profileId, jurisdiction) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const jurisdictionInfo = await this.getJurisdictionInfo(jurisdiction);
            const profileCompliance = await this.getProfileComplianceDocuments(jurisdiction);
            const requiredDocuments = jurisdictionInfo.requiredDocuments;
            const missingDocuments = requiredDocuments.filter(doc => !profileCompliance.documents.includes(doc));
            const isCompliant = missingDocuments.length === 0;
            const warnings = [];
            const errors = [];
            if (missingDocuments.length > 0) {
                errors.push(`Missing required documents for ${jurisdiction}: ${missingDocuments.join(', ')}`);
            }
            const daysSinceUpdate = (new Date().getTime() - profileCompliance.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 365) {
                warnings.push(`Compliance documents for ${jurisdiction} are over 1 year old`);
            }
            const validation = {
                isCompliant,
                requiredDocuments,
                missingDocuments,
                taxObligations: await this.calculateTaxObligations(0, jurisdiction, 'contractor'),
                warnings,
                errors,
                jurisdiction,
                validationDate: new Date(),
            };
            logger_1.default.info(`Profile compliance validation for ${profileId} in ${jurisdiction}: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
            return validation;
        }
        catch (error) {
            logger_1.default.error(`Profile compliance validation failed for ${profileId} in ${jurisdiction}`, error);
            throw new global_payroll_1.ComplianceError(`Failed to validate profile compliance for ${jurisdiction}`, jurisdiction);
        }
    }
    async getJurisdictionInfo(jurisdiction) {
        const info = this.jurisdictionRules.get(jurisdiction);
        if (!info) {
            throw new global_payroll_1.ComplianceError(`Jurisdiction ${jurisdiction} not supported`, jurisdiction);
        }
        return info;
    }
    async getProfileComplianceDocuments(jurisdiction) {
        const mockDocuments = {
            'US': ['w9', 'tax_residency'],
            'UK': ['p60', 'ni_number'],
            'DE': ['tax_id', 'social_security'],
            'IN': ['pan_card', 'gst_certificate'],
            'CA': ['sin_number', 'gst_certificate'],
            'AU': ['tfn', 'abn_certificate'],
            'JP': ['my_number', 'consumption_tax'],
            'FR': ['siret_number', 'vat_certificate'],
            'NL': ['bsn_number', 'vat_certificate'],
            'SG': ['nric_fin', 'gst_certificate'],
        };
        return {
            documents: mockDocuments[jurisdiction] || [],
            lastUpdated: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            status: 'compliant',
        };
    }
    async calculateTaxObligations(amount, jurisdiction, employeeType) {
        const jurisdictionInfo = await this.getJurisdictionInfo(jurisdiction);
        const taxRates = {
            'federal': 0.22,
            'state': 0.05,
            'social_security': 0.062,
            'medicare': 0.0145,
        };
        const totalTaxRate = Object.values(taxRates).reduce((sum, rate) => sum + rate, 0);
        const totalTax = amount * totalTaxRate;
        const netAmount = amount - totalTax;
        return {
            jurisdiction,
            taxYear: jurisdictionInfo.taxYear,
            grossAmount: amount,
            currency: jurisdictionInfo.currency,
            totalTax,
            netAmount,
            taxRates,
        };
    }
    getSupportedJurisdictions() {
        return Array.from(this.jurisdictionRules.keys());
    }
    getComplianceStatistics() {
        return {
            totalValidations: 1250,
            compliantValidations: 1100,
            nonCompliantValidations: 150,
            complianceRate: 0.88,
            mostCommonIssues: [
                'Missing W9 form',
                'Incomplete tax residency certificate',
                'Expired business license',
                'Missing VAT registration',
            ],
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, ioc_1.injectable)(),
    __metadata("design:paramtypes", [])
], ComplianceService);
//# sourceMappingURL=ComplianceService.js.map