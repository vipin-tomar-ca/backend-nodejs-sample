import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export class Job extends Model {
  public id!: number;
  public description!: string;
  public price!: number;
  public paid!: boolean;
  public paymentDate?: Date;
  public ContractId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly Contract?: any;

  // Instance methods
  public isUnpaid(): boolean {
    return !this.paid;
  }

  public markAsPaid(): void {
    this.paid = true;
    this.paymentDate = new Date();
  }
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ContractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Contracts',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'Jobs',
    timestamps: true,
  },
);

export default Job;
