import { IValidationResult } from '../types';
export declare class ValidationService {
    isValidEmail(email: string): boolean;
    isValidPassword(password: string): IValidationResult;
    validateRequired(data: any, requiredFields: string[]): IValidationResult;
    validateStringLength(value: string, field: string, min: number, max: number): IValidationResult;
    validateNumericRange(value: number, field: string, min: number, max: number): IValidationResult;
    isValidUrl(url: string): boolean;
    isValidPhoneNumber(phone: string): boolean;
    isValidDate(date: string): boolean;
    isFutureDate(date: string): boolean;
    isPastDate(date: string): boolean;
    validateArrayLength(array: any[], field: string, min: number, max: number): IValidationResult;
    validateEnum(value: any, field: string, allowedValues: any[]): IValidationResult;
    validateObjectStructure(obj: any, requiredKeys: string[]): IValidationResult;
    sanitizeString(input: string): string;
    sanitizeEmail(email: string): string;
    combineValidationResults(results: IValidationResult[]): IValidationResult;
}
//# sourceMappingURL=ValidationService.d.ts.map