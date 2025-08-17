import { injectable } from '../container/ioc';
import { Transaction } from 'sequelize';
import { Profile } from '../models';
import { IProfile, IProfileService, NotFoundError, BusinessLogicError } from '../types';
import logger from '../utils/logger';

@injectable()
export class ProfileService implements IProfileService {
  /**
   * Get profile by ID
   */
  public async getProfileById(id: number, transaction?: Transaction): Promise<IProfile> {
    const profile = await Profile.findByPk(id, { transaction });
    
    if (!profile) {
      throw new NotFoundError(`Profile with ID ${id} not found`);
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      balance: parseFloat(profile.balance.toString()),
      type: profile.type,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Get all profiles
   */
  public async getAllProfiles(transaction?: Transaction): Promise<IProfile[]> {
    const profiles = await Profile.findAll({ transaction });
    
    return profiles.map(profile => ({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      balance: parseFloat(profile.balance.toString()),
      type: profile.type,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));
  }

  /**
   * Create a new profile
   */
  public async createProfile(profileData: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<IProfile> {
    const profile = await Profile.create({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profession: profileData.profession,
      balance: profileData.balance,
      type: profileData.type,
      version: 1,
    }, { transaction });

    logger.info(`Created profile with ID: ${profile.id}`);

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      balance: parseFloat(profile.balance.toString()),
      type: profile.type,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Update profile balance
   */
  public async updateBalance(id: number, amount: number, transaction?: Transaction): Promise<IProfile> {
    const profile = await Profile.findByPk(id, { transaction });
    
    if (!profile) {
      throw new NotFoundError(`Profile with ID ${id} not found`);
    }

    const newBalance = parseFloat(profile.balance.toString()) + amount;
    
    if (newBalance < 0) {
      throw new BusinessLogicError('Insufficient balance');
    }

    profile.balance = newBalance;
    profile.version += 1;
    await profile.save({ transaction });

    logger.info(`Updated balance for profile ${id}: ${amount} (new balance: ${newBalance})`);

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      balance: parseFloat(profile.balance.toString()),
      type: profile.type,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Get profiles by type
   */
  public async getProfilesByType(type: 'client' | 'contractor', transaction?: Transaction): Promise<IProfile[]> {
    const profiles = await Profile.findAll({
      where: { type },
      transaction,
    });

    return profiles.map(profile => ({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      balance: parseFloat(profile.balance.toString()),
      type: profile.type,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));
  }

  /**
   * Get profile statistics
   */
  public async getProfileStats(transaction?: Transaction): Promise<{
    totalProfiles: number;
    clients: number;
    contractors: number;
    totalBalance: number;
    averageBalance: number;
  }> {
    const profiles = await Profile.findAll({ transaction });
    
    const totalProfiles = profiles.length;
    const clients = profiles.filter(p => p.type === 'client').length;
    const contractors = profiles.filter(p => p.type === 'contractor').length;
    const totalBalance = profiles.reduce((sum, p) => sum + parseFloat(p.balance.toString()), 0);
    const averageBalance = totalProfiles > 0 ? totalBalance / totalProfiles : 0;

    return {
      totalProfiles,
      clients,
      contractors,
      totalBalance,
      averageBalance,
    };
  }

  /**
   * Check if profile can afford amount
   */
  public async canAfford(id: number, amount: number, transaction?: Transaction): Promise<boolean> {
    const profile = await Profile.findByPk(id, { transaction });
    
    if (!profile) {
      throw new NotFoundError(`Profile with ID ${id} not found`);
    }

    return parseFloat(profile.balance.toString()) >= amount;
  }

  /**
   * Get profile full name
   */
  public async getProfileFullName(id: number, transaction?: Transaction): Promise<string> {
    const profile = await Profile.findByPk(id, { transaction });
    
    if (!profile) {
      throw new NotFoundError(`Profile with ID ${id} not found`);
    }

    return `${profile.firstName} ${profile.lastName}`;
  }
}
