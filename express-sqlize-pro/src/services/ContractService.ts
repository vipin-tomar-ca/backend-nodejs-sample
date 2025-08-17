import { injectable } from '../container/ioc';
import { Op, Transaction } from 'sequelize';
import { Contract, Profile } from '../models';
import { IContract, IContractService, NotFoundError, AuthorizationError } from '../types';
import logger from '../utils/logger';

@injectable()
export class ContractService implements IContractService {
  /**
   * Get contract by ID
   */
  public async getContractById(id: number, transaction?: Transaction): Promise<IContract> {
    const contract = await Contract.findByPk(id, {
      include: [
        { model: Profile, as: 'Client' },
        { model: Profile, as: 'Contractor' },
      ],
      transaction,
    });

    if (!contract) {
      throw new NotFoundError(`Contract with ID ${id} not found`);
    }

    return {
      id: contract.id,
      terms: contract.terms,
      status: contract.status,
      ClientId: contract.ClientId,
      ContractorId: contract.ContractorId,
      Client: contract.Client ? {
        id: contract.Client.id,
        firstName: contract.Client.firstName,
        lastName: contract.Client.lastName,
        profession: contract.Client.profession,
        balance: parseFloat(contract.Client.balance.toString()),
        type: contract.Client.type,
        version: contract.Client.version,
        createdAt: contract.Client.createdAt,
        updatedAt: contract.Client.updatedAt,
      } : undefined,
      Contractor: contract.Contractor ? {
        id: contract.Contractor.id,
        firstName: contract.Contractor.firstName,
        lastName: contract.Contractor.lastName,
        profession: contract.Contractor.profession,
        balance: parseFloat(contract.Contractor.balance.toString()),
        type: contract.Contractor.type,
        version: contract.Contractor.version,
        createdAt: contract.Contractor.createdAt,
        updatedAt: contract.Contractor.updatedAt,
      } : undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  /**
   * Get all contracts
   */
  public async getAllContracts(transaction?: Transaction): Promise<IContract[]> {
    const contracts = await Contract.findAll({
      include: [
        { model: Profile, as: 'Client' },
        { model: Profile, as: 'Contractor' },
      ],
      transaction,
    });

    return contracts.map(contract => ({
      id: contract.id,
      terms: contract.terms,
      status: contract.status,
      ClientId: contract.ClientId,
      ContractorId: contract.ContractorId,
      Client: contract.Client ? {
        id: contract.Client.id,
        firstName: contract.Client.firstName,
        lastName: contract.Client.lastName,
        profession: contract.Client.profession,
        balance: parseFloat(contract.Client.balance.toString()),
        type: contract.Client.type,
        version: contract.Client.version,
        createdAt: contract.Client.createdAt,
        updatedAt: contract.Client.updatedAt,
      } : undefined,
      Contractor: contract.Contractor ? {
        id: contract.Contractor.id,
        firstName: contract.Contractor.firstName,
        lastName: contract.Contractor.lastName,
        profession: contract.Contractor.profession,
        balance: parseFloat(contract.Contractor.balance.toString()),
        type: contract.Contractor.type,
        version: contract.Contractor.version,
        createdAt: contract.Contractor.createdAt,
        updatedAt: contract.Contractor.updatedAt,
      } : undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    }));
  }

  /**
   * Get contracts by status
   */
  public async getContractsByStatus(status: 'new' | 'in_progress' | 'terminated', transaction?: Transaction): Promise<IContract[]> {
    const contracts = await Contract.findAll({
      where: { status },
      include: [
        { model: Profile, as: 'Client' },
        { model: Profile, as: 'Contractor' },
      ],
      transaction,
    });

    return contracts.map(contract => ({
      id: contract.id,
      terms: contract.terms,
      status: contract.status,
      ClientId: contract.ClientId,
      ContractorId: contract.ContractorId,
      Client: contract.Client ? {
        id: contract.Client.id,
        firstName: contract.Client.firstName,
        lastName: contract.Client.lastName,
        profession: contract.Client.profession,
        balance: parseFloat(contract.Client.balance.toString()),
        type: contract.Client.type,
        version: contract.Client.version,
        createdAt: contract.Client.createdAt,
        updatedAt: contract.Client.updatedAt,
      } : undefined,
      Contractor: contract.Contractor ? {
        id: contract.Contractor.id,
        firstName: contract.Contractor.firstName,
        lastName: contract.Contractor.lastName,
        profession: contract.Contractor.profession,
        balance: parseFloat(contract.Contractor.balance.toString()),
        type: contract.Contractor.type,
        version: contract.Contractor.version,
        createdAt: contract.Contractor.createdAt,
        updatedAt: contract.Contractor.updatedAt,
      } : undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    }));
  }

  /**
   * Get contracts by profile
   */
  public async getContractsByProfile(profileId: number, transaction?: Transaction): Promise<IContract[]> {
    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [
          { ClientId: profileId },
          { ContractorId: profileId },
        ],
      },
      include: [
        { model: Profile, as: 'Client' },
        { model: Profile, as: 'Contractor' },
      ],
      transaction,
    });

    return contracts.map(contract => ({
      id: contract.id,
      terms: contract.terms,
      status: contract.status,
      ClientId: contract.ClientId,
      ContractorId: contract.ContractorId,
      Client: contract.Client ? {
        id: contract.Client.id,
        firstName: contract.Client.firstName,
        lastName: contract.Client.lastName,
        profession: contract.Client.profession,
        balance: parseFloat(contract.Client.balance.toString()),
        type: contract.Client.type,
        version: contract.Client.version,
        createdAt: contract.Client.createdAt,
        updatedAt: contract.Client.updatedAt,
      } : undefined,
      Contractor: contract.Contractor ? {
        id: contract.Contractor.id,
        firstName: contract.Contractor.firstName,
        lastName: contract.Contractor.lastName,
        profession: contract.Contractor.profession,
        balance: parseFloat(contract.Contractor.balance.toString()),
        type: contract.Contractor.type,
        version: contract.Contractor.version,
        createdAt: contract.Contractor.createdAt,
        updatedAt: contract.Contractor.updatedAt,
      } : undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    }));
  }

  /**
   * Create a new contract
   */
  public async createContract(contractData: Omit<IContract, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IContract> {
    const contract = await Contract.create({
      terms: contractData.terms,
      status: contractData.status,
      ClientId: contractData.ClientId,
      ContractorId: contractData.ContractorId,
    }, { transaction });

    logger.info(`Created contract with ID: ${contract.id}`);

    return this.getContractById(contract.id, transaction);
  }

  /**
   * Update contract status
   */
  public async updateContractStatus(id: number, status: 'new' | 'in_progress' | 'terminated', transaction?: Transaction): Promise<IContract> {
    const contract = await Contract.findByPk(id, { transaction });

    if (!contract) {
      throw new NotFoundError(`Contract with ID ${id} not found`);
    }

    contract.status = status;
    await contract.save({ transaction });

    logger.info(`Updated contract ${id} status to: ${status}`);

    return this.getContractById(id, transaction);
  }

  /**
   * Get contract statistics
   */
  public async getContractStats(transaction?: Transaction): Promise<{
    totalContracts: number;
    activeContracts: number;
    terminatedContracts: number;
    newContracts: number;
  }> {
    const contracts = await Contract.findAll({ transaction });

    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'in_progress').length;
    const terminatedContracts = contracts.filter(c => c.status === 'terminated').length;
    const newContracts = contracts.filter(c => c.status === 'new').length;

    return {
      totalContracts,
      activeContracts,
      terminatedContracts,
      newContracts,
    };
  }
}
