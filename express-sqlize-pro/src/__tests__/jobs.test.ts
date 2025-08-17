import request from 'supertest';
import { App } from '@/app';
import { Profile, Contract, Job } from '@/models';
import { ProfileType, ContractStatus } from '@/types';
import { syncDatabase } from '@/database';

describe('Job Endpoints', () => {
  let app: App;
  let clientProfile: any;
  let contractorProfile: any;
  let contract: any;
  let unpaidJob: any;

  beforeAll(async () => {
    // Initialize database
    await syncDatabase();
    
    // Create test profiles
    clientProfile = await Profile.create({
      firstName: 'Test',
      lastName: 'Client',
      balance: 1000,
      type: ProfileType.CLIENT,
    });

    contractorProfile = await Profile.create({
      firstName: 'Test',
      lastName: 'Contractor',
      profession: 'Developer',
      balance: 500,
      type: ProfileType.CONTRACTOR,
    });

    // Create test contract
    contract = await Contract.create({
      terms: 'Test contract terms',
      status: ContractStatus.IN_PROGRESS,
      ClientId: clientProfile.id,
      ContractorId: contractorProfile.id,
    });

    // Create test job
    unpaidJob = await Job.create({
      description: 'Test job',
      price: 200,
      paid: false,
      ContractId: contract.id,
    });

    app = new App();
  });

  afterAll(async () => {
    // Clean up test data
    await Job.destroy({ where: {} });
    await Contract.destroy({ where: {} });
    await Profile.destroy({ where: {} });
  });

  describe('GET /api/v1/jobs/unpaid', () => {
    it('should return unpaid jobs for authenticated client', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/jobs/unpaid')
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return unpaid jobs for authenticated contractor', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/jobs/unpaid')
        .set('profile_id', contractorProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without profile_id header', async () => {
      await request(app.getApp())
        .get('/api/v1/jobs/unpaid')
        .expect(401);
    });
  });

  describe('POST /api/v1/jobs/:job_id/pay', () => {
    it('should allow client to pay for job', async () => {
      const initialClientBalance = clientProfile.balance;
      const initialContractorBalance = contractorProfile.balance;

      const response = await request(app.getApp())
        .post(`/api/v1/jobs/${unpaidJob.id}/pay`)
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment processed successfully');

      // Verify job is marked as paid
      const updatedJob = await Job.findByPk(unpaidJob.id);
      expect(updatedJob!.paid).toBe(true);
      expect(updatedJob!.paymentDate).toBeDefined();

      // Verify balances are updated
      const updatedClient = await Profile.findByPk(clientProfile.id);
      const updatedContractor = await Profile.findByPk(contractorProfile.id);
      expect(updatedClient!.balance).toBe(initialClientBalance - unpaidJob.price);
      expect(updatedContractor!.balance).toBe(initialContractorBalance + unpaidJob.price);
    });

    it('should not allow contractor to pay for job', async () => {
      // Create another unpaid job
      const anotherJob = await Job.create({
        description: 'Another test job',
        price: 150,
        paid: false,
        ContractId: contract.id,
      });

      await request(app.getApp())
        .post(`/api/v1/jobs/${anotherJob.id}/pay`)
        .set('profile_id', contractorProfile.id.toString())
        .expect(403);

      // Clean up
      await Job.destroy({ where: { id: anotherJob.id } });
    });

    it('should not allow payment for already paid job', async () => {
      // Create a paid job
      const paidJob = await Job.create({
        description: 'Paid job',
        price: 100,
        paid: true,
        paymentDate: new Date(),
        ContractId: contract.id,
      });

      await request(app.getApp())
        .post(`/api/v1/jobs/${paidJob.id}/pay`)
        .set('profile_id', clientProfile.id.toString())
        .expect(400);

      // Clean up
      await Job.destroy({ where: { id: paidJob.id } });
    });

    it('should not allow payment with insufficient balance', async () => {
      // Create a job with high price
      const expensiveJob = await Job.create({
        description: 'Expensive job',
        price: 2000, // More than client's balance
        paid: false,
        ContractId: contract.id,
      });

      await request(app.getApp())
        .post(`/api/v1/jobs/${expensiveJob.id}/pay`)
        .set('profile_id', clientProfile.id.toString())
        .expect(400);

      // Clean up
      await Job.destroy({ where: { id: expensiveJob.id } });
    });

    it('should return 404 for non-existent job', async () => {
      await request(app.getApp())
        .post('/api/v1/jobs/999999/pay')
        .set('profile_id', clientProfile.id.toString())
        .expect(404);
    });
  });

  describe('GET /api/v1/jobs/stats', () => {
    it('should return job statistics', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/jobs/stats')
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('paid');
      expect(response.body.data).toHaveProperty('unpaid');
      expect(response.body.data).toHaveProperty('totalEarned');
      expect(response.body.data).toHaveProperty('totalPaid');
    });
  });
});
