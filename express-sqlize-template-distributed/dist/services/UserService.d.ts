import { IUser } from '../models/User';
import { IBaseService } from '../types';
import { BusinessRuleEngine } from './BusinessRuleEngine';
import { ValidationService } from './ValidationService';
import { LoggerService } from './LoggerService';
export declare class UserService implements IBaseService<IUser> {
    private businessRuleEngine;
    private validationService;
    private logger;
    constructor(businessRuleEngine: BusinessRuleEngine, validationService: ValidationService, logger: LoggerService);
    create(data: Partial<IUser>): Promise<IUser>;
    findById(id: number): Promise<IUser | null>;
    findAll(options?: any): Promise<IUser[]>;
    update(id: number, data: Partial<IUser>): Promise<IUser | null>;
    delete(id: number): Promise<boolean>;
    count(options?: any): Promise<number>;
    findByEmail(email: string): Promise<IUser | null>;
    updateLastLogin(id: number): Promise<void>;
    private validateUserData;
}
//# sourceMappingURL=UserService.d.ts.map