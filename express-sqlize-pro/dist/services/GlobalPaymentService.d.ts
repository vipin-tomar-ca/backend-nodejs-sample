import { Currency, Jurisdiction, IGlobalPaymentService, IGlobalPayment } from '../types/global-payroll';
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { CurrencyService } from './CurrencyService';
import { ComplianceService } from './ComplianceService';
export declare class GlobalPaymentService implements IGlobalPaymentService {
    private businessRuleEngine;
    private currencyService;
    private complianceService;
    constructor(businessRuleEngine: BusinessRuleEngine, currencyService: CurrencyService, complianceService: ComplianceService);
    processGlobalPayment(jobId: number, clientId: number, contractorId: number, amount: number, sourceCurrency: Currency, targetCurrency: Currency, jurisdiction: Jurisdiction): Promise<IGlobalPayment>;
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
    private validatePaymentInput;
    private createBusinessRuleContext;
    private calculateTaxes;
    private executePayment;
    private updateBalances;
    private generateTaxDocuments;
    getPaymentStatistics(): {
        totalProcessed: number;
        totalAmount: number;
        averageProcessingTime: number;
        successRate: number;
        topJurisdictions: Jurisdiction[];
        topCurrencies: Currency[];
    };
}
//# sourceMappingURL=GlobalPaymentService.d.ts.map