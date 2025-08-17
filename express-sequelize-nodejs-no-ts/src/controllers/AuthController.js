const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

class AuthController {
  constructor(UserModel) {
    this.authService = new AuthService(UserModel);
  }

  /**
   * Register a new user
   */
  async register(req, res) {
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

      const result = await this.authService.register({
        email,
        firstName,
        lastName,
        password,
        role: role || 'user',
      });

      const response = {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'User registered successfully',
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('User registration failed', { error: error.message });
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'User Already Exists',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to register user',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'email and password are required',
          timestamp: new Date(),
        });
      }

      const result = await this.authService.login(email, password);

      const response = {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'Login successful',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('User login failed', { error: error.message });
      
      if (error.message.includes('Invalid email or password') || error.message.includes('deactivated')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to login',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Missing token',
          message: 'Token is required',
          timestamp: new Date(),
        });
      }

      const result = await this.authService.refreshToken(token);

      const response = {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'Token refreshed successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      
      if (error.message.includes('Invalid token') || error.message.includes('not found')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Token',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to refresh token',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'currentPassword and newPassword are required',
          timestamp: new Date(),
        });
      }

      await this.authService.changePassword(req.user.id, currentPassword, newPassword);

      const response = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Password change failed', { error: error.message });
      
      if (error.message.includes('incorrect')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Password',
          message: error.message,
          timestamp: new Date(),
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to change password',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Missing email',
          message: 'Email is required',
          timestamp: new Date(),
        });
      }

      // In a real application, you would send a password reset email
      // For this template, we'll just return a success message
      
      const response = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Forgot password failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process forgot password request',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { email, resetToken, newPassword } = req.body;

      if (!email || !resetToken || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'email, resetToken, and newPassword are required',
          timestamp: new Date(),
        });
      }

      await this.authService.resetPassword(email, resetToken, newPassword);

      const response = {
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Password reset failed', { error: error.message });
      
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
        message: 'Failed to reset password',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Logout
   */
  async logout(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
      }

      await this.authService.logout(req.user.id);

      const response = {
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to logout',
        timestamp: new Date(),
      });
    }
  }
}

module.exports = AuthController;
