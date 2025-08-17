"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.syncDatabase = exports.testConnection = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("@/config");
const logger_1 = __importDefault(require("@/utils/logger"));
const sequelize = new sequelize_1.Sequelize({
    dialect: config_1.databaseConfig.dialect,
    storage: config_1.databaseConfig.storage,
    logging: config_1.databaseConfig.logging ? logger_1.default.info : false,
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
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger_1.default.info('Database connection has been established successfully.');
    }
    catch (error) {
        logger_1.default.error('Unable to connect to the database:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        logger_1.default.info('Database synchronized successfully.');
    }
    catch (error) {
        logger_1.default.error('Error synchronizing database:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
const closeConnection = async () => {
    try {
        await sequelize.close();
        logger_1.default.info('Database connection closed successfully.');
    }
    catch (error) {
        logger_1.default.error('Error closing database connection:', error);
        throw error;
    }
};
exports.closeConnection = closeConnection;
exports.default = sequelize;
//# sourceMappingURL=index.js.map