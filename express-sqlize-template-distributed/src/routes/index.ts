import { Router } from 'express';
import userRoutes from './users';
import distributedRoutes from './distributed';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Distributed functionality routes (no version prefix)
router.use('/distributed', distributedRoutes);

// API routes
router.use(`${API_VERSION}/users`, userRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date(),
  });
});

export default router;
