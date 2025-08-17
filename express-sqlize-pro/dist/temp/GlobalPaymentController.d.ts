import { Request, Response } from 'express';
export declare class GlobalPaymentController {
    private globalPaymentService;
    constructor();
    processGlobalPayment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPaymentStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    processBatchPayments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPaymentAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCurrencyBalance: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getComplianceStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    private isValidCurrency;
    private isValidJurisdiction;
    private generateCorrelationId;
}
//# sourceMappingURL=GlobalPaymentController.d.ts.map