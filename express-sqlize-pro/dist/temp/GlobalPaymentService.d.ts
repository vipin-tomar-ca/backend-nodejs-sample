import { CurrencyService } from './CurrencyService';
import { ComplianceService } from './ComplianceService';
import { SagaPatternService } from './SagaPatternService';
import { ConcurrencyService } from './ConcurrencyService';
import { EventSourcingService } from './EventSourcingService';
import { Currency, Jurisdiction, IGlobalPayment, IGlobalSagaTransaction, IGlobalPaymentService } from '@/types/global-payroll';
export declare class GlobalPaymentService implements IGlobalPaymentService {
    private currencyService;
    private complianceService;
    private sagaPatternService;
    private concurrencyService;
    private eventSourcingService;
    constructor(currencyService: CurrencyService, complianceService: ComplianceService, sagaPatternService: SagaPatternService, concurrencyService: ConcurrencyService, eventSourcingService: EventSourcingService);
    processGlobalPayment(jobId: number, clientId: number, contractorId: number, amount: number, sourceCurrency: Currency, targetCurrency: Currency, jurisdiction: Jurisdiction): Promise<IGlobalPayment>;
    executeGlobalPaymentSaga(payment: IGlobalPayment): Promise<IGlobalSagaTransaction>;
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
    getPaymentAnalytics(jurisdiction?: Jurisdiction, currency?: Currency, startDate?: Date, endDate?: Date): Promise<any>;
    private compensateSaga;
    private generateSagaId;
    private generateCorrelationId;
}
//# sourceMappingURL=GlobalPaymentService.d.ts.map