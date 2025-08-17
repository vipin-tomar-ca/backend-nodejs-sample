import { Request, Response, NextFunction } from 'express';
export declare const validationMiddleware: {
    validateUserCreation: (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validateUserUpdate: (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validateUserId: (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validatePagination: (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validateSearch: (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validateField: (field: string, validations: any[]) => (import("express-validator").ValidationChain | typeof handleValidationErrors)[];
    validateObject: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
};
declare function handleValidationErrors(req: Request, res: Response, next: NextFunction): void;
export declare const sanitizeMiddleware: {
    sanitizeUserInput: (req: Request, res: Response, next: NextFunction) => void;
    sanitizeEmail: (req: Request, res: Response, next: NextFunction) => void;
};
export {};
//# sourceMappingURL=validation.d.ts.map