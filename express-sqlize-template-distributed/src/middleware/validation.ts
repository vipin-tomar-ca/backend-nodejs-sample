import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../types';

/**
 * Validation middleware using express-validator
 */
export const validationMiddleware = {
  /**
   * Validate user creation
   */
  validateUserCreation: [
    body('email')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('firstName')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .trim(),
    body('lastName')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .trim(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['admin', 'user', 'moderator'])
      .withMessage('Role must be one of: admin, user, moderator'),
    handleValidationErrors,
  ],

  /**
   * Validate user update
   */
  validateUserUpdate: [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .trim(),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .trim(),
    body('role')
      .optional()
      .isIn(['admin', 'user', 'moderator'])
      .withMessage('Role must be one of: admin, user, moderator'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'deleted'])
      .withMessage('Status must be one of: active, inactive, deleted'),
    handleValidationErrors,
  ],

  /**
   * Validate user ID parameter
   */
  validateUserId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    handleValidationErrors,
  ],

  /**
   * Validate pagination query parameters
   */
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'deleted'])
      .withMessage('Status must be one of: active, inactive, deleted'),
    query('role')
      .optional()
      .isIn(['admin', 'user', 'moderator'])
      .withMessage('Role must be one of: admin, user, moderator'),
    handleValidationErrors,
  ],

  /**
   * Validate search query parameters
   */
  validateSearch: [
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),
    query('searchField')
      .optional()
      .isIn(['email', 'firstName', 'lastName'])
      .withMessage('Search field must be one of: email, firstName, lastName'),
    handleValidationErrors,
  ],

  /**
   * Generic validation for any field
   */
  validateField: (field: string, validations: any[]) => [
    body(field, ...validations),
    handleValidationErrors,
  ],

  /**
   * Custom validation for complex objects
   */
  validateObject: (schema: any) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error } = schema.validate(req.body);
        if (error) {
          const validationError = new ValidationError(
            'Validation failed',
            error.details.map((detail: any) => ({
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
          res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: validationError.message,
            details: validationError.errors,
            timestamp: new Date(),
          });
          return;
        }
        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Validation failed',
          timestamp: new Date(),
        });
      }
    };
  },
};

/**
 * Handle validation errors from express-validator
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationError = new ValidationError(
      'Validation failed',
      errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.value,
      }))
    );

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: validationError.message,
      details: validationError.errors,
      timestamp: new Date(),
    });
    return;
  }

  next();
}

/**
 * Sanitize request data
 */
export const sanitizeMiddleware = {
  /**
   * Sanitize user input
   */
  sanitizeUserInput: (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key]
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/[&]/g, '&amp;') // Escape ampersands
            .replace(/["]/g, '&quot;') // Escape quotes
            .replace(/[']/g, '&#x27;'); // Escape apostrophes
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key]?.toString().trim();
        }
      });
    }

    next();
  },

  /**
   * Sanitize email addresses
   */
  sanitizeEmail: (req: Request, res: Response, next: NextFunction): void => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    next();
  },
};
