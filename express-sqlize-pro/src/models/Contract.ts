import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export class Contract extends Model {
  public id!: number;
  public terms!: string;
  public status!: 'new' | 'in_progress' | 'terminated';
  public ClientId!: number;
  public ContractorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly Client?: any;
  public readonly Contractor?: any;

  // Instance methods
  public isActive(): boolean {
    return this.status === 'in_progress';
  }
}

Contract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'terminated'),
      allowNull: false,
      defaultValue: 'new',
    },
    ClientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id',
      },
    },
    ContractorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'Contracts',
    timestamps: true,
  },
);

export default Contract;
