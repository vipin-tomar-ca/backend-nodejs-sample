export interface IEvent {
    id: string;
    type: string;
    aggregateId: string;
    aggregateType: string;
    data: any;
    metadata: {
        timestamp: Date;
        userId: string;
        correlationId: string;
        causationId?: string;
    };
    version: number;
}
export interface IEventStore {
    appendEvents(aggregateId: string, events: IEvent[]): Promise<void>;
    getEvents(aggregateId: string, fromVersion?: number): Promise<IEvent[]>;
    getEventsByType(type: string): Promise<IEvent[]>;
}
export declare class EventSourcingService {
    private eventStore;
    constructor();
    private createEventStore;
    createPaymentEvents(jobId: number, clientId: number, contractorId: number, amount: number, correlationId: string): Promise<IEvent[]>;
    processPaymentWithEventSourcing(jobId: number, clientId: number, contractorId: number, amount: number): Promise<{
        success: boolean;
        events: IEvent[];
    }>;
    private applyEvents;
    private applyPaymentInitiated;
    private applyBalanceDeducted;
    private applyBalanceAdded;
    private applyJobPaid;
    private validatePaymentOperation;
    private createCompensationEvents;
    rebuildAggregate(aggregateId: string, aggregateType: string): Promise<any>;
    private generateEventId;
    private generateCorrelationId;
    getEventsByCorrelationId(correlationId: string): Promise<IEvent[]>;
    getPaymentHistory(jobId: number): Promise<IEvent[]>;
}
//# sourceMappingURL=EventSourcingService.d.ts.map