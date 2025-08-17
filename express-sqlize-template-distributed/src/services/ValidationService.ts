import { injectable } from '../container/ioc';
import { IValidationResult, IValidationError } from '../types';

@injectable()
export class ValidationService {
  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  public isValidPassword(password: string): IValidationResult {
    const errors: IValidationError[] = [];

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
  public validateRequired(data: any, requiredFields: string[]): IValidationResult {
    const errors: IValidationError[] = [];

    requiredFields.forEach(field => {
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
  public validateStringLength(value: string, field: string, min: number, max: number): IValidationResult {
    const errors: IValidationError[] = [];

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
  public validateNumericRange(value: number, field: string, min: number, max: number): IValidationResult {
    const errors: IValidationError[] = [];

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
  public isValidUrl(url: string): boolean {
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
  public isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate date format
   */
  public isValidDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Validate future date
   */
  public isFutureDate(date: string): boolean {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj > now;
  }

  /**
   * Validate past date
   */
  public isPastDate(date: string): boolean {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj < now;
  }

  /**
   * Validate array length
   */
  public validateArrayLength(array: any[], field: string, min: number, max: number): IValidationResult {
    const errors: IValidationError[] = [];

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
  public validateEnum(value: any, field: string, allowedValues: any[]): IValidationResult {
    const errors: IValidationError[] = [];

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
  public validateObjectStructure(obj: any, requiredKeys: string[]): IValidationResult {
    const errors: IValidationError[] = [];

    if (typeof obj !== 'object' || obj === null) {
      errors.push({
        field: 'object',
        message: 'Value must be an object',
        value: obj,
      });
      return { isValid: false, errors };
    }

    requiredKeys.forEach(key => {
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
  public sanitizeString(input: string): string {
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
  public sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Combine multiple validation results
   */
  public combineValidationResults(results: IValidationResult[]): IValidationResult {
    const allErrors: IValidationError[] = [];
    let allValid = true;

    results.forEach(result => {
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
