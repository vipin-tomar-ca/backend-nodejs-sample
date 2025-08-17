const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Validation failed',
      details: validationErrors,
      timestamp: new Date(),
    });
  }

  next();
};

/**
 * Validation middleware using express-validator
 */
const validationMiddleware = {
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
   * Validate login
   */
  validateLogin: [
    body('email')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    handleValidationErrors,
  ],

  /**
   * Validate password change
   */
  validatePasswordChange: [
    body('currentPassword')
      .isLength({ min: 1 })
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    handleValidationErrors,
  ],

  /**
   * Generic validation for any field
   */
  validateField: (field, validations) => [
    body(field, ...validations),
    handleValidationErrors,
  ],
};

/**
 * Sanitize request data
 */
const sanitizeMiddleware = {
  /**
   * Sanitize user input
   */
  sanitizeUserInput: (req, res, next) => {
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
          req.query[key] = req.query[key].trim();
        }
      });
    }

    next();
  },

  /**
   * Sanitize email addresses
   */
  sanitizeEmail: (req, res, next) => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    next();
  },
};

module.exports = {
  validationMiddleware,
  sanitizeMiddleware,
  handleValidationErrors,
};
