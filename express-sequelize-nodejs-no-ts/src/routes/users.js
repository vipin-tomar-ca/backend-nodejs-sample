const express = require('express');
const UserController = require('../controllers/UserController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { validationMiddleware, sanitizeMiddleware } = require('../middleware/validation');
const { rateLimitMiddleware } = require('../middleware/rateLimit');

const router = express.Router();

// Initialize controller (will be set by the main app)
let userController;

// Middleware to set controller
const setController = (UserModel) => {
  userController = new UserController(UserModel);
};

// Apply rate limiting to all user routes
router.use(rateLimitMiddleware);

// Public routes (no authentication required)
router.post(
  '/',
  sanitizeMiddleware.sanitizeUserInput,
  sanitizeMiddleware.sanitizeEmail,
  validationMiddleware.validateUserCreation,
  async (req, res) => {
    await userController.createUser(req, res);
  }
);

// Protected routes (authentication required)
router.use(authMiddleware);

// User management routes
router.get('/', async (req, res) => {
  await userController.getUsers(req, res);
});

router.get('/me', async (req, res) => {
  await userController.getCurrentUser(req, res);
});

router.put('/me', async (req, res) => {
  await userController.updateCurrentUser(req, res);
});

// Admin routes (require admin role)
router.get(
  '/:id',
  validationMiddleware.validateUserId,
  async (req, res) => {
    await userController.getUserById(req, res);
  }
);

router.put(
  '/:id',
  requireAdmin,
  validationMiddleware.validateUserId,
  validationMiddleware.validateUserUpdate,
  async (req, res) => {
    await userController.updateUser(req, res);
  }
);

router.delete(
  '/:id',
  requireAdmin,
  validationMiddleware.validateUserId,
  async (req, res) => {
    await userController.deleteUser(req, res);
  }
);

module.exports = { router, setController };
