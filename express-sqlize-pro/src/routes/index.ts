import { Router } from 'express';
import globalPaymentRoutes from './global-payments';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Deel Backend Assignment - Global Payroll System is running!',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    features: {
      core: true,
      globalPayroll: true,
      multiCurrency: true,
      compliance: true,
      sagaPattern: true,
      eventSourcing: true,
      businessRuleEngine: true,
      ioc: true,
      dependencyInjection: true,
    },
    architecture: {
      cleanArchitecture: true,
      solidPrinciples: true,
      iocContainer: true,
      businessRuleEngine: true,
      distributedTransactions: true,
      eventSourcing: true,
      multiCurrency: true,
      compliance: true,
    },
  });
});

// Global Payment Routes
router.use('/global-payments', globalPaymentRoutes);

export default router;
