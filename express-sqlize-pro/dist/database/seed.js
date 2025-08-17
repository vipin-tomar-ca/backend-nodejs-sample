"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
async function seed() {
    try {
        await models_1.Job.destroy({ where: {} });
        await models_1.Contract.destroy({ where: {} });
        await models_1.Profile.destroy({ where: {} });
        logger_1.default.info('Cleared existing data');
        const profiles = await models_1.Profile.bulkCreate([
            {
                firstName: 'John',
                lastName: 'Doe',
                profession: 'Software Engineer',
                balance: 1000.00,
                type: 'contractor',
                version: 1,
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                profession: 'Designer',
                balance: 1500.00,
                type: 'contractor',
                version: 1,
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                profession: 'Project Manager',
                balance: 2000.00,
                type: 'contractor',
                version: 1,
            },
            {
                firstName: 'Alice',
                lastName: 'Brown',
                profession: 'QA Engineer',
                balance: 1200.00,
                type: 'contractor',
                version: 1,
            },
            {
                firstName: 'TechCorp',
                lastName: 'Inc',
                profession: 'Technology Company',
                balance: 50000.00,
                type: 'client',
                version: 1,
            },
            {
                firstName: 'DesignStudio',
                lastName: 'LLC',
                profession: 'Design Agency',
                balance: 30000.00,
                type: 'client',
                version: 1,
            },
            {
                firstName: 'StartupXYZ',
                lastName: 'Corp',
                profession: 'Startup Company',
                balance: 25000.00,
                type: 'client',
                version: 1,
            },
            {
                firstName: 'Enterprise',
                lastName: 'Solutions',
                profession: 'Enterprise Company',
                balance: 100000.00,
                type: 'client',
                version: 1,
            },
        ]);
        logger_1.default.info(`Created ${profiles.length} profiles`);
        const contracts = await models_1.Contract.bulkCreate([
            {
                terms: 'Full-stack development contract',
                status: 'in_progress',
                ClientId: profiles[4].id,
                ContractorId: profiles[0].id,
            },
            {
                terms: 'UI/UX design contract',
                status: 'in_progress',
                ClientId: profiles[5].id,
                ContractorId: profiles[1].id,
            },
            {
                terms: 'Project management contract',
                status: 'in_progress',
                ClientId: profiles[6].id,
                ContractorId: profiles[2].id,
            },
            {
                terms: 'QA testing contract',
                status: 'in_progress',
                ClientId: profiles[7].id,
                ContractorId: profiles[3].id,
            },
            {
                terms: 'Consulting contract',
                status: 'new',
                ClientId: profiles[4].id,
                ContractorId: profiles[2].id,
            },
            {
                terms: 'Maintenance contract',
                status: 'terminated',
                ClientId: profiles[5].id,
                ContractorId: profiles[0].id,
            },
        ]);
        logger_1.default.info(`Created ${contracts.length} contracts`);
        const jobs = await models_1.Job.bulkCreate([
            {
                description: 'Build user authentication system',
                price: 500.00,
                paid: false,
                ContractId: contracts[0].id,
            },
            {
                description: 'Design mobile app interface',
                price: 300.00,
                paid: true,
                paymentDate: new Date(),
                ContractId: contracts[1].id,
            },
            {
                description: 'Project planning and setup',
                price: 200.00,
                paid: false,
                ContractId: contracts[2].id,
            },
            {
                description: 'Comprehensive testing suite',
                price: 400.00,
                paid: false,
                ContractId: contracts[3].id,
            },
            {
                description: 'Code review and optimization',
                price: 150.00,
                paid: true,
                paymentDate: new Date(),
                ContractId: contracts[0].id,
            },
            {
                description: 'Database optimization',
                price: 250.00,
                paid: false,
                ContractId: contracts[0].id,
            },
        ]);
        logger_1.default.info(`Created ${jobs.length} jobs`);
        logger_1.default.info('Database seeded successfully');
    }
    catch (error) {
        logger_1.default.error('Error seeding database:', error);
        throw error;
    }
}
if (require.main === module) {
    seed()
        .then(() => {
        logger_1.default.info('Seeding completed');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.default.error('Seeding failed:', error);
        process.exit(1);
    });
}
exports.default = seed;
//# sourceMappingURL=seed.js.map