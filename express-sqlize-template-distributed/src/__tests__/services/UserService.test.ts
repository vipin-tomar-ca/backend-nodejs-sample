import { UserService } from '../../services/UserService';
import { BusinessRuleEngine } from '../../services/BusinessRuleEngine';
import { ValidationService } from '../../services/ValidationService';
import { LoggerService } from '../../services/LoggerService';
import { container } from '../../container';

// Mock dependencies
jest.mock('../../services/BusinessRuleEngine');
jest.mock('../../services/ValidationService');
jest.mock('../../services/LoggerService');

describe('UserService', () => {
  let userService: UserService;
  let mockBusinessRuleEngine: jest.Mocked<BusinessRuleEngine>;
  let mockValidationService: jest.Mocked<ValidationService>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockBusinessRuleEngine = new BusinessRuleEngine() as jest.Mocked<BusinessRuleEngine>;
    mockValidationService = new ValidationService() as jest.Mocked<ValidationService>;
    mockLogger = new LoggerService() as jest.Mocked<LoggerService>;

    // Mock container.get to return our mocks
    jest.spyOn(container, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'BusinessRuleEngine':
          return mockBusinessRuleEngine;
        case 'ValidationService':
          return mockValidationService;
        case 'LoggerService':
          return mockLogger;
        default:
          throw new Error(`Unknown service: ${key}`);
      }
    });

    userService = new UserService(
      mockBusinessRuleEngine,
      mockValidationService,
      mockLogger
    );
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

      mockValidationService.isValidEmail.mockReturnValue(true);
      mockBusinessRuleEngine.executeRules.mockResolvedValue([]);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('Creating new user', { email: userData.email });
      expect(mockBusinessRuleEngine.executeRules).toHaveBeenCalledWith('USER_CREATION', expect.any(Object));
    });

    it('should throw validation error for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      mockValidationService.isValidEmail.mockReturnValue(false);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('User validation failed');
    });

    it('should throw error when business rules fail', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      mockValidationService.isValidEmail.mockReturnValue(true);
      mockBusinessRuleEngine.executeRules.mockResolvedValue([
        {
          ruleId: 'test-rule',
          passed: false,
          severity: 'error' as any,
          message: 'Business rule failed',
          context: {},
          timestamp: new Date(),
        },
      ]);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('Business rules failed');
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
        role: 'user' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Sequelize User.findByPk
      jest.doMock('../../models/User', () => ({
        User: {
          findByPk: jest.fn().mockResolvedValue(mockUser),
        },
      }));

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;

      // Mock Sequelize User.findByPk
      jest.doMock('../../models/User', () => ({
        User: {
          findByPk: jest.fn().mockResolvedValue(null),
        },
      }));

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('User not found', { userId });
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
        role: 'user' as const,
        status: 'active' as const,
        update: jest.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findById to return existing user
      jest.spyOn(userService, 'findById').mockResolvedValue(existingUser as any);
      mockValidationService.isValidEmail.mockReturnValue(true);
      mockBusinessRuleEngine.executeRules.mockResolvedValue([]);

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(existingUser.update).toHaveBeenCalledWith(updateData);
      expect(mockLogger.info).toHaveBeenCalledWith('User updated successfully', { userId });
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
        role: 'user' as const,
        status: 'active' as const,
        update: jest.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findById').mockResolvedValue(existingUser as any);
      mockBusinessRuleEngine.executeRules.mockResolvedValue([]);

      // Act
      const result = await userService.delete(userId);

      // Assert
      expect(existingUser.update).toHaveBeenCalledWith({ status: 'deleted' });
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('User deleted successfully', { userId });
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
