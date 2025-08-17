"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
exports.sequelize = new sequelize_1.Sequelize({
    dialect: config_1.databaseConfig.dialect,
    storage: config_1.databaseConfig.storage,
    logging: config_1.databaseConfig.logging ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
});
exports.default = exports.sequelize;
//# sourceMappingURL=connection.js.map