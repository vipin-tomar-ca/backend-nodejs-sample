"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUserModel = exports.User = void 0;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    isActive() {
        return this.status === 'active';
    }
    isAdmin() {
        return this.role === 'admin';
    }
    toJSON() {
        const values = Object.assign({}, this.get());
        delete values.password;
        return values;
    }
}
exports.User = User;
const initUserModel = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100],
            },
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100],
            },
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [6, 255],
            },
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'user', 'moderator'),
            allowNull: false,
            defaultValue: 'user',
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'deleted'),
            allowNull: false,
            defaultValue: 'active',
        },
        lastLoginAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'users',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
            {
                fields: ['role'],
            },
            {
                fields: ['status'],
            },
        ],
        hooks: {
            beforeCreate: (user) => {
            },
            beforeUpdate: (user) => {
                if (user.changed('password')) {
                }
            },
        },
    });
};
exports.initUserModel = initUserModel;
exports.default = User;
//# sourceMappingURL=User.js.map