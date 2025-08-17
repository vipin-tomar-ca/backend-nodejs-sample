import { Request, Response } from 'express';
import { IGlobalPaymentService } from '../types/global-payroll';
export declare class GlobalPaymentController {
    private globalPaymentService;
    constructor(globalPaymentService: IGlobalPaymentService);
    processPayment(req: Request, res: Response): Promise<void>;
    processBatchPayments(req: Request, res: Response): Promise<void>;
    getPaymentStatus(req: Request, res: Response): Promise<void>;
    getPaymentAnalytics(req: Request, res: Response): Promise<void>;
    getPaymentStatistics(req: Request, res: Response): Promise<void>;
    healthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=GlobalPaymentController.d.ts.map