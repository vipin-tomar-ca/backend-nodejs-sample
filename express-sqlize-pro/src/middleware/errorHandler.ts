import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};

// Timeout handler middleware
export const timeoutHandler = (req: Request, res: Response, next: NextFunction): void => {
  req.setTimeout(30000, () => {
    logger.warn('Request timeout');
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

// Global error handler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error('Unhandled error:', error);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDevelopment && {
      message: error.message,
      stack: error.stack,
    }),
  });
};
