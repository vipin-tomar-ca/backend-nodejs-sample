import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, IAuthenticatedUser, UnauthorizedError } from '../types';

/**
 * Authentication middleware
 * This is a simplified version - in a real application, you would:
 * 1. Verify JWT tokens
 * 2. Check user permissions
 * 3. Validate session
 * 4. Handle token refresh
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // In a real application, you would verify the JWT token here
    // For this template, we'll simulate a simple token validation
    if (!isValidToken(token)) {
      throw new UnauthorizedError('Invalid token');
    }

    // Decode user from token (in real app, this would be JWT payload)
    const user = decodeUserFromToken(token);
    
    if (!user) {
      throw new UnauthorizedError('Invalid user');
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: error.message,
        timestamp: new Date(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication failed',
        timestamp: new Date(),
      });
    }
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!roles.includes(authenticatedReq.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions',
          timestamp: new Date(),
        });
        return;
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: error.message,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Authorization failed',
          timestamp: new Date(),
        });
      }
    }
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Check if user has specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!authenticatedReq.user.permissions.includes(permission)) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Permission '${permission}' required`,
          timestamp: new Date(),
        });
        return;
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: error.message,
          timestamp: new Date(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Permission check failed',
          timestamp: new Date(),
        });
      }
    }
  };
};

// Helper functions (simplified for template)

/**
 * Validate token (simplified)
 */
function isValidToken(token: string): boolean {
  // In a real application, you would verify JWT signature
  return token.length > 10 && token.includes('user');
}

/**
 * Decode user from token (simplified)
 */
function decodeUserFromToken(token: string): IAuthenticatedUser | null {
  try {
    // In a real application, you would decode JWT payload
    // For this template, we'll simulate a simple user object
    if (token.includes('admin')) {
      return {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
      };
    } else if (token.includes('user')) {
      return {
        id: 2,
        email: 'user@example.com',
        role: 'user',
        permissions: ['read', 'write'],
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
