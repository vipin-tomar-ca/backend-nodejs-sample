class ValidationService {
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isValidPassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
        value: password,
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        value: password,
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        value: password,
      });
    }

    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        value: password,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate required fields
   */
  validateRequired(data, requiredFields) {
    const errors = [];

    requiredFields.forEach((field) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push({
          field,
          message: `${field} is required`,
          value: data[field],
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate string length
   */
  validateStringLength(value, field, min, max) {
    const errors = [];

    if (value.length < min) {
      errors.push({
        field,
        message: `${field} must be at least ${min} characters long`,
        value,
      });
    }

    if (value.length > max) {
      errors.push({
        field,
        message: `${field} must be no more than ${max} characters long`,
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate numeric range
   */
  validateNumericRange(value, field, min, max) {
    const errors = [];

    if (value < min) {
      errors.push({
        field,
        message: `${field} must be at least ${min}`,
        value,
      });
    }

    if (value > max) {
      errors.push({
        field,
        message: `${field} must be no more than ${max}`,
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number format (basic)
   */
  isValidPhoneNumber(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  }

  /**
   * Validate date format
   */
  isValidDate(date) {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Validate future date
   */
  isFutureDate(date) {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj > now;
  }

  /**
   * Validate past date
   */
  isPastDate(date) {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj < now;
  }

  /**
   * Validate array length
   */
  validateArrayLength(array, field, min, max) {
    const errors = [];

    if (!Array.isArray(array)) {
      errors.push({
        field,
        message: `${field} must be an array`,
        value: array,
      });
      return { isValid: false, errors };
    }

    if (array.length < min) {
      errors.push({
        field,
        message: `${field} must have at least ${min} items`,
        value: array,
      });
    }

    if (array.length > max) {
      errors.push({
        field,
        message: `${field} must have no more than ${max} items`,
        value: array,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate enum values
   */
  validateEnum(value, field, allowedValues) {
    const errors = [];

    if (!allowedValues.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate object structure
   */
  validateObjectStructure(obj, requiredKeys) {
    const errors = [];

    if (typeof obj !== 'object' || obj === null) {
      errors.push({
        field: 'object',
        message: 'Value must be an object',
        value: obj,
      });
      return { isValid: false, errors };
    }

    requiredKeys.forEach((key) => {
      if (!(key in obj)) {
        errors.push({
          field: key,
          message: `Missing required key: ${key}`,
          value: undefined,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input) {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/["]/g, '&quot;') // Escape quotes
      .replace(/[']/g, '&#x27;'); // Escape apostrophes
  }

  /**
   * Sanitize email input
   */
  sanitizeEmail(email) {
    return email.trim().toLowerCase();
  }

  /**
   * Combine multiple validation results
   */
  combineValidationResults(results) {
    const allErrors = [];
    let allValid = true;

    results.forEach((result) => {
      if (!result.isValid) {
        allValid = false;
        allErrors.push(...result.errors);
      }
    });

    return {
      isValid: allValid,
      errors: allErrors,
    };
  }
}

module.exports = ValidationService;
