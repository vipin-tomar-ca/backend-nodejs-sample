const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, _next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Database Validation Error',
      message: 'Validation failed',
      details: validationErrors,
      timestamp: new Date(),
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const constraintErrors = error.errors.map(err => ({
      field: err.path,
      message: `${err.path} already exists`,
      value: err.value,
    }));

    return res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'Resource already exists',
      details: constraintErrors,
      timestamp: new Date(),
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Foreign Key Constraint Error',
      message: 'Referenced resource does not exist',
      timestamp: new Date(),
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Invalid authentication token',
      timestamp: new Date(),
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Authentication token has expired',
      timestamp: new Date(),
    });
  }

  // Handle syntax errors
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Invalid JSON in request body',
      timestamp: new Date(),
    });
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date(),
  });
};

/**
 * Async error wrapper middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date(),
  });
};

/**
 * Request correlation ID middleware
 */
const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || 
                       req.headers['x-request-id'] || 
                       generateCorrelationId();
  
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

/**
 * Generate a correlation ID
 */
function generateCorrelationId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Request logging middleware
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.correlationId,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      correlationId: req.correlationId,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  correlationIdMiddleware,
  requestLoggingMiddleware,
};
