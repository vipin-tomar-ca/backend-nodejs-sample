// Global Payroll Types and Interfaces

// Currency and Jurisdiction Types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'SGD';
export type Jurisdiction = 'US' | 'UK' | 'DE' | 'IN' | 'CA' | 'AU' | 'JP' | 'FR' | 'NL' | 'SG';
export type EmployeeType = 'employee' | 'contractor' | 'freelancer';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'under_review' | 'pending';
export type TaxYear = 2020 | 2021 | 2022 | 2023 | 2024 | 2025;
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Business Rule Engine Types
export enum BusinessRuleType {
  COMPLIANCE = 'compliance',
  TAX = 'tax',
  CURRENCY = 'currency',
  DOCUMENTATION = 'documentation',
  BUSINESS = 'business',
}

export enum BusinessRuleSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface IBusinessRule {
  id: string;
  name: string;
  ruleSet: string;
  type: BusinessRuleType;
  severity: BusinessRuleSeverity;
  condition: string; // JavaScript expression string
  action: string; // JavaScript action string
  successMessage: string;
  failureMessage: string;
  jurisdiction?: Jurisdiction;
  employeeType?: EmployeeType;
  currency?: Currency;
  version: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessRuleContext {
  // Payment context
  amount: number;
  currency: Currency;
  sourceCurrency?: Currency;
  targetCurrency?: Currency;
  jurisdiction: Jurisdiction;
  employeeType: EmployeeType;
  paymentDate: Date;

  // Compliance context
  complianceStatus: ComplianceStatus;
  documents?: string[];
  requiredDocuments?: string[];

  // Tax context
  taxRate?: number;
  taxYear?: TaxYear;

  // Currency context
  exchangeRate?: number;

  // Business context
  clientId?: number;
  contractorId?: number;
  jobId?: number;

  // Messages
  warnings?: string[];
  errors?: string[];

  // Additional context
  [key: string]: any;
}

export interface IBusinessRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: BusinessRuleSeverity;
  message: string;
  context: IBusinessRuleContext;
  actionResult?: any;
  executionTime?: number;
  timestamp: Date;
}

export interface IBusinessRuleEngine {
  registerRule(rule: IBusinessRule): void;
  registerRules(rules: IBusinessRule[]): void;
  executeRules(ruleSet: string, context: IBusinessRuleContext): Promise<IBusinessRuleResult[]>;
  loadRulesFromSource(source: string): Promise<void>;
  getRulesBySet(ruleSet: string): IBusinessRule[];
  getActiveRules(): IBusinessRule[];
  updateRule(ruleId: string, updates: Partial<IBusinessRule>): void;
  deactivateRule(ruleId: string): void;
  activateRule(ruleId: string): void;
  getRuleStatistics(): {
    totalRules: number;
    activeRules: number;
    ruleSets: number;
    rulesByType: Record<BusinessRuleType, number>;
  };
}

// Multi-Currency Support
export interface IMultiCurrencyBalance {
  [currency: string]: number;
}

export interface IExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  source: 'real-time' | 'daily-fix' | 'manual';
  timestamp: Date;
  expiresAt: Date;
}

export interface ICurrencyConversion {
  fromCurrency: Currency;
  toCurrency: Currency;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  fees: number;
  totalAmount: number;
  timestamp: Date;
}

export interface ICurrencyService {
  convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRateSource?: 'real-time' | 'daily-fix' | 'manual'
  ): Promise<ICurrencyConversion>;
  updateMultiCurrencyBalance(profileId: number, currency: Currency, amount: number): Promise<void>;
  getBalanceInCurrency(profileId: number, currency: Currency): Promise<number>;
  getAllBalances(profileId: number): Promise<IMultiCurrencyBalance>;
  convertBalance(profileId: number, fromCurrency: Currency, toCurrency: Currency): Promise<ICurrencyConversion>;
}

// Multi-Jurisdiction Compliance
export interface IJurisdictionInfo {
  jurisdiction: Jurisdiction;
  name: string;
  currency: Currency;
  taxYear: TaxYear;
  complianceRules: string[];
  requiredDocuments: string[];
  paymentLimits: {
    contractor: number;
    employee: number;
  };
}

export interface IComplianceDocuments {
  [jurisdiction: string]: {
    documents: string[];
    lastUpdated: Date;
    status: ComplianceStatus;
  };
}

export interface IComplianceValidation {
  isCompliant: boolean;
  requiredDocuments: string[];
  missingDocuments: string[];
  taxObligations: ITaxObligations;
  warnings: string[];
  errors: string[];
  jurisdiction: Jurisdiction;
  validationDate: Date;
}

export interface IComplianceService {
  validatePayment(amount: number, jurisdiction: Jurisdiction, employeeType: EmployeeType): Promise<IComplianceValidation>;
  generateTaxDocuments(payment: IGlobalPayment, jurisdiction: Jurisdiction): Promise<string[]>;
  validateProfileCompliance(profileId: number, jurisdiction: Jurisdiction): Promise<IComplianceValidation>;
  getJurisdictionInfo(jurisdiction: Jurisdiction): Promise<IJurisdictionInfo>;
}

// Tax Calculation
export interface ITaxObligations {
  jurisdiction: Jurisdiction;
  taxYear: TaxYear;
  grossAmount: number;
  currency: Currency;
  totalTax: number;
  netAmount: number;
  taxRates: Record<string, number>;
}

export interface ITaxCalculation {
  employeeType: EmployeeType;
  taxObligations: ITaxObligations;
  complianceStatus: ComplianceStatus;
  calculationDate: Date;
}

export interface ITaxCalculationService {
  calculateTax(amount: number, jurisdiction: Jurisdiction, employeeType: EmployeeType): Promise<ITaxCalculation>;
  getTaxRates(jurisdiction: Jurisdiction, taxYear: TaxYear): Promise<Record<string, number>>;
  validateTaxDocuments(documents: string[], jurisdiction: Jurisdiction): Promise<boolean>;
}

// Global Payment Types
export interface IGlobalProfile {
  id: number;
  firstName: string;
  lastName: string;
  profession: string;
  balance: number;
  type: 'client' | 'contractor';
  version: number;
  jurisdictions: Jurisdiction[];
  complianceDocuments: IComplianceDocuments;
  multiCurrencyBalances: IMultiCurrencyBalance;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGlobalJob {
  id: number;
  description: string;
  price: number;
  paid: boolean;
  paymentDate?: Date;
  ContractId: number;
  currency: Currency;
  jurisdiction: Jurisdiction;
  employeeType: EmployeeType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGlobalContract {
  id: number;
  terms: string;
  status: 'new' | 'in_progress' | 'terminated';
  ClientId: number;
  ContractorId: number;
  jurisdiction: Jurisdiction;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGlobalPayment {
  id: string;
  jobId: number;
  clientId: number;
  contractorId: number;
  amount: number;
  sourceCurrency: Currency;
  targetCurrency: Currency;
  jurisdiction: Jurisdiction;
  status: PaymentStatus;
  complianceValidation: IComplianceValidation;
  taxCalculation: ITaxCalculation;
  currencyConversion: ICurrencyConversion;
  sagaId?: string;
  correlationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Saga Pattern for Distributed Transactions
export interface IGlobalSagaStep {
  name: string;
  execute(): Promise<void>;
  compensate(): Promise<void>;
}

export interface IGlobalSagaTransaction {
  id: string;
  steps: IGlobalSagaStep[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}

// Event Sourcing
export interface IGlobalEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  metadata: {
    userId: string;
    correlationId: string;
    causationId?: string;
    timestamp: Date;
    version: number;
  };
}

export interface IEventStore {
  appendEvents(aggregateId: string, events: IGlobalEvent[]): Promise<void>;
  getEvents(aggregateId: string): Promise<IGlobalEvent[]>;
  getEventsByType(type: string): Promise<IGlobalEvent[]>;
}

// Global Payment Service
export interface IGlobalPaymentService {
  processGlobalPayment(
    jobId: number,
    clientId: number,
    contractorId: number,
    amount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency,
    jurisdiction: Jurisdiction
  ): Promise<IGlobalPayment>;
  getPaymentStatus(paymentId: string): Promise<IGlobalPayment>;
  processBatchPayments(payments: Array<{
    jobId: number;
    clientId: number;
    contractorId: number;
    amount: number;
    sourceCurrency: Currency;
    targetCurrency: Currency;
    jurisdiction: Jurisdiction;
  }>): Promise<IGlobalPayment[]>;
  getPaymentAnalytics(filters?: {
    jurisdiction?: Jurisdiction;
    currency?: Currency;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
    currencyBreakdown: Record<Currency, number>;
    jurisdictionBreakdown: Record<Jurisdiction, number>;
  }>;
  getPaymentStatistics(): {
    totalProcessed: number;
    totalAmount: number;
    averageProcessingTime: number;
    successRate: number;
    topJurisdictions: Jurisdiction[];
    topCurrencies: Currency[];
  };
}

// API Response Types
export interface IGlobalApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  correlationId: string;
}

export interface IGlobalPaymentResponse {
  success: boolean;
  data: IGlobalPayment;
  sagaId: string;
  complianceStatus: ComplianceStatus;
  taxCalculation: ITaxCalculation;
  correlationId: string;
  timestamp: Date;
}

// Multi-Jurisdiction Service
export interface IMultiJurisdictionService {
  getSupportedJurisdictions(): Jurisdiction[];
  getJurisdictionCompliance(jurisdiction: Jurisdiction): Promise<IComplianceValidation>;
  validateMultiJurisdictionPayment(payment: IGlobalPayment): Promise<IComplianceValidation[]>;
  generateMultiJurisdictionDocuments(payment: IGlobalPayment): Promise<Record<Jurisdiction, string[]>>;
}

// Error Types
export class CurrencyConversionError extends Error {
  constructor(message: string, public fromCurrency: Currency, public toCurrency: Currency) {
    super(message);
    this.name = 'CurrencyConversionError';
  }
}

export class ComplianceError extends Error {
  constructor(message: string, public jurisdiction: Jurisdiction) {
    super(message);
    this.name = 'ComplianceError';
  }
}

export class TaxCalculationError extends Error {
  constructor(message: string, public jurisdiction: Jurisdiction, public taxYear: TaxYear) {
    super(message);
    this.name = 'TaxCalculationError';
  }
}

export class GlobalPaymentError extends Error {
  constructor(message: string, public paymentId: string) {
    super(message);
    this.name = 'GlobalPaymentError';
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string, public ruleId: string, public ruleSet: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}
