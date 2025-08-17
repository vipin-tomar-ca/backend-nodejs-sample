import { Model } from 'sequelize';
export declare class Contract extends Model {
    id: number;
    terms: string;
    status: 'new' | 'in_progress' | 'terminated';
    ClientId: number;
    ContractorId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly Client?: any;
    readonly Contractor?: any;
    isActive(): boolean;
}
export default Contract;
//# sourceMappingURL=Contract.d.ts.map