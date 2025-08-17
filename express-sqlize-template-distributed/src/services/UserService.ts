import { injectable, inject } from '../container/ioc';
import { User, IUser } from '../models/User';
import { IBaseService, NotFoundError, ValidationError, IValidationError } from '../types';
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { ValidationService } from './ValidationService';
import { LoggerService } from './LoggerService';

@injectable()
export class UserService implements IBaseService<IUser> {
  private businessRuleEngine: BusinessRuleEngine;
  private validationService: ValidationService;
  private logger: LoggerService;

  constructor(
    @inject('BusinessRuleEngine') businessRuleEngine: BusinessRuleEngine,
    @inject('ValidationService') validationService: ValidationService,
    @inject('LoggerService') logger: LoggerService
  ) {
    this.businessRuleEngine = businessRuleEngine;
    this.validationService = validationService;
    this.logger = logger;
  }

  /**
   * Create a new user
   */
  public async create(data: Partial<IUser>): Promise<IUser> {
    try {
      this.logger.info('Creating new user', { email: data.email });

      // Validate input data
      const validationResult = await this.validateUserData(data);
      if (!validationResult.isValid) {
        throw new ValidationError('User validation failed', validationResult.errors);
      }

      // Execute business rules
      const businessRuleContext = {
        email: data.email,
        role: data.role,
        status: data.status,
        action: 'create',
      };

      const businessRuleResults = await this.businessRuleEngine.executeRules('USER_CREATION', businessRuleContext);
      const criticalFailures = businessRuleResults.filter(result => 
        result.severity === 'error' || result.severity === 'critical'
      );

      if (criticalFailures.length > 0) {
        throw new ValidationError(
          `Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Create user
      const user = await User.create(data as any);
      
      this.logger.info('User created successfully', { userId: user.id, email: user.email });
      
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', { error: error.message, email: data.email });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  public async findById(id: number): Promise<IUser | null> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        this.logger.warn('User not found', { userId: id });
        return null;
      }
      return user;
    } catch (error) {
      this.logger.error('Failed to find user by ID', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Find all users with optional filtering
   */
  public async findAll(options?: any): Promise<IUser[]> {
    try {
      const where: any = {};
      
      // Apply filters
      if (options?.status) {
        where.status = options.status;
      }
      if (options?.role) {
        where.role = options.role;
      }
      if (options?.search) {
        where[options.searchField || 'email'] = {
          [require('sequelize').Op.like]: `%${options.search}%`
        };
      }

      const users = await User.findAll({
        where,
        order: options?.order || [['createdAt', 'DESC']],
        limit: options?.limit,
        offset: options?.offset,
      });

      return users;
    } catch (error) {
      this.logger.error('Failed to find users', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  public async update(id: number, data: Partial<IUser>): Promise<IUser | null> {
    try {
      this.logger.info('Updating user', { userId: id });

      // Find user first
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Validate update data
      const validationResult = await this.validateUserData(data, true);
      if (!validationResult.isValid) {
        throw new ValidationError('User validation failed', validationResult.errors);
      }

      // Execute business rules for updates
      const businessRuleContext = {
        userId: id,
        currentData: user,
        newData: data,
        action: 'update',
      };

      const businessRuleResults = await this.businessRuleEngine.executeRules('USER_UPDATE', businessRuleContext);
      const criticalFailures = businessRuleResults.filter(result => 
        result.severity === 'error' || result.severity === 'critical'
      );

      if (criticalFailures.length > 0) {
        throw new ValidationError(
          `Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`
        );
      }

      // Update user
      await user.update(data);
      
      this.logger.info('User updated successfully', { userId: id });
      
      return user;
    } catch (error) {
      this.logger.error('Failed to update user', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Delete user by ID (soft delete)
   */
  public async delete(id: number): Promise<boolean> {
    try {
      this.logger.info('Deleting user', { userId: id });

      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Execute business rules for deletion
      const businessRuleContext = {
        userId: id,
        userData: user,
        action: 'delete',
      };

      const businessRuleResults = await this.businessRuleEngine.executeRules('USER_DELETE', businessRuleContext);
      const criticalFailures = businessRuleResults.filter(result => 
        result.severity === 'error' || result.severity === 'critical'
      );

      if (criticalFailures.length > 0) {
        throw new ValidationError(
          `Business rules failed: ${criticalFailures.map(f => f.message).join(', ')}`
        );
      }

      // Soft delete by setting status to 'deleted'
      await user.update({ status: 'deleted' });
      
      this.logger.info('User deleted successfully', { userId: id });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to delete user', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Count users with optional filtering
   */
  public async count(options?: any): Promise<number> {
    try {
      const where: any = {};
      
      if (options?.status) {
        where.status = options.status;
      }
      if (options?.role) {
        where.role = options.role;
      }

      return await User.count({ where });
    } catch (error) {
      this.logger.error('Failed to count users', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      this.logger.error('Failed to find user by email', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Update user's last login time
   */
  public async updateLastLogin(id: number): Promise<void> {
    try {
      await User.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      this.logger.error('Failed to update last login', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Validate user data
   */
  private async validateUserData(data: Partial<IUser>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: IValidationError[] }> {
    const errors: IValidationError[] = [];

    // Email validation
    if (!isUpdate || data.email !== undefined) {
      if (!data.email) {
        errors.push({ field: 'email', message: 'Email is required' });
      } else if (!this.validationService.isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
      }
    }

    // Password validation (only for creation)
    if (!isUpdate) {
      if (!data.password) {
        errors.push({ field: 'password', message: 'Password is required' });
      } else if (data.password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
      }
    }

    // Name validation
    if (!isUpdate || data.firstName !== undefined) {
      if (!data.firstName || data.firstName.trim().length === 0) {
        errors.push({ field: 'firstName', message: 'First name is required' });
      }
    }

    if (!isUpdate || data.lastName !== undefined) {
      if (!data.lastName || data.lastName.trim().length === 0) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
