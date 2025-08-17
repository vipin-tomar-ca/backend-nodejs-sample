// Core Types and Interfaces for Express + Sequelize Template

// Basic Entity Types
export type EntityStatus = 'active' | 'inactive' | 'deleted';
export type SortOrder = 'ASC' | 'DESC';

// Pagination Types
export interface IPaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  correlationId?: string;
}

export interface IApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Authentication Types
export interface IAuthenticatedUser {
  id: number;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthenticatedUser;
  correlationId?: string;
}

// Validation Types
export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

// Business Rule Types
export enum BusinessRuleType {
  VALIDATION = 'validation',
  BUSINESS = 'business',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
}

export enum BusinessRuleSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface IBusinessRule {
  id: string;
  name: string;
  type: BusinessRuleType;
  severity: BusinessRuleSeverity;
  condition: string; // JavaScript expression
  action: string; // JavaScript action
  message: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessRuleContext {
  [key: string]: any;
}

export interface IBusinessRuleResult {
  ruleId: string;
  passed: boolean;
  severity: BusinessRuleSeverity;
  message: string;
  context: IBusinessRuleContext;
  timestamp: Date;
}

// Service Interface
export interface IBaseService<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  count(options?: any): Promise<number>;
}

// Repository Interface
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  count(options?: any): Promise<number>;
  findOne(options: any): Promise<T | null>;
  bulkCreate(data: Partial<T>[]): Promise<T[]>;
  bulkUpdate(where: any, data: Partial<T>): Promise<[number]>;
  bulkDelete(where: any): Promise<number>;
}

// Event Types
export interface IEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  metadata: {
    userId?: string;
    correlationId?: string;
    timestamp: Date;
    version: number;
  };
}

// Logger Types
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface ILogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  metadata?: any;
}

// Configuration Types
export interface IDatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export interface IAppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

// Error Types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly errors?: IValidationError[]) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
