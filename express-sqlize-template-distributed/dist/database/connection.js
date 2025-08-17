"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = exports.syncDatabase = exports.closeDatabase = exports.initializeDatabase = void 0;
const sequelize_1 = require("sequelize");
const container_1 = require("../container");
const initializeDatabase = async () => {
    const dbConfig = container_1.container.get('DatabaseConfig');
    const logger = container_1.container.get('LoggerService');
    const sequelize = new sequelize_1.Sequelize({
        dialect: dbConfig.dialect,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        logging: dbConfig.logging ? (sql, duration) => {
            logger.logDatabaseQuery(sql, duration);
        } : false,
        pool: dbConfig.pool,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
        dialectOptions: {
            ...(dbConfig.dialect === 'sqlite' && {
                foreignKeys: true,
            }),
            ...(dbConfig.dialect === 'mysql' && {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            }),
            ...(dbConfig.dialect === 'postgres' && {
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            }),
        },
    });
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
    }
    catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
    return sequelize;
};
exports.initializeDatabase = initializeDatabase;
const closeDatabase = async (sequelize) => {
    try {
        await sequelize.close();
        console.log('Database connection closed successfully');
    }
    catch (error) {
        console.error('Error closing database connection:', error);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;
const syncDatabase = async (sequelize, force = false) => {
    const logger = container_1.container.get('LoggerService');
    try {
        await sequelize.sync({ force });
        logger.info(`Database synced successfully (force: ${force})`);
    }
    catch (error) {
        logger.error('Error syncing database:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
const runMigrations = async (sequelize) => {
    const logger = container_1.container.get('LoggerService');
    try {
        await sequelize.sync({ alter: true });
        logger.info('Database migrations completed successfully');
    }
    catch (error) {
        logger.error('Error running migrations:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
//# sourceMappingURL=connection.js.map