import { Transaction } from 'sequelize';
import { Request } from 'express';
export type ProfileType = 'client' | 'contractor';
export interface IProfile {
    id: number;
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: ProfileType;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export type ContractStatus = 'new' | 'in_progress' | 'terminated';
export interface IContract {
    id: number;
    terms: string;
    status: ContractStatus;
    ClientId: number;
    ContractorId: number;
    Client?: IProfile;
    Contractor?: IProfile;
    createdAt: Date;
    updatedAt: Date;
}
export interface IJob {
    id: number;
    description: string;
    price: number;
    paid: boolean;
    paymentDate?: Date;
    ContractId: number;
    Contract?: IContract;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface AuthenticatedRequest extends Request {
    profile: IProfile;
}
export interface PayJobRequest {
    job_id: string;
}
export interface DepositRequest {
    amount: number;
}
export interface AdminQueryParams {
    start: string;
    end: string;
    limit?: string;
}
export interface IProfileService {
    getProfileById(id: number, transaction?: Transaction): Promise<IProfile>;
    getAllProfiles(transaction?: Transaction): Promise<IProfile[]>;
    createProfile(profileData: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IProfile>;
    updateBalance(id: number, amount: number, transaction?: Transaction): Promise<IProfile>;
    getProfilesByType(type: ProfileType, transaction?: Transaction): Promise<IProfile[]>;
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
export interface IContractService {
    getContractById(id: number, transaction?: Transaction): Promise<IContract>;
    getAllContracts(transaction?: Transaction): Promise<IContract[]>;
    getContractsByStatus(status: ContractStatus, transaction?: Transaction): Promise<IContract[]>;
    getContractsByProfile(profileId: number, transaction?: Transaction): Promise<IContract[]>;
    createContract(contractData: Omit<IContract, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IContract>;
    updateContractStatus(id: number, status: ContractStatus, transaction?: Transaction): Promise<IContract>;
    getContractStats(transaction?: Transaction): Promise<{
        totalContracts: number;
        activeContracts: number;
        terminatedContracts: number;
        newContracts: number;
    }>;
}
export interface IJobService {
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
export declare class NotFoundError extends Error {
    constructor(message: string);
}
export declare class BusinessLogicError extends Error {
    constructor(message: string);
}
export declare class AuthorizationError extends Error {
    constructor(message: string);
}
export declare class ValidationError extends Error {
    constructor(message: string);
}
export interface DatabaseConfig {
    dialect: string;
    storage: string;
    logging: boolean;
}
export interface AppConfig {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    logLevel: string;
    logFilePath: string;
    corsOrigin: string;
    apiKeyHeader: string;
}
//# sourceMappingURL=index.d.ts.map