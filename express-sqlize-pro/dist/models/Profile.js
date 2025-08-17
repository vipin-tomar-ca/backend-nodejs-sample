"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../database/connection");
class Profile extends sequelize_1.Model {
}
exports.Profile = Profile;
Profile.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    profession: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('client', 'contractor'),
        allowNull: false,
    },
    version: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    balances: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string for multi-currency balances',
    },
    jurisdictions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string for jurisdiction information',
    },
    complianceDocuments: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string for compliance documents',
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'Profiles',
    timestamps: true,
});
exports.default = Profile;
//# sourceMappingURL=Profile.js.map