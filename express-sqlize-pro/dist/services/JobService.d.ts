import { Transaction } from 'sequelize';
import { IJob, IJobService } from '../types';
export declare class JobService implements IJobService {
    getJobById(id: number, transaction?: Transaction): Promise<IJob>;
    getAllJobs(transaction?: Transaction): Promise<IJob[]>;
    getUnpaidJobs(transaction?: Transaction): Promise<IJob[]>;
    getJobsByContract(contractId: number, transaction?: Transaction): Promise<IJob[]>;
    createJob(jobData: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IJob>;
    payJob(jobId: number, clientId: number, transaction?: Transaction): Promise<IJob>;
    getJobStats(transaction?: Transaction): Promise<{
        totalJobs: number;
        paidJobs: number;
        unpaidJobs: number;
        totalValue: number;
        averageJobValue: number;
    }>;
}
//# sourceMappingURL=JobService.d.ts.map