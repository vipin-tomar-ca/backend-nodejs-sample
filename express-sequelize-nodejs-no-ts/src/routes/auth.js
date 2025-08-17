const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');
const { validationMiddleware, sanitizeMiddleware } = require('../middleware/validation');
const { authRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

// Initialize controller (will be set by the main app)
let authController;

// Middleware to set controller
const setController = (UserModel) => {
  authController = new AuthController(UserModel);
};

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Public routes (no authentication required)
router.post(
  '/register',
  sanitizeMiddleware.sanitizeUserInput,
  sanitizeMiddleware.sanitizeEmail,
  validationMiddleware.validateUserCreation,
  async (req, res) => {
    await authController.register(req, res);
  }
);

router.post(
  '/login',
  sanitizeMiddleware.sanitizeUserInput,
  sanitizeMiddleware.sanitizeEmail,
  validationMiddleware.validateLogin,
  async (req, res) => {
    await authController.login(req, res);
  }
);

router.post(
  '/refresh-token',
  async (req, res) => {
    await authController.refreshToken(req, res);
  }
);

router.post(
  '/forgot-password',
  sanitizeMiddleware.sanitizeUserInput,
  sanitizeMiddleware.sanitizeEmail,
  async (req, res) => {
    await authController.forgotPassword(req, res);
  }
);

router.post(
  '/reset-password',
  sanitizeMiddleware.sanitizeUserInput,
  sanitizeMiddleware.sanitizeEmail,
  async (req, res) => {
    await authController.resetPassword(req, res);
  }
);

// Protected routes (authentication required)
router.use(authMiddleware);

router.post(
  '/change-password',
  validationMiddleware.validatePasswordChange,
  async (req, res) => {
    await authController.changePassword(req, res);
  }
);

router.post(
  '/logout',
  async (req, res) => {
    await authController.logout(req, res);
  }
);

module.exports = { router, setController };
