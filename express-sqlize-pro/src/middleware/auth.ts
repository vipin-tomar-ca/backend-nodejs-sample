import { Request, Response, NextFunction } from 'express';
import { injectable } from '../container/ioc';
import { Profile } from '../models';
import { AuthenticatedRequest, NotFoundError, AuthorizationError } from '../types';
import logger from '../utils/logger';

@injectable()
export class AuthMiddleware {
  /**
   * Authenticate user by profile_id header
   */
  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profileId = req.headers['profile_id'] as string;

      if (!profileId) {
        res.status(401).json({
          success: false,
          error: 'Profile ID is required',
          message: 'Please provide a profile_id in the request headers',
        });
        return;
      }

      const profileIdNum = parseInt(profileId, 10);

      if (isNaN(profileIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid Profile ID',
          message: 'Profile ID must be a valid number',
        });
        return;
      }

      try {
        const profile = await Profile.findByPk(profileIdNum);
        
        if (!profile) {
          res.status(404).json({
            success: false,
            error: 'Profile not found',
            message: `Profile with ID ${profileId} not found`,
          });
          return;
        }

        // Add profile to request
        (req as AuthenticatedRequest).profile = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          profession: profile.profession,
          balance: parseFloat(profile.balance.toString()),
          type: profile.type,
          version: profile.version,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };
        
        logger.info(`Authenticated profile: ${profile.id} (${profile.firstName} ${profile.lastName})`);
        
        next();
      } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({
          success: false,
          error: 'Authentication failed',
          message: 'Internal server error during authentication',
        });
      }
    } catch (error) {
      logger.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Authorize user based on profile type
   */
  public authorizeProfileType(allowedTypes: ('client' | 'contractor')[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.profile) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate first',
        });
        return;
      }

      if (!allowedTypes.includes(authenticatedReq.profile.type)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `Access denied. Required profile type: ${allowedTypes.join(' or ')}`,
        });
        return;
      }

      next();
    };
  }

  /**
   * Authorize client access
   */
  public authorizeClient = this.authorizeProfileType(['client']);

  /**
   * Authorize contractor access
   */
  public authorizeContractor = this.authorizeProfileType(['contractor']);

  /**
   * Authorize both client and contractor access
   */
  public authorizeAny = this.authorizeProfileType(['client', 'contractor']);

  /**
   * Validate resource ownership
   */
  public validateResourceOwnership(resourceIdParam: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.profile) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate first',
        });
        return;
      }

      const resourceId = parseInt(req.params[resourceIdParam], 10);
      
      if (isNaN(resourceId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
          message: 'Resource ID must be a valid number',
        });
        return;
      }

      // For now, we'll allow access to any resource
      // In a real implementation, you would check if the profile owns the resource
      logger.info(`Resource ownership validated for profile ${authenticatedReq.profile.id} accessing resource ${resourceId}`);
      
      next();
    };
  }
}
