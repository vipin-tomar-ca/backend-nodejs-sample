"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const ioc_1 = require("./ioc");
const UserService_1 = require("../services/UserService");
const UserController_1 = require("../controllers/UserController");
const BusinessRuleEngine_1 = require("../services/BusinessRuleEngine");
const ValidationService_1 = require("../services/ValidationService");
const LoggerService_1 = require("../services/LoggerService");
const RedisService_1 = require("../services/RedisService");
const config_1 = require("../config");
const distributed_1 = require("../utils/distributed");
const crypto_1 = require("../utils/crypto");
const serialization_1 = require("../utils/serialization");
const health_1 = require("../utils/health");
const metrics_1 = require("../utils/metrics");
exports.container = new ioc_1.Container();
exports.container.bind('UserService').to(UserService_1.UserService).inSingletonScope();
exports.container.bind('BusinessRuleEngine').to(BusinessRuleEngine_1.BusinessRuleEngine).inSingletonScope();
exports.container.bind('ValidationService').to(ValidationService_1.ValidationService).inSingletonScope();
exports.container.bind('LoggerService').to(LoggerService_1.LoggerService).inSingletonScope();
exports.container.bind('RedisService').to(RedisService_1.RedisService).inSingletonScope();
exports.container.bind('UserController').to(UserController_1.UserController).inTransientScope();
exports.container.bind('AppConfig').toConstantValue(config_1.config.getConfig());
exports.container.bind('DatabaseConfig').toConstantValue(config_1.config.get('database'));
exports.container.bind('DistributedCache').toConstantValue(null);
exports.container.bind('DistributedLock').toConstantValue(null);
exports.container.bind('DistributedRateLimiter').toConstantValue(null);
exports.container.bind('DistributedEventBus').toConstantValue(null);
exports.container.bind('CircuitBreaker').toConstantValue(new distributed_1.CircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 60000,
    expectedErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
}));
exports.container.bind('CryptoUtils').toConstantValue(crypto_1.CryptoUtils);
exports.container.bind('SerializationUtils').toConstantValue(serialization_1.SerializationUtils);
exports.container.bind('HealthCheckUtils').toConstantValue(health_1.HealthCheckUtils);
exports.container.bind('MetricsUtils').toConstantValue(metrics_1.MetricsUtils.getInstance());
console.log(`Container initialized with ${exports.container.id} services`);
//# sourceMappingURL=index.js.map