const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthService {
  constructor(UserModel) {
    this.User = UserModel;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      logger.info('User registration attempt', { email: userData.email });

      // Check if user already exists
      const existingUser = await this.User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user
      const user = await this.User.create(userData);
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      logger.info('User registered successfully', { userId: user.id, email: user.email });
      
      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error('User registration failed', { error: error.message, email: userData.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      logger.info('User login attempt', { email });

      // Find user by email
      const user = await this.User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive()) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate JWT token
      const token = this.generateToken(user);
      
      logger.info('User logged in successfully', { userId: user.id, email: user.email });
      
      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error('User login failed', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      logger.error('Token verification failed', { error: error.message });
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      // Find user
      const user = await this.User.findByPk(decoded.id);
      if (!user || !user.isActive()) {
        throw new Error('User not found or inactive');
      }

      // Generate new token
      const newToken = this.generateToken(user);
      
      logger.info('Token refreshed successfully', { userId: user.id });
      
      return {
        user: user.toJSON(),
        token: newToken,
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      logger.info('Password change attempt', { userId });

      // Find user
      const user = await this.User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await user.update({ password: newPassword });
      
      logger.info('Password changed successfully', { userId });
      
      return true;
    } catch (error) {
      logger.error('Password change failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Reset password (forgot password flow)
   */
  async resetPassword(email, resetToken, newPassword) {
    try {
      logger.info('Password reset attempt', { email });

      // Find user
      const user = await this.User.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // In a real application, you would verify the reset token
      // For this template, we'll skip token verification
      
      // Update password
      await user.update({ password: newPassword });
      
      logger.info('Password reset successfully', { userId: user.id, email });
      
      return true;
    } catch (error) {
      logger.error('Password reset failed', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Logout (invalidate token)
   */
  async logout(userId) {
    try {
      logger.info('User logout', { userId });
      
      // In a real application, you might want to blacklist the token
      // For this template, we'll just log the logout
      
      return true;
    } catch (error) {
      logger.error('Logout failed', { error: error.message, userId });
      throw error;
    }
  }
}

module.exports = AuthService;
