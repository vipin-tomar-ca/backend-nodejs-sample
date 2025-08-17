import { Transaction } from 'sequelize';
import { IJob, IJobService } from '@/types';
import { ProfileService } from './ProfileService';
export declare class JobService implements IJobService {
    private profileService;
    constructor(profileService: ProfileService);
    findUnpaidByProfile(profileId: number): Promise<IJob[]>;
    payJob(jobId: number, clientId: number, transaction?: Transaction): Promise<void>;
    getUnpaidJobsTotal(clientId: number): Promise<number>;
    getBestProfession(startDate: Date, endDate: Date): Promise<string | null>;
    getBestClients(startDate: Date, endDate: Date, limit: number): Promise<Array<{
        id: number;
        fullName: string;
        paid: number;
    }>>;
    getJobStats(profileId: number): Promise<{
        total: number;
        paid: number;
        unpaid: number;
        totalEarned: number;
        totalPaid: number;
    }>;
    validateJobOwnership(jobId: number, profileId: number): Promise<boolean>;
}
//# sourceMappingURL=JobService.d.ts.map