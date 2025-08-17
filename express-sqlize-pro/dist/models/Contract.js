"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../database/connection");
class Contract extends sequelize_1.Model {
    isActive() {
        return this.status === 'in_progress';
    }
}
exports.Contract = Contract;
Contract.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    terms: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('new', 'in_progress', 'terminated'),
        allowNull: false,
        defaultValue: 'new',
    },
    ClientId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Profiles',
            key: 'id',
        },
    },
    ContractorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Profiles',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'Contracts',
    timestamps: true,
});
exports.default = Contract;
//# sourceMappingURL=Contract.js.map