import { Request, Response } from 'express';
export declare class JobController {
    private jobService;
    constructor();
    getUnpaidJobs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    payJob: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getJobStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=JobController.d.ts.map