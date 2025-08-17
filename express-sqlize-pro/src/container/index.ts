import { Container } from './ioc';
import { ProfileService } from '../services/ProfileService';
import { ContractService } from '../services/ContractService';
import { JobService } from '../services/JobService';
import { AuthMiddleware } from '../middleware/auth';
import { IProfileService, IContractService, IJobService } from '../types';

// Global Payroll Services
import { BusinessRuleEngine } from '../services/BusinessRuleEngine';
import { CurrencyService } from '../services/CurrencyService';
import { ComplianceService } from '../services/ComplianceService';
import { GlobalPaymentService } from '../services/GlobalPaymentService';
import { GlobalPaymentController } from '../controllers/GlobalPaymentController';
import { 
  IBusinessRuleEngine,
  ICurrencyService, 
  IComplianceService, 
  IGlobalPaymentService
} from '../types/global-payroll';

// Service identifiers
export const TYPES = {
  // Core Services
  ProfileService: 'ProfileService',
  ContractService: 'ContractService',
  JobService: 'JobService',
  
  // Global Payroll Services
  BusinessRuleEngine: 'BusinessRuleEngine',
  CurrencyService: 'CurrencyService',
  ComplianceService: 'ComplianceService',
  GlobalPaymentService: 'GlobalPaymentService',
  
  // Controllers
  GlobalPaymentController: 'GlobalPaymentController',
  
  // Middleware
  AuthMiddleware: 'AuthMiddleware',
};

// Create IoC container
const container = new Container();

// Register core services
container.bind<IProfileService>(TYPES.ProfileService).to(ProfileService).inSingletonScope();
container.bind<IContractService>(TYPES.ContractService).to(ContractService).inSingletonScope();
container.bind<IJobService>(TYPES.JobService).to(JobService).inSingletonScope();

// Register global payroll services
container.bind<IBusinessRuleEngine>(TYPES.BusinessRuleEngine).to(BusinessRuleEngine).inSingletonScope();
container.bind<ICurrencyService>(TYPES.CurrencyService).to(CurrencyService).inSingletonScope();
container.bind<IComplianceService>(TYPES.ComplianceService).to(ComplianceService).inSingletonScope();
container.bind<IGlobalPaymentService>(TYPES.GlobalPaymentService).to(GlobalPaymentService).inSingletonScope();

// Register controllers
container.bind<GlobalPaymentController>(TYPES.GlobalPaymentController).to(GlobalPaymentController).inSingletonScope();

// Register middleware
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();

export { container };
export default container;
