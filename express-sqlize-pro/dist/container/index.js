"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.TYPES = void 0;
const ioc_1 = require("./ioc");
const ProfileService_1 = require("../services/ProfileService");
const ContractService_1 = require("../services/ContractService");
const JobService_1 = require("../services/JobService");
const auth_1 = require("../middleware/auth");
const BusinessRuleEngine_1 = require("../services/BusinessRuleEngine");
const CurrencyService_1 = require("../services/CurrencyService");
const ComplianceService_1 = require("../services/ComplianceService");
const GlobalPaymentService_1 = require("../services/GlobalPaymentService");
const GlobalPaymentController_1 = require("../controllers/GlobalPaymentController");
exports.TYPES = {
    ProfileService: 'ProfileService',
    ContractService: 'ContractService',
    JobService: 'JobService',
    BusinessRuleEngine: 'BusinessRuleEngine',
    CurrencyService: 'CurrencyService',
    ComplianceService: 'ComplianceService',
    GlobalPaymentService: 'GlobalPaymentService',
    GlobalPaymentController: 'GlobalPaymentController',
    AuthMiddleware: 'AuthMiddleware',
};
const container = new ioc_1.Container();
exports.container = container;
container.bind(exports.TYPES.ProfileService).to(ProfileService_1.ProfileService).inSingletonScope();
container.bind(exports.TYPES.ContractService).to(ContractService_1.ContractService).inSingletonScope();
container.bind(exports.TYPES.JobService).to(JobService_1.JobService).inSingletonScope();
container.bind(exports.TYPES.BusinessRuleEngine).to(BusinessRuleEngine_1.BusinessRuleEngine).inSingletonScope();
container.bind(exports.TYPES.CurrencyService).to(CurrencyService_1.CurrencyService).inSingletonScope();
container.bind(exports.TYPES.ComplianceService).to(ComplianceService_1.ComplianceService).inSingletonScope();
container.bind(exports.TYPES.GlobalPaymentService).to(GlobalPaymentService_1.GlobalPaymentService).inSingletonScope();
container.bind(exports.TYPES.GlobalPaymentController).to(GlobalPaymentController_1.GlobalPaymentController).inSingletonScope();
container.bind(exports.TYPES.AuthMiddleware).to(auth_1.AuthMiddleware).inSingletonScope();
exports.default = container;
//# sourceMappingURL=index.js.map