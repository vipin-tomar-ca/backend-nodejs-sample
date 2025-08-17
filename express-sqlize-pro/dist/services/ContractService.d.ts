import { Transaction } from 'sequelize';
import { IContract, IContractService } from '../types';
export declare class ContractService implements IContractService {
    getContractById(id: number, transaction?: Transaction): Promise<IContract>;
    getAllContracts(transaction?: Transaction): Promise<IContract[]>;
    getContractsByStatus(status: 'new' | 'in_progress' | 'terminated', transaction?: Transaction): Promise<IContract[]>;
    getContractsByProfile(profileId: number, transaction?: Transaction): Promise<IContract[]>;
    createContract(contractData: Omit<IContract, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IContract>;
    updateContractStatus(id: number, status: 'new' | 'in_progress' | 'terminated', transaction?: Transaction): Promise<IContract>;
    getContractStats(transaction?: Transaction): Promise<{
        totalContracts: number;
        activeContracts: number;
        terminatedContracts: number;
        newContracts: number;
    }>;
}
//# sourceMappingURL=ContractService.d.ts.map