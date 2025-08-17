"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("./users"));
const distributed_1 = __importDefault(require("./distributed"));
const router = (0, express_1.Router)();
const API_VERSION = '/api/v1';
router.use('/distributed', distributed_1.default);
router.use(`${API_VERSION}/users`, users_1.default);
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date(),
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map