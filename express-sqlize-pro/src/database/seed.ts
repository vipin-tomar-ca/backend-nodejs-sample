import { sequelize } from './connection';
import { Profile, Contract, Job } from '../models';
import logger from '../utils/logger';

async function seed() {
  try {
    // Clear existing data
    await Job.destroy({ where: {} });
    await Contract.destroy({ where: {} });
    await Profile.destroy({ where: {} });

    logger.info('Cleared existing data');

    // Create profiles
    const profiles = await Profile.bulkCreate([
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

    logger.info(`Created ${profiles.length} profiles`);

    // Create contracts
    const contracts = await Contract.bulkCreate([
      {
        terms: 'Full-stack development contract',
        status: 'in_progress',
        ClientId: profiles[4].id, // TechCorp
        ContractorId: profiles[0].id, // John Doe
      },
      {
        terms: 'UI/UX design contract',
        status: 'in_progress',
        ClientId: profiles[5].id, // DesignStudio
        ContractorId: profiles[1].id, // Jane Smith
      },
      {
        terms: 'Project management contract',
        status: 'in_progress',
        ClientId: profiles[6].id, // StartupXYZ
        ContractorId: profiles[2].id, // Bob Johnson
      },
      {
        terms: 'QA testing contract',
        status: 'in_progress',
        ClientId: profiles[7].id, // Enterprise
        ContractorId: profiles[3].id, // Alice Brown
      },
      {
        terms: 'Consulting contract',
        status: 'new',
        ClientId: profiles[4].id, // TechCorp
        ContractorId: profiles[2].id, // Bob Johnson
      },
      {
        terms: 'Maintenance contract',
        status: 'terminated',
        ClientId: profiles[5].id, // DesignStudio
        ContractorId: profiles[0].id, // John Doe
      },
    ]);

    logger.info(`Created ${contracts.length} contracts`);

    // Create jobs
    const jobs = await Job.bulkCreate([
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

    logger.info(`Created ${jobs.length} jobs`);

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seed;
