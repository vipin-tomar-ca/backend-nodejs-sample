"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.initializeModels = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const initializeModels = (sequelize) => {
    (0, User_1.initUserModel)(sequelize);
    console.log('All models initialized');
};
exports.initializeModels = initializeModels;
exports.default = {
    User: User_1.User,
};
//# sourceMappingURL=index.js.map