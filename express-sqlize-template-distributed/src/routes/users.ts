import { Router } from 'express';
import { container } from '../container';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();

// Get controller instance from container
const userController = container.get<UserController>('UserController');

// Apply rate limiting to all user routes
router.use(rateLimitMiddleware);

// Public routes (no authentication required)
router.post(
  '/',
  validationMiddleware.validateUserCreation,
  userController.createUser.bind(userController)
);

// Protected routes (authentication required)
router.use(authMiddleware);

// User management routes
router.get('/', userController.getUsers.bind(userController));
router.get('/me', userController.getCurrentUser.bind(userController));
router.put('/me', userController.updateCurrentUser.bind(userController));

// Admin routes (require admin role)
router.get(
  '/:id',
  validationMiddleware.validateUserId,
  userController.getUserById.bind(userController)
);

router.put(
  '/:id',
  validationMiddleware.validateUserId,
  validationMiddleware.validateUserUpdate,
  userController.updateUser.bind(userController)
);

router.delete(
  '/:id',
  validationMiddleware.validateUserId,
  userController.deleteUser.bind(userController)
);

export default router;
