const UserService = require('../../services/UserService');
const ValidationService = require('../../services/ValidationService');

// Mock dependencies
jest.mock('../../utils/logger');

describe('UserService', () => {
  let userService;
  let mockUserModel;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock User model
    mockUserModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };

    userService = new UserService(mockUserModel);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('User validation failed');
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const existingUser = { id: 1, email: userData.email };
      mockUserModel.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      mockUserModel.findByPk.mockResolvedValue(null);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        update: jest.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findById to return existing user
      jest.spyOn(userService, 'findById').mockResolvedValue(existingUser);

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(existingUser.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(existingUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 999;
      const updateData = { firstName: 'Jane' };

      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.update(userId, updateData)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });

  describe('delete', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 1;
      const existingUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        update: jest.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findById').mockResolvedValue(existingUser);

      // Act
      const result = await userService.delete(userId);

      // Assert
      expect(existingUser.update).toHaveBeenCalledWith({ status: 'deleted' });
      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 999;

      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.delete(userId)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });
});
