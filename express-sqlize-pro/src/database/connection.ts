import { Sequelize } from 'sequelize';
import { databaseConfig } from '../config';

export const sequelize = new Sequelize({
  dialect: databaseConfig.dialect as any,
  storage: databaseConfig.storage,
  logging: databaseConfig.logging ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
