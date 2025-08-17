import { Model } from 'sequelize';
export declare class Job extends Model {
    id: number;
    description: string;
    price: number;
    paid: boolean;
    paymentDate?: Date;
    ContractId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly Contract?: any;
    isUnpaid(): boolean;
    markAsPaid(): void;
}
export default Job;
//# sourceMappingURL=Job.d.ts.map