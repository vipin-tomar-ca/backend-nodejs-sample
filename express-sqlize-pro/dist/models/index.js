"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = exports.Contract = exports.Profile = void 0;
const Profile_1 = __importDefault(require("./Profile"));
exports.Profile = Profile_1.default;
const Contract_1 = __importDefault(require("./Contract"));
exports.Contract = Contract_1.default;
const Job_1 = __importDefault(require("./Job"));
exports.Job = Job_1.default;
Profile_1.default.hasMany(Contract_1.default, { as: 'ClientContracts', foreignKey: 'ClientId' });
Profile_1.default.hasMany(Contract_1.default, { as: 'ContractorContracts', foreignKey: 'ContractorId' });
Contract_1.default.belongsTo(Profile_1.default, { as: 'Client', foreignKey: 'ClientId' });
Contract_1.default.belongsTo(Profile_1.default, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract_1.default.hasMany(Job_1.default, { foreignKey: 'ContractId' });
Job_1.default.belongsTo(Contract_1.default, { foreignKey: 'ContractId' });
exports.default = {
    Profile: Profile_1.default,
    Contract: Contract_1.default,
    Job: Job_1.default,
};
//# sourceMappingURL=index.js.map