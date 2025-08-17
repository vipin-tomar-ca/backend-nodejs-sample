"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../database/connection");
class Job extends sequelize_1.Model {
    isUnpaid() {
        return !this.paid;
    }
    markAsPaid() {
        this.paid = true;
        this.paymentDate = new Date();
    }
}
exports.Job = Job;
Job.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    paid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    paymentDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    ContractId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Contracts',
            key: 'id',
        },
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'Jobs',
    timestamps: true,
});
exports.default = Job;
//# sourceMappingURL=Job.js.map