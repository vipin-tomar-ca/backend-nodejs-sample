const ValidationService = require('./ValidationService');
const logger = require('../utils/logger');

class UserService {
  constructor(UserModel) {
    this.User = UserModel;
    this.validationService = new ValidationService();
  }

  /**
   * Create a new user
   */
  async create(data) {
    try {
      logger.info('Creating new user', { email: data.email });

      // Validate input data
      const validationResult = await this.validateUserData(data);
      if (!validationResult.isValid) {
        throw new Error(`User validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await this.User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user
      const user = await this.User.create(data);
      
      logger.info('User created successfully', { userId: user.id, email: user.email });
      
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error: error.message, email: data.email });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      const user = await this.User.findByPk(id);
      if (!user) {
        logger.warn('User not found', { userId: id });
        return null;
      }
      return user;
    } catch (error) {
      logger.error('Failed to find user by ID', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Find all users with optional filtering
   */
  async findAll(options = {}) {
    try {
      const where = {};
      
      // Apply filters
      if (options.status) {
        where.status = options.status;
      }
      if (options.role) {
        where.role = options.role;
      }
      if (options.search) {
        const { Op } = require('sequelize');
        where[options.searchField || 'email'] = {
          [Op.like]: `%${options.search}%`
        };
      }

      const users = await this.User.findAll({
        where,
        order: options.order || [['createdAt', 'DESC']],
        limit: options.limit,
        offset: options.offset,
      });

      return users;
    } catch (error) {
      logger.error('Failed to find users', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  async update(id, data) {
    try {
      logger.info('Updating user', { userId: id });

      // Find user first
      const user = await this.findById(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Validate update data
      const validationResult = await this.validateUserData(data, true);
      if (!validationResult.isValid) {
        throw new Error(`User validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Update user
      await user.update(data);
      
      logger.info('User updated successfully', { userId: id });
      
      return user;
    } catch (error) {
      logger.error('Failed to update user', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Delete user by ID (soft delete)
   */
  async delete(id) {
    try {
      logger.info('Deleting user', { userId: id });

      const user = await this.findById(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Soft delete by setting status to 'deleted'
      await user.update({ status: 'deleted' });
      
      logger.info('User deleted successfully', { userId: id });
      
      return true;
    } catch (error) {
      logger.error('Failed to delete user', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Count users with optional filtering
   */
  async count(options = {}) {
    try {
      const where = {};
      
      if (options.status) {
        where.status = options.status;
      }
      if (options.role) {
        where.role = options.role;
      }

      return await this.User.count({ where });
    } catch (error) {
      logger.error('Failed to count users', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const user = await this.User.findOne({ where: { email } });
      return user;
    } catch (error) {
      logger.error('Failed to find user by email', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id) {
    try {
      await this.User.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      logger.error('Failed to update last login', { error: error.message, userId: id });
      throw error;
    }
  }

  /**
   * Validate user data
   */
  async validateUserData(data, isUpdate = false) {
    const errors = [];

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

module.exports = UserService;
