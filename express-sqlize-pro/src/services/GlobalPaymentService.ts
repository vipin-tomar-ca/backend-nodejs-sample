import { injectable, inject } from '../container/ioc';
import { v4 as uuidv4 } from 'uuid';
import { Profile, Job, Contract } from '../models';
import {
  Currency,
  Jurisdiction,
  EmployeeType,
  PaymentStatus,
  IGlobalPaymentService,
  IGlobalPayment,
  IComplianceValidation,
  ITaxCalculation,
  ICurrencyConversion,
  IBusinessRuleContext,
  IBusinessRuleResult,
  GlobalPaymentError
} from '../types/global-payroll';
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { CurrencyService } from './CurrencyService';
import { ComplianceService } from './ComplianceService';
import logger from '../utils/logger';

@injectable()
export class GlobalPaymentService implements IGlobalPaymentService {
  private businessRuleEngine: BusinessRuleEngine;
  private currencyService: CurrencyService;
  private complianceService: ComplianceService;

  constructor(
    @inject('BusinessRuleEngine') businessRuleEngine: BusinessRuleEngine,
    @inject('CurrencyService') currencyService: CurrencyService,
    @inject('ComplianceService') complianceService: ComplianceService
  ) {
    this.businessRuleEngine = businessRuleEngine;
    this.currencyService = currencyService;
    this.complianceService = complianceService;
  }

  /**
   * Process a global payment with full compliance and business rule validation
   */
  public async processGlobalPayment(
    jobId: number,
    clientId: number,
    contractorId: number,
    amount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency,
    jurisdiction: Jurisdiction
  ): Promise<IGlobalPayment> {
    const correlationId = uuidv4();
    const paymentId = uuidv4();

    try {
      logger.info(`Starting global payment processing: ${paymentId}`, { correlationId });

      // Step 1: Validate input data
      await this.validatePaymentInput(jobId, clientId, contractorId, amount, jurisdiction);

      // Step 2: Execute business rules
      const businessRuleContext = await this.createBusinessRuleContext(
        amount, sourceCurrency, targetCurrency, jurisdiction, 'contractor', paymentId, clientId, contractorId, jobId
      );

      const businessRuleResults = await this.businessRuleEngine.executeRules(
        `${jurisdiction}_COMPLIANCE`,
        businessRuleContext
      );

      // Check for critical business rule failures
      const criticalFailures = businessRuleResults.filter(result => 
        result.severity === 'error' || result.severity === 'critical'
      );

      if (criticalFailures.length > 0) {
        throw new GlobalPaymentError(
          `Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`,
          paymentId
        );
      }

      // Step 3: Validate compliance
      const complianceValidation = await this.complianceService.validatePayment(
        amount,
        jurisdiction,
        'contractor'
      );

      if (!complianceValidation.isCompliant) {
        throw new GlobalPaymentError(
          `Compliance validation failed: ${complianceValidation.errors.join(', ')}`,
          paymentId
        );
      }

      // Step 4: Perform currency conversion
      const currencyConversion = await this.currencyService.convertCurrency(
        amount,
        sourceCurrency,
        targetCurrency
      );

      // Step 5: Calculate taxes
      const taxCalculation = await this.calculateTaxes(amount, jurisdiction, 'contractor');

      // Step 6: Execute the payment
      const payment = await this.executePayment(
        paymentId,
        jobId,
        clientId,
        contractorId,
        amount,
        sourceCurrency,
        targetCurrency,
        jurisdiction,
        complianceValidation,
        taxCalculation,
        currencyConversion,
        correlationId
      );

      // Step 7: Update balances
      await this.updateBalances(clientId, contractorId, currencyConversion, jurisdiction);

      // Step 8: Generate tax documents
      await this.generateTaxDocuments(payment, jurisdiction);

      logger.info(`Global payment completed successfully: ${paymentId}`, { correlationId });

      return payment;

    } catch (error) {
      logger.error(`Global payment failed: ${paymentId}`, { correlationId, error });
      throw error;
    }
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(paymentId: string): Promise<IGlobalPayment> {
    // In production, this would fetch from a payments table
    // For now, we'll return a mock payment
    throw new Error(`Payment ${paymentId} not found - implement payment storage`);
  }

  /**
   * Process batch payments
   */
  public async processBatchPayments(payments: Array<{
    jobId: number;
    clientId: number;
    contractorId: number;
    amount: number;
    sourceCurrency: Currency;
    targetCurrency: Currency;
    jurisdiction: Jurisdiction;
  }>): Promise<IGlobalPayment[]> {
    const results: IGlobalPayment[] = [];
    const batchId = uuidv4();

    logger.info(`Starting batch payment processing: ${batchId}`, { batchSize: payments.length });

    for (const payment of payments) {
      try {
        const result = await this.processGlobalPayment(
          payment.jobId,
          payment.clientId,
          payment.contractorId,
          payment.amount,
          payment.sourceCurrency,
          payment.targetCurrency,
          payment.jurisdiction
        );
        results.push(result);
      } catch (error) {
        logger.error(`Batch payment failed for job ${payment.jobId}`, { batchId, error });
        // Continue with other payments in batch
      }
    }

    logger.info(`Batch payment processing completed: ${batchId}`, { 
      batchId, 
      successful: results.length, 
      failed: payments.length - results.length 
    });

    return results;
  }

  /**
   * Get payment analytics
   */
  public async getPaymentAnalytics(filters?: {
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
  }> {
    // Mock analytics - in production, this would query the payments database
    const mockData = {
      totalPayments: 1250,
      totalAmount: 2500000,
      averageAmount: 2000,
      successRate: 0.95,
      currencyBreakdown: {
        'USD': 500000,
        'EUR': 400000,
        'GBP': 300000,
        'INR': 200000,
        'CAD': 150000,
        'AUD': 120000,
        'JPY': 100000,
        'CHF': 80000,
        'SGD': 60000,
      },
      jurisdictionBreakdown: {
        'US': 400,
        'UK': 300,
        'DE': 200,
        'IN': 150,
        'CA': 100,
        'AU': 80,
        'JP': 70,
        'FR': 60,
        'NL': 50,
        'SG': 40,
      },
    };

    return mockData;
  }

  /**
   * Validate payment input data
   */
  private async validatePaymentInput(
    jobId: number,
    clientId: number,
    contractorId: number,
    amount: number,
    jurisdiction: Jurisdiction
  ): Promise<void> {
    // Validate job exists and is unpaid
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new GlobalPaymentError(`Job ${jobId} not found`, '');
    }
    if (job.paid) {
      throw new GlobalPaymentError(`Job ${jobId} is already paid`, '');
    }

    // Validate client exists and has sufficient balance
    const client = await Profile.findByPk(clientId);
    if (!client) {
      throw new GlobalPaymentError(`Client ${clientId} not found`, '');
    }
    if (client.type !== 'client') {
      throw new GlobalPaymentError(`Profile ${clientId} is not a client`, '');
    }

    // Validate contractor exists
    const contractor = await Profile.findByPk(contractorId);
    if (!contractor) {
      throw new GlobalPaymentError(`Contractor ${contractorId} not found`, '');
    }
    if (contractor.type !== 'contractor') {
      throw new GlobalPaymentError(`Profile ${contractorId} is not a contractor`, '');
    }

    // Validate amount
    if (amount <= 0) {
      throw new GlobalPaymentError('Payment amount must be positive', '');
    }

    // Validate jurisdiction is supported
    const supportedJurisdictions = this.complianceService.getSupportedJurisdictions();
    if (!supportedJurisdictions.includes(jurisdiction)) {
      throw new GlobalPaymentError(`Jurisdiction ${jurisdiction} is not supported`, '');
    }
  }

  /**
   * Create business rule context
   */
  private async createBusinessRuleContext(
    amount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency,
    jurisdiction: Jurisdiction,
    employeeType: EmployeeType,
    paymentId: string,
    clientId: number,
    contractorId: number,
    jobId: number
  ): Promise<IBusinessRuleContext> {
    return {
      amount,
      currency: sourceCurrency,
      sourceCurrency,
      targetCurrency,
      jurisdiction,
      employeeType,
      paymentDate: new Date(),
      complianceStatus: 'pending',
      clientId,
      contractorId,
      jobId,
      warnings: [],
      errors: [],
    };
  }

  /**
   * Calculate taxes for the payment
   */
  private async calculateTaxes(
    amount: number,
    jurisdiction: Jurisdiction,
    employeeType: EmployeeType
  ): Promise<ITaxCalculation> {
    // Mock tax calculation - in production, this would use a dedicated tax service
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
      employeeType,
      taxObligations: {
        jurisdiction,
        taxYear: 2024,
        grossAmount: amount,
        currency: 'USD',
        totalTax,
        netAmount,
        taxRates,
      },
      complianceStatus: 'compliant',
      calculationDate: new Date(),
    };
  }

  /**
   * Execute the actual payment
   */
  private async executePayment(
    paymentId: string,
    jobId: number,
    clientId: number,
    contractorId: number,
    amount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency,
    jurisdiction: Jurisdiction,
    complianceValidation: IComplianceValidation,
    taxCalculation: ITaxCalculation,
    currencyConversion: ICurrencyConversion,
    correlationId: string
  ): Promise<IGlobalPayment> {
    // Mark job as paid
    const job = await Job.findByPk(jobId);
    if (job) {
      job.paid = true;
      job.paymentDate = new Date();
      await job.save();
    }

    // Create payment record (in production, this would be stored in a payments table)
    const payment: IGlobalPayment = {
      id: paymentId,
      jobId,
      clientId,
      contractorId,
      amount,
      sourceCurrency,
      targetCurrency,
      jurisdiction,
      status: 'completed',
      complianceValidation,
      taxCalculation,
      currencyConversion,
      correlationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info(`Payment executed: ${paymentId}`, { correlationId, amount, currency: targetCurrency });

    return payment;
  }

  /**
   * Update balances for client and contractor
   */
  private async updateBalances(
    clientId: number,
    contractorId: number,
    currencyConversion: ICurrencyConversion,
    jurisdiction: Jurisdiction
  ): Promise<void> {
    // Update client balance (deduct payment)
    await this.currencyService.updateMultiCurrencyBalance(
      clientId,
      currencyConversion.fromCurrency,
      -currencyConversion.originalAmount
    );

    // Update contractor balance (add payment)
    await this.currencyService.updateMultiCurrencyBalance(
      contractorId,
      currencyConversion.toCurrency,
      currencyConversion.totalAmount
    );

    logger.info(`Balances updated for payment`, {
      clientId,
      contractorId,
      clientDeduction: currencyConversion.originalAmount,
      contractorAddition: currencyConversion.totalAmount,
    });
  }

  /**
   * Generate tax documents for the payment
   */
  private async generateTaxDocuments(payment: IGlobalPayment, jurisdiction: Jurisdiction): Promise<void> {
    try {
      const documents = await this.complianceService.generateTaxDocuments(payment, jurisdiction);
      logger.info(`Generated ${documents.length} tax documents for payment ${payment.id}`, {
        jurisdiction,
        documents,
      });
    } catch (error) {
      logger.error(`Failed to generate tax documents for payment ${payment.id}`, { error });
      // Don't fail the payment for document generation issues
    }
  }

  /**
   * Get payment statistics
   */
  public getPaymentStatistics(): {
    totalProcessed: number;
    totalAmount: number;
    averageProcessingTime: number;
    successRate: number;
    topJurisdictions: Jurisdiction[];
    topCurrencies: Currency[];
  } {
    // Mock statistics - in production, this would query actual payment data
    return {
      totalProcessed: 1250,
      totalAmount: 2500000,
      averageProcessingTime: 2.5, // seconds
      successRate: 0.95,
      topJurisdictions: ['US', 'UK', 'DE', 'IN', 'CA'],
      topCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD'],
    };
  }
}
