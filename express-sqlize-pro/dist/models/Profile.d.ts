import { Model } from 'sequelize';
export declare class Profile extends Model {
    id: number;
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: 'client' | 'contractor';
    version: number;
    balances?: string;
    jurisdictions?: string;
    complianceDocuments?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Profile;
//# sourceMappingURL=Profile.d.ts.map