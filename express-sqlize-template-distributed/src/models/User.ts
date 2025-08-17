import { Model, DataTypes, Sequelize } from 'sequelize';
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

export class User extends Model<IUser, Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>> implements IUser {
  public id!: number;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public role!: 'admin' | 'user' | 'moderator';
  public status!: EntityStatus;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    delete values.password; // Don't include password in JSON
    return values;
  }
}

export const initUserModel = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'user', 'moderator'),
        allowNull: false,
        defaultValue: 'user',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        allowNull: false,
        defaultValue: 'active',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['role'],
        },
        {
          fields: ['status'],
        },
      ],
      hooks: {
        beforeCreate: (user: User) => {
          // Hash password before saving (you would implement this)
          // user.password = await hashPassword(user.password);
        },
        beforeUpdate: (user: User) => {
          // Hash password if it changed
          if (user.changed('password')) {
            // user.password = await hashPassword(user.password);
          }
        },
      },
    }
  );
};

export default User;
