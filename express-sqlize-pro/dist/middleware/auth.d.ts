import { Request, Response, NextFunction } from 'express';
export declare class AuthMiddleware {
    authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    authorizeProfileType(allowedTypes: ('client' | 'contractor')[]): (req: Request, res: Response, next: NextFunction) => void;
    authorizeClient: (req: Request, res: Response, next: NextFunction) => void;
    authorizeContractor: (req: Request, res: Response, next: NextFunction) => void;
    authorizeAny: (req: Request, res: Response, next: NextFunction) => void;
    validateResourceOwnership(resourceIdParam: string): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=auth.d.ts.map