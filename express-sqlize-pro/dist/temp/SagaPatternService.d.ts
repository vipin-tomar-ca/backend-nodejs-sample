import { ProfileService } from './ProfileService';
import { JobService } from './JobService';
import { NotificationService } from './NotificationService';
import { AuditService } from './AuditService';
export interface ISagaStep {
    execute(): Promise<void>;
    compensate(): Promise<void>;
}
export interface ISagaTransaction {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
    steps: ISagaStep[];
    currentStep: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SagaPatternService {
    private profileService;
    private jobService;
    private notificationService;
    private auditService;
    constructor(profileService: ProfileService, jobService: JobService, notificationService: NotificationService, auditService: AuditService);
    executeJobPaymentSaga(jobId: number, clientId: number, contractorId: number, amount: number): Promise<ISagaTransaction>;
    private compensateSaga;
    private generateSagaId;
    retrySaga(sagaId: string): Promise<ISagaTransaction>;
    getSagaStatus(sagaId: string): Promise<ISagaTransaction | null>;
}
//# sourceMappingURL=SagaPatternService.d.ts.map