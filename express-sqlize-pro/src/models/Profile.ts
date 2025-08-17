import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export class Profile extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public profession!: string;
  public balance!: number;
  public type!: 'client' | 'contractor';
  public version!: number;
  public balances?: string; // JSON string for multi-currency balances
  public jurisdictions?: string; // JSON string for jurisdiction info
  public complianceDocuments?: string; // JSON string for compliance documents
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM('client', 'contractor'),
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    balances: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string for multi-currency balances',
    },
    jurisdictions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string for jurisdiction information',
    },
    complianceDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string for compliance documents',
    },
  },
  {
    sequelize,
    tableName: 'Profiles',
    timestamps: true,
  },
);

export default Profile;
