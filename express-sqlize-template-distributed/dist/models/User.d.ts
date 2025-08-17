import { Model, Sequelize } from 'sequelize';
import { EntityStatus } from '../types';
export interface IUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'admin' | 'user' | 'moderator';
    status: EntityStatus;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class User extends Model<IUser, Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>> implements IUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'admin' | 'user' | 'moderator';
    status: EntityStatus;
    lastLoginAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get fullName(): string;
    isActive(): boolean;
    isAdmin(): boolean;
    toJSON(): any;
}
export declare const initUserModel: (sequelize: Sequelize) => void;
export default User;
//# sourceMappingURL=User.d.ts.map