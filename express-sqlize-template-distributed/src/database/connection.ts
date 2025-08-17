import { Sequelize } from 'sequelize';
import { container } from '../container';
import { IDatabaseConfig } from '../types';

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<Sequelize> => {
  const dbConfig = container.get<IDatabaseConfig>('DatabaseConfig');
  const logger = container.get<any>('LoggerService');

  const sequelize = new Sequelize({
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password,
    logging: dbConfig.logging ? (sql: string, duration: number) => {
      logger.logDatabaseQuery(sql, duration);
    } : false,
    pool: dbConfig.pool,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      // SQLite specific options
      ...(dbConfig.dialect === 'sqlite' && {
        // Enable foreign keys
        foreignKeys: true,
      }),
      // MySQL specific options
      ...(dbConfig.dialect === 'mysql' && {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }),
      // PostgreSQL specific options
      ...(dbConfig.dialect === 'postgres' && {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
    },
  });

  // Test the connection
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }

  return sequelize;
};

/**
 * Close database connection
 */
export const closeDatabase = async (sequelize: Sequelize): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

/**
 * Sync database (create tables)
 */
export const syncDatabase = async (sequelize: Sequelize, force: boolean = false): Promise<void> => {
  const logger = container.get<any>('LoggerService');
  
  try {
    await sequelize.sync({ force });
    logger.info(`Database synced successfully (force: ${force})`);
  } catch (error) {
    logger.error('Error syncing database:', error);
    throw error;
  }
};

/**
 * Run database migrations
 */
export const runMigrations = async (sequelize: Sequelize): Promise<void> => {
  const logger = container.get<any>('LoggerService');
  
  try {
    // In a real application, you would use sequelize-cli or a migration system
    // For this template, we'll just sync the database
    await sequelize.sync({ alter: true });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    throw error;
  }
};
