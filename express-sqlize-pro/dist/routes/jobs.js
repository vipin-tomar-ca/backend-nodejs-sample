"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("@/middleware/validation");
const container_1 = __importDefault(require("@/container"));
const container_2 = require("@/container");
const router = (0, express_1.Router)();
const authMiddleware = container_1.default.get(container_2.TYPES.AuthMiddleware);
const jobController = container_1.default.get(container_2.TYPES.JobController);
router.use(authMiddleware.authenticate);
router.get('/unpaid', jobController.getUnpaidJobs);
router.get('/stats', jobController.getJobStats);
router.post('/:job_id/pay', validation_1.validatePayJob, jobController.payJob);
exports.default = router;
//# sourceMappingURL=jobs.js.map