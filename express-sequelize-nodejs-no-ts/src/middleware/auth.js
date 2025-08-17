const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Access token is required',
        timestamp: new Date(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Invalid authentication token',
        timestamp: new Date(),
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Authentication token has expired',
        timestamp: new Date(),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Failed to authenticate user',
      timestamp: new Date(),
    });
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date(),
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions',
          timestamp: new Date(),
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Authorization failed',
        message: 'Failed to authorize user',
        timestamp: new Date(),
      });
    }
  };
};

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole(['admin']);

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Don't fail for optional auth, just continue without user
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  optionalAuth,
};
