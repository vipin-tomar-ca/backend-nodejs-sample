import { Request, Response } from 'express';
import { injectable, inject } from '../container/ioc';
import { UserService } from '../services/UserService';
import { IApiResponse, IPaginatedResult, IUser, ValidationError, NotFoundError, AuthenticatedRequest } from '../types';

@injectable()
export class UserController {
  private userService: UserService;

  constructor(
    @inject('UserService') userService: UserService
  ) {
    this.userService = userService;
  }

  /**
   * Create a new user
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, lastName, password, role } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'email, firstName, lastName, and password are required',
          timestamp: new Date(),
        });
        return;
      }

      const user = await this.userService.create({
        email,
        firstName,
        lastName,
        password,
        role: role || 'user',
      });

      const response: IApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'User created successfully',
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          details: error.errors,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to create user',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
        return;
      }

      const user = await this.userService.findById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
        return;
      }

      const response: IApiResponse<IUser> = {
        success: true,
        data: user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
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
  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const role = req.query.role as string;
      const search = req.query.search as string;
      const searchField = req.query.searchField as string || 'email';

      const offset = (page - 1) * limit;

      const options = {
        limit,
        offset,
        status,
        role,
        search,
        searchField,
        order: [['createdAt', 'DESC']] as any,
      };

      const [users, total] = await Promise.all([
        this.userService.findAll(options),
        this.userService.count({ status, role }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const paginatedResult: IPaginatedResult<IUser> = {
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

      const response: IApiResponse<IPaginatedResult<IUser>> = {
        success: true,
        data: paginatedResult,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
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
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
        return;
      }

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await this.userService.update(userId, updateData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
        return;
      }

      const response: IApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'User updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          details: error.errors,
          timestamp: new Date(),
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to update user',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Delete user by ID (soft delete)
   */
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a valid number',
          timestamp: new Date(),
        });
        return;
      }

      const success = await this.userService.delete(userId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${userId} not found`,
          timestamp: new Date(),
        });
        return;
      }

      const response: IApiResponse<null> = {
        success: true,
        data: null,
        message: 'User deleted successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          details: error.errors,
          timestamp: new Date(),
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to delete user',
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
        return;
      }

      const user = await this.userService.findById(authenticatedReq.user.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: 'User profile not found',
          timestamp: new Date(),
        });
        return;
      }

      const response: IApiResponse<IUser> = {
        success: true,
        data: user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
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
  public async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
        return;
      }

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.role;
      delete updateData.status;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await this.userService.update(authenticatedReq.user.id, updateData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: 'User profile not found',
          timestamp: new Date(),
        });
        return;
      }

      const response: IApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          details: error.errors,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to update profile',
          timestamp: new Date(),
        });
      }
    }
  }
}
