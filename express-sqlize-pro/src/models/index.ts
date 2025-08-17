import Profile from './Profile';
import Contract from './Contract';
import Job from './Job';

// Define associations
Profile.hasMany(Contract, { as: 'ClientContracts', foreignKey: 'ClientId' });
Profile.hasMany(Contract, { as: 'ContractorContracts', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Contractor', foreignKey: 'ContractorId' });

Contract.hasMany(Job, { foreignKey: 'ContractId' });
Job.belongsTo(Contract, { foreignKey: 'ContractId' });

export { Profile, Contract, Job };

// Export default for convenience
export default {
  Profile,
  Contract,
  Job,
};
