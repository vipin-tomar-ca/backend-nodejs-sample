import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../types';
import { container } from '../container';
import { LoggerService } from '../services/LoggerService';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = container.get<LoggerService>('LoggerService');

  // Log the error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: (req as any).correlationId,
    userId: (req as any).user?.id,
  });

  // Handle specific error types
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: error.errors,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: error.message,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: error.message,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error instanceof ForbiddenError) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: error.message,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = (error as any).errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    res.status(400).json({
      success: false,
      error: 'Database Validation Error',
      message: 'Validation failed',
      details: validationErrors,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const constraintErrors = (error as any).errors.map((err: any) => ({
      field: err.path,
      message: `${err.path} already exists`,
      value: err.value,
    }));

    res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'Resource already exists',
      details: constraintErrors,
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      error: 'Foreign Key Constraint Error',
      message: 'Referenced resource does not exist',
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Invalid authentication token',
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Authentication token has expired',
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  // Handle syntax errors
  if (error instanceof SyntaxError) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Invalid JSON in request body',
      timestamp: new Date(),
      correlationId: (req as any).correlationId,
    });
    return;
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date(),
    correlationId: (req as any).correlationId,
  });
};

/**
 * Async error wrapper middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date(),
    correlationId: (req as any).correlationId,
  });
};

/**
 * Request correlation ID middleware
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-correlation-id'] as string || 
                       req.headers['x-request-id'] as string || 
                       generateCorrelationId();
  
  (req as any).correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

/**
 * Generate a correlation ID
 */
function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Request logging middleware
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const logger = container.get<LoggerService>('LoggerService');

  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: (req as any).correlationId,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      correlationId: (req as any).correlationId,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};
