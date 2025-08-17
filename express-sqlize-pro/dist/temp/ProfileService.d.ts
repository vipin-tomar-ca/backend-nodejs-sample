import { Transaction } from 'sequelize';
import { IProfile, IProfileService } from '@/types';
export declare class ProfileService implements IProfileService {
    findById(id: number): Promise<IProfile | null>;
    findByProfileId(profileId: number): Promise<IProfile | null>;
    updateBalance(id: number, amount: number, transaction?: Transaction): Promise<void>;
    deductBalance(id: number, amount: number, transaction?: Transaction): Promise<void>;
    getProfileWithFullName(id: number): Promise<{
        id: number;
        fullName: string;
    } | null>;
    validateProfileType(id: number, type: string): Promise<boolean>;
}
//# sourceMappingURL=ProfileService.d.ts.map