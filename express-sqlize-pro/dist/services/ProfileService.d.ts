import { Transaction } from 'sequelize';
import { IProfile, IProfileService } from '../types';
export declare class ProfileService implements IProfileService {
    getProfileById(id: number, transaction?: Transaction): Promise<IProfile>;
    getAllProfiles(transaction?: Transaction): Promise<IProfile[]>;
    createProfile(profileData: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IProfile>;
    updateBalance(id: number, amount: number, transaction?: Transaction): Promise<IProfile>;
    getProfilesByType(type: 'client' | 'contractor', transaction?: Transaction): Promise<IProfile[]>;
    getProfileStats(transaction?: Transaction): Promise<{
        totalProfiles: number;
        clients: number;
        contractors: number;
        totalBalance: number;
        averageBalance: number;
    }>;
    canAfford(id: number, amount: number, transaction?: Transaction): Promise<boolean>;
    getProfileFullName(id: number, transaction?: Transaction): Promise<string>;
}
//# sourceMappingURL=ProfileService.d.ts.map