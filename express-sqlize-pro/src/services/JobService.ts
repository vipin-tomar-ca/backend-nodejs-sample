import { injectable } from '../container/ioc';
import { Op, Transaction, fn, col, literal } from 'sequelize';
import { Job, Contract, Profile } from '../models';
import { IJob, IJobService, NotFoundError, BusinessLogicError, AuthorizationError } from '../types';
import logger from '../utils/logger';

@injectable()
export class JobService implements IJobService {
  /**
   * Get job by ID
   */
  public async getJobById(id: number, transaction?: Transaction): Promise<IJob> {
    const job = await Job.findByPk(id, {
      include: [
        { model: Contract, include: [
          { model: Profile, as: 'Client' },
          { model: Profile, as: 'Contractor' },
        ]},
      ],
      transaction,
    });

    if (!job) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    return {
      id: job.id,
      description: job.description,
      price: parseFloat(job.price.toString()),
      paid: job.paid,
      paymentDate: job.paymentDate,
      ContractId: job.ContractId,
      Contract: job.Contract ? {
        id: job.Contract.id,
        terms: job.Contract.terms,
        status: job.Contract.status,
        ClientId: job.Contract.ClientId,
        ContractorId: job.Contract.ContractorId,
        Client: job.Contract.Client ? {
          id: job.Contract.Client.id,
          firstName: job.Contract.Client.firstName,
          lastName: job.Contract.Client.lastName,
          profession: job.Contract.Client.profession,
          balance: parseFloat(job.Contract.Client.balance.toString()),
          type: job.Contract.Client.type,
          version: job.Contract.Client.version,
          createdAt: job.Contract.Client.createdAt,
          updatedAt: job.Contract.Client.updatedAt,
        } : undefined,
        Contractor: job.Contract.Contractor ? {
          id: job.Contract.Contractor.id,
          firstName: job.Contract.Contractor.firstName,
          lastName: job.Contract.Contractor.lastName,
          profession: job.Contract.Contractor.profession,
          balance: parseFloat(job.Contract.Contractor.balance.toString()),
          type: job.Contract.Contractor.type,
          version: job.Contract.Contractor.version,
          createdAt: job.Contract.Contractor.createdAt,
          updatedAt: job.Contract.Contractor.updatedAt,
        } : undefined,
        createdAt: job.Contract.createdAt,
        updatedAt: job.Contract.updatedAt,
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  /**
   * Get all jobs
   */
  public async getAllJobs(transaction?: Transaction): Promise<IJob[]> {
    const jobs = await Job.findAll({
      include: [
        { model: Contract, include: [
          { model: Profile, as: 'Client' },
          { model: Profile, as: 'Contractor' },
        ]},
      ],
      transaction,
    });

    return jobs.map(job => ({
      id: job.id,
      description: job.description,
      price: parseFloat(job.price.toString()),
      paid: job.paid,
      paymentDate: job.paymentDate,
      ContractId: job.ContractId,
      Contract: job.Contract ? {
        id: job.Contract.id,
        terms: job.Contract.terms,
        status: job.Contract.status,
        ClientId: job.Contract.ClientId,
        ContractorId: job.Contract.ContractorId,
        Client: job.Contract.Client ? {
          id: job.Contract.Client.id,
          firstName: job.Contract.Client.firstName,
          lastName: job.Contract.Client.lastName,
          profession: job.Contract.Client.profession,
          balance: parseFloat(job.Contract.Client.balance.toString()),
          type: job.Contract.Client.type,
          version: job.Contract.Client.version,
          createdAt: job.Contract.Client.createdAt,
          updatedAt: job.Contract.Client.updatedAt,
        } : undefined,
        Contractor: job.Contract.Contractor ? {
          id: job.Contract.Contractor.id,
          firstName: job.Contract.Contractor.firstName,
          lastName: job.Contract.Contractor.lastName,
          profession: job.Contract.Contractor.profession,
          balance: parseFloat(job.Contract.Contractor.balance.toString()),
          type: job.Contract.Contractor.type,
          version: job.Contract.Contractor.version,
          createdAt: job.Contract.Contractor.createdAt,
          updatedAt: job.Contract.Contractor.updatedAt,
        } : undefined,
        createdAt: job.Contract.createdAt,
        updatedAt: job.Contract.updatedAt,
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  }

  /**
   * Get unpaid jobs
   */
  public async getUnpaidJobs(transaction?: Transaction): Promise<IJob[]> {
    const jobs = await Job.findAll({
      where: { paid: false },
      include: [
        { model: Contract, include: [
          { model: Profile, as: 'Client' },
          { model: Profile, as: 'Contractor' },
        ]},
      ],
      transaction,
    });

    return jobs.map(job => ({
      id: job.id,
      description: job.description,
      price: parseFloat(job.price.toString()),
      paid: job.paid,
      paymentDate: job.paymentDate,
      ContractId: job.ContractId,
      Contract: job.Contract ? {
        id: job.Contract.id,
        terms: job.Contract.terms,
        status: job.Contract.status,
        ClientId: job.Contract.ClientId,
        ContractorId: job.Contract.ContractorId,
        Client: job.Contract.Client ? {
          id: job.Contract.Client.id,
          firstName: job.Contract.Client.firstName,
          lastName: job.Contract.Client.lastName,
          profession: job.Contract.Client.profession,
          balance: parseFloat(job.Contract.Client.balance.toString()),
          type: job.Contract.Client.type,
          version: job.Contract.Client.version,
          createdAt: job.Contract.Client.createdAt,
          updatedAt: job.Contract.Client.updatedAt,
        } : undefined,
        Contractor: job.Contract.Contractor ? {
          id: job.Contract.Contractor.id,
          firstName: job.Contract.Contractor.firstName,
          lastName: job.Contract.Contractor.lastName,
          profession: job.Contract.Contractor.profession,
          balance: parseFloat(job.Contract.Contractor.balance.toString()),
          type: job.Contract.Contractor.type,
          version: job.Contract.Contractor.version,
          createdAt: job.Contract.Contractor.createdAt,
          updatedAt: job.Contract.Contractor.updatedAt,
        } : undefined,
        createdAt: job.Contract.createdAt,
        updatedAt: job.Contract.updatedAt,
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  }

  /**
   * Get jobs by contract
   */
  public async getJobsByContract(contractId: number, transaction?: Transaction): Promise<IJob[]> {
    const jobs = await Job.findAll({
      where: { ContractId: contractId },
      include: [
        { model: Contract, include: [
          { model: Profile, as: 'Client' },
          { model: Profile, as: 'Contractor' },
        ]},
      ],
      transaction,
    });

    return jobs.map(job => ({
      id: job.id,
      description: job.description,
      price: parseFloat(job.price.toString()),
      paid: job.paid,
      paymentDate: job.paymentDate,
      ContractId: job.ContractId,
      Contract: job.Contract ? {
        id: job.Contract.id,
        terms: job.Contract.terms,
        status: job.Contract.status,
        ClientId: job.Contract.ClientId,
        ContractorId: job.Contract.ContractorId,
        Client: job.Contract.Client ? {
          id: job.Contract.Client.id,
          firstName: job.Contract.Client.firstName,
          lastName: job.Contract.Client.lastName,
          profession: job.Contract.Client.profession,
          balance: parseFloat(job.Contract.Client.balance.toString()),
          type: job.Contract.Client.type,
          version: job.Contract.Client.version,
          createdAt: job.Contract.Client.createdAt,
          updatedAt: job.Contract.Client.updatedAt,
        } : undefined,
        Contractor: job.Contract.Contractor ? {
          id: job.Contract.Contractor.id,
          firstName: job.Contract.Contractor.firstName,
          lastName: job.Contract.Contractor.lastName,
          profession: job.Contract.Contractor.profession,
          balance: parseFloat(job.Contract.Contractor.balance.toString()),
          type: job.Contract.Contractor.type,
          version: job.Contract.Contractor.version,
          createdAt: job.Contract.Contractor.createdAt,
          updatedAt: job.Contract.Contractor.updatedAt,
        } : undefined,
        createdAt: job.Contract.createdAt,
        updatedAt: job.Contract.updatedAt,
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  }

  /**
   * Create a new job
   */
  public async createJob(jobData: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IJob> {
    const job = await Job.create({
      description: jobData.description,
      price: jobData.price,
      paid: jobData.paid || false,
      paymentDate: jobData.paymentDate,
      ContractId: jobData.ContractId,
    }, { transaction });

    logger.info(`Created job with ID: ${job.id}`);

    return this.getJobById(job.id, transaction);
  }

  /**
   * Pay a job
   */
  public async payJob(jobId: number, clientId: number, transaction?: Transaction): Promise<IJob> {
    const job = await Job.findOne({
      where: { id: jobId, paid: false },
      include: [
        { model: Contract, where: { status: 'in_progress', ClientId: clientId }, include: [
          { model: Profile, as: 'Client' },
          { model: Profile, as: 'Contractor' },
        ]},
      ],
      transaction,
    });

    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found or not payable`);
    }

    const jobPrice = parseFloat(job.price.toString());
    const client = await Profile.findByPk(clientId, { transaction });

    if (!client || parseFloat(client.balance.toString()) < jobPrice) {
      throw new BusinessLogicError('Insufficient balance to pay job');
    }

    // Update job as paid
    job.paid = true;
    job.paymentDate = new Date();
    await job.save({ transaction });

    // Update client balance directly
    client.balance = parseFloat(client.balance.toString()) - jobPrice;
    client.version += 1;
    await client.save({ transaction });

    // Update contractor balance directly
    const contractorId = job.Contract!.Contractor!.id;
    const contractor = await Profile.findByPk(contractorId, { transaction });
    if (contractor) {
      contractor.balance = parseFloat(contractor.balance.toString()) + jobPrice;
      contractor.version += 1;
      await contractor.save({ transaction });
    }

    logger.info(`Job ${jobId} paid successfully by client ${clientId}`);

    return this.getJobById(jobId, transaction);
  }

  /**
   * Get job statistics
   */
  public async getJobStats(transaction?: Transaction): Promise<{
    totalJobs: number;
    paidJobs: number;
    unpaidJobs: number;
    totalValue: number;
    averageJobValue: number;
  }> {
    const jobs = await Job.findAll({ transaction });

    const totalJobs = jobs.length;
    const paidJobs = jobs.filter(j => j.paid).length;
    const unpaidJobs = jobs.filter(j => !j.paid).length;
    const totalValue = jobs.reduce((sum, j) => sum + parseFloat(j.price.toString()), 0);
    const averageJobValue = totalJobs > 0 ? totalValue / totalJobs : 0;

    return {
      totalJobs,
      paidJobs,
      unpaidJobs,
      totalValue,
      averageJobValue,
    };
  }
}
