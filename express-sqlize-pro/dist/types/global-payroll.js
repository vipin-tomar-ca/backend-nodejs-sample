"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleError = exports.GlobalPaymentError = exports.TaxCalculationError = exports.ComplianceError = exports.CurrencyConversionError = exports.BusinessRuleSeverity = exports.BusinessRuleType = void 0;
var BusinessRuleType;
(function (BusinessRuleType) {
    BusinessRuleType["COMPLIANCE"] = "compliance";
    BusinessRuleType["TAX"] = "tax";
    BusinessRuleType["CURRENCY"] = "currency";
    BusinessRuleType["DOCUMENTATION"] = "documentation";
    BusinessRuleType["BUSINESS"] = "business";
})(BusinessRuleType || (exports.BusinessRuleType = BusinessRuleType = {}));
var BusinessRuleSeverity;
(function (BusinessRuleSeverity) {
    BusinessRuleSeverity["INFO"] = "info";
    BusinessRuleSeverity["WARNING"] = "warning";
    BusinessRuleSeverity["ERROR"] = "error";
    BusinessRuleSeverity["CRITICAL"] = "critical";
})(BusinessRuleSeverity || (exports.BusinessRuleSeverity = BusinessRuleSeverity = {}));
class CurrencyConversionError extends Error {
    constructor(message, fromCurrency, toCurrency) {
        super(message);
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.name = 'CurrencyConversionError';
    }
}
exports.CurrencyConversionError = CurrencyConversionError;
class ComplianceError extends Error {
    constructor(message, jurisdiction) {
        super(message);
        this.jurisdiction = jurisdiction;
        this.name = 'ComplianceError';
    }
}
exports.ComplianceError = ComplianceError;
class TaxCalculationError extends Error {
    constructor(message, jurisdiction, taxYear) {
        super(message);
        this.jurisdiction = jurisdiction;
        this.taxYear = taxYear;
        this.name = 'TaxCalculationError';
    }
}
exports.TaxCalculationError = TaxCalculationError;
class GlobalPaymentError extends Error {
    constructor(message, paymentId) {
        super(message);
        this.paymentId = paymentId;
        this.name = 'GlobalPaymentError';
    }
}
exports.GlobalPaymentError = GlobalPaymentError;
class BusinessRuleError extends Error {
    constructor(message, ruleId, ruleSet) {
        super(message);
        this.ruleId = ruleId;
        this.ruleSet = ruleSet;
        this.name = 'BusinessRuleError';
    }
}
exports.BusinessRuleError = BusinessRuleError;
//# sourceMappingURL=global-payroll.js.map