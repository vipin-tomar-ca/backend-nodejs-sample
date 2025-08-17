import { Sequelize } from 'sequelize';
import { databaseConfig } from '@/config';
import logger from '@/utils/logger';

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: databaseConfig.dialect as any,
  storage: databaseConfig.storage,
  logging: databaseConfig.logging ? logger.info : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database (create tables if they don't exist)
export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

export default sequelize;
