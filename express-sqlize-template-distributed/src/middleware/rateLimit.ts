import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Slow down middleware for API endpoints
 */
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // max delay of 20 seconds
});

/**
 * Dynamic rate limiting based on user role
 */
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // Get user role from request (if authenticated)
  const userRole = (req as any).user?.role || 'anonymous';
  
  // Define rate limits based on user role
  const rateLimits = {
    admin: 1000, // 1000 requests per 15 minutes
    moderator: 500, // 500 requests per 15 minutes
    user: 100, // 100 requests per 15 minutes
    anonymous: 50, // 50 requests per 15 minutes
  };

  const maxRequests = rateLimits[userRole as keyof typeof rateLimits] || 50;

  // Create a custom rate limiter for this request
  const customRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: maxRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return (req as any).user?.id || req.ip;
    },
    message: {
      success: false,
      error: 'Rate Limit Exceeded',
      message: `Rate limit exceeded for ${userRole} role. Please try again later.`,
      timestamp: new Date(),
    },
  });

  customRateLimit(req, res, next);
};

/**
 * Burst rate limiting for specific endpoints
 */
export const burstRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    success: false,
    error: 'Burst Rate Limit Exceeded',
    message: 'Too many requests in a short time, please slow down.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Burst Rate Limit Exceeded',
      message: 'Too many requests in a short time, please slow down.',
      timestamp: new Date(),
    });
  },
});

/**
 * Rate limiting for file uploads
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: 'Upload Rate Limit Exceeded',
    message: 'Too many file uploads, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Upload Rate Limit Exceeded',
      message: 'Too many file uploads, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Rate limiting for search endpoints
 */
export const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 searches per 5 minutes
  message: {
    success: false,
    error: 'Search Rate Limit Exceeded',
    message: 'Too many search requests, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Search Rate Limit Exceeded',
      message: 'Too many search requests, please try again later.',
      timestamp: new Date(),
    });
  },
});
