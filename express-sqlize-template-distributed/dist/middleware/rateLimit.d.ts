import { Request, Response, NextFunction } from 'express';
export declare const rateLimitMiddleware: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const slowDownMiddleware: import("express-rate-limit").RateLimitRequestHandler;
export declare const dynamicRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const burstRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const searchRateLimit: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.d.ts.map