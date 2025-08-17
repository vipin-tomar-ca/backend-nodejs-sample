import { Request, Response } from 'express';
import { injectable, inject } from '../container/ioc';
import { IGlobalPaymentService } from '../types/global-payroll';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

@injectable()
export class GlobalPaymentController {
  private globalPaymentService: IGlobalPaymentService;

  constructor(
    @inject('GlobalPaymentService') globalPaymentService: IGlobalPaymentService
  ) {
    this.globalPaymentService = globalPaymentService;
  }

  /**
   * Process a single global payment
   */
  public async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, jurisdiction } = req.body;

      // Validate required fields
      if (!jobId || !clientId || !contractorId || !amount || !sourceCurrency || !targetCurrency || !jurisdiction) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'jobId, clientId, contractorId, amount, sourceCurrency, targetCurrency, and jurisdiction are required',
        });
        return;
      }

      // Validate that the authenticated user is the client
      if (authenticatedReq.profile.id !== clientId) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You can only process payments for your own account',
        });
        return;
      }

      const payment = await this.globalPaymentService.processGlobalPayment(
        jobId,
        clientId,
        contractorId,
        amount,
        sourceCurrency,
        targetCurrency,
        jurisdiction
      );

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Global payment processed successfully',
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Global payment processing failed:', error);
      res.status(500).json({
        success: false,
        error: 'Payment processing failed',
        message: (error as Error).message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Process batch payments
   */
  public async processBatchPayments(req: Request, res: Response): Promise<void> {
    try {
      const { payments } = req.body;

      if (!Array.isArray(payments) || payments.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid payments array',
          message: 'payments must be a non-empty array',
        });
        return;
      }

      // Validate that all payments belong to the authenticated user
      const authenticatedReq = req as AuthenticatedRequest;
      const unauthorizedPayments = payments.filter(payment => payment.clientId !== authenticatedReq.profile.id);
      
      if (unauthorizedPayments.length > 0) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You can only process payments for your own account',
        });
        return;
      }

      const results = await this.globalPaymentService.processBatchPayments(payments);

      res.status(201).json({
        success: true,
        data: results,
        message: `Processed ${results.length} payments successfully`,
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Batch payment processing failed:', error);
      res.status(500).json({
        success: false,
        error: 'Batch payment processing failed',
        message: (error as Error).message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          error: 'Missing payment ID',
          message: 'paymentId is required',
        });
        return;
      }

      const payment = await this.globalPaymentService.getPaymentStatus(paymentId);

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment status retrieved successfully',
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Failed to get payment status:', error);
      res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: (error as Error).message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get payment analytics
   */
  public async getPaymentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { jurisdiction, currency, startDate, endDate } = req.query;

      const filters: any = {};
      if (jurisdiction) filters.jurisdiction = jurisdiction;
      if (currency) filters.currency = currency;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const analytics = await this.globalPaymentService.getPaymentAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Payment analytics retrieved successfully',
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Failed to get payment analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment analytics',
        message: (error as Error).message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get payment statistics
   */
  public async getPaymentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.globalPaymentService.getPaymentStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Payment statistics retrieved successfully',
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Failed to get payment statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment statistics',
        message: (error as Error).message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Health check for global payment service
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.globalPaymentService.getPaymentStatistics();

      res.status(200).json({
        success: true,
        data: {
          service: 'Global Payment Service',
          status: 'healthy',
          uptime: process.uptime(),
          statistics,
          timestamp: new Date(),
        },
        message: 'Global payment service is healthy',
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Global payment service health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        message: 'Global payment service is not responding',
        timestamp: new Date(),
      });
    }
  }
}
