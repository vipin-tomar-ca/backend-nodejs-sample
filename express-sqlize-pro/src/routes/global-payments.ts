import { Router } from 'express';
import container, { TYPES } from '../container';
import { GlobalPaymentController } from '../controllers/GlobalPaymentController';
import { AuthMiddleware } from '../middleware/auth';

const router = Router();

// Get instances from IoC container
const globalPaymentController = container.get<GlobalPaymentController>(TYPES.GlobalPaymentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Global Payment Routes
router.post('/process', authMiddleware.authorizeClient, globalPaymentController.processPayment.bind(globalPaymentController));
router.post('/batch', authMiddleware.authorizeClient, globalPaymentController.processBatchPayments.bind(globalPaymentController));
router.get('/status/:paymentId', authMiddleware.authorizeAny, globalPaymentController.getPaymentStatus.bind(globalPaymentController));
router.get('/analytics', authMiddleware.authorizeAny, globalPaymentController.getPaymentAnalytics.bind(globalPaymentController));
router.get('/statistics', authMiddleware.authorizeAny, globalPaymentController.getPaymentStatistics.bind(globalPaymentController));
router.get('/health', globalPaymentController.healthCheck.bind(globalPaymentController));

export default router;
