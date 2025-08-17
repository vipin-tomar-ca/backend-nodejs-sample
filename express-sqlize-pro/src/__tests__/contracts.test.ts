import request from 'supertest';
import { App } from '@/app';
import { Profile, Contract, Job } from '@/models';
import { ProfileType, ContractStatus } from '@/types';
import { syncDatabase } from '@/database';

describe('Contract Endpoints', () => {
  let app: App;
  let clientProfile: any;
  let contractorProfile: any;

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
    await Contract.create({
      terms: 'Test contract terms',
      status: ContractStatus.IN_PROGRESS,
      ClientId: clientProfile.id,
      ContractorId: contractorProfile.id,
    });

    app = new App();
  });

  afterAll(async () => {
    // Clean up test data
    await Job.destroy({ where: {} });
    await Contract.destroy({ where: {} });
    await Profile.destroy({ where: {} });
  });

  describe('GET /api/v1/contracts', () => {
    it('should return active contracts for authenticated client', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/contracts')
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return active contracts for authenticated contractor', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/contracts')
        .set('profile_id', contractorProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without profile_id header', async () => {
      await request(app.getApp())
        .get('/api/v1/contracts')
        .expect(401);
    });

    it('should return 401 with invalid profile_id', async () => {
      await request(app.getApp())
        .get('/api/v1/contracts')
        .set('profile_id', '999999')
        .expect(401);
    });
  });

  describe('GET /api/v1/contracts/:id', () => {
    it('should return specific contract for client', async () => {
      const contract = await Contract.findOne({
        where: { ClientId: clientProfile.id },
      });

      const response = await request(app.getApp())
        .get(`/api/v1/contracts/${contract!.id}`)
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(contract!.id);
    });

    it('should return specific contract for contractor', async () => {
      const contract = await Contract.findOne({
        where: { ContractorId: contractorProfile.id },
      });

      const response = await request(app.getApp())
        .get(`/api/v1/contracts/${contract!.id}`)
        .set('profile_id', contractorProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(contract!.id);
    });

    it('should return 404 for non-existent contract', async () => {
      await request(app.getApp())
        .get('/api/v1/contracts/999999')
        .set('profile_id', clientProfile.id.toString())
        .expect(404);
    });

    it('should return 404 for contract not owned by user', async () => {
      // Create another profile and contract
      const otherProfile = await Profile.create({
        firstName: 'Other',
        lastName: 'User',
        balance: 1000,
        type: ProfileType.CLIENT,
      });

      const otherContract = await Contract.create({
        terms: 'Other contract',
        status: ContractStatus.IN_PROGRESS,
        ClientId: otherProfile.id,
        ContractorId: contractorProfile.id,
      });

      await request(app.getApp())
        .get(`/api/v1/contracts/${otherContract.id}`)
        .set('profile_id', clientProfile.id.toString())
        .expect(404);

      // Clean up
      await Contract.destroy({ where: { id: otherContract.id } });
      await Profile.destroy({ where: { id: otherProfile.id } });
    });
  });

  describe('GET /api/v1/contracts/stats', () => {
    it('should return contract statistics', async () => {
      const response = await request(app.getApp())
        .get('/api/v1/contracts/stats')
        .set('profile_id', clientProfile.id.toString())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('terminated');
      expect(response.body.data).toHaveProperty('new');
    });
  });
});
