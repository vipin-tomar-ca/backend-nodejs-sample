const UserService = require('../services/UserService');
const logger = require('../utils/logger');

class UserController {
  constructor(UserModel) {
    this.userService = new UserService(UserModel);
  }

  /**
   * Create a new user
   */
  async createUser(req, res) {
    try {
      const { email, firstName, lastName, password, role } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'email, firstName, lastName, and password are required',
          timestamp: new Date(),
        });
      }

      const user = await this.userService.create({
        email,
        firstName,
        lastName,
        password,
        role: role || 'user',
      });

      const response = {
        success: true,
        data: user,
        message: 'User created successfully',
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('User creation failed', { error: error.message });
      
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
      }

      const user = await this.userService.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        data: user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user by ID failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const role = req.query.role;
      const search = req.query.search;
      const searchField = req.query.searchField || 'email';

      const offset = (page - 1) * limit;

      const options = {
        limit,
        offset,
        status,
        role,
        search,
        searchField,
        order: [['createdAt', 'DESC']],
      };

      const [users, total] = await Promise.all([
        this.userService.findAll(options),
        this.userService.count({ status, role }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const paginatedResult = {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      const response = {
        success: true,
        data: paginatedResult,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get users failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve users',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
      }

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await this.userService.update(userId, updateData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        data: user,
        message: 'User updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update user failed', { error: error.message });
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message,
          timestamp: new Date(),
        });
      }

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Delete user by ID (soft delete)
   */
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
      }

      const success = await this.userService.delete(userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        data: null,
        message: 'User deleted successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete user failed', { error: error.message });
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
      }

      const user = await this.userService.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: 'User profile not found',
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        data: user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get current user failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
      }

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.role;
      delete updateData.status;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await this.userService.update(req.user.id, updateData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: 'User profile not found',
          timestamp: new Date(),
        });
      }

      const response = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update current user failed', { error: error.message });
      
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update profile',
        timestamp: new Date(),
      });
    }
  }
}

module.exports = UserController;
