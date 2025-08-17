// Container Configuration - Dependency Injection Setup

import { Container } from './ioc';
import { UserService } from '../services/UserService';
import { UserController } from '../controllers/UserController';
import { BusinessRuleEngine } from '../services/BusinessRuleEngine';
import { ValidationService } from '../services/ValidationService';
import { LoggerService } from '../services/LoggerService';
import { RedisService } from '../services/RedisService';
import { config } from '../config';
import { 
  DistributedCache, 
  DistributedLock, 
  DistributedRateLimiter, 
  DistributedEventBus,
  CircuitBreaker 
} from '../utils/distributed';
import { CryptoUtils } from '../utils/crypto';
import { SerializationUtils } from '../utils/serialization';
import { HealthCheckUtils } from '../utils/health';
import { MetricsUtils } from '../utils/metrics';

// Create the main container instance
export const container = new Container();

// Service Bindings
container.bind('UserService').to(UserService).inSingletonScope();
container.bind('BusinessRuleEngine').to(BusinessRuleEngine).inSingletonScope();
container.bind('ValidationService').to(ValidationService).inSingletonScope();
container.bind('LoggerService').to(LoggerService).inSingletonScope();
container.bind('RedisService').to(RedisService).inSingletonScope();

// Controller Bindings
container.bind('UserController').to(UserController).inTransientScope();

// Configuration Bindings
container.bind('AppConfig').toConstantValue(config.getConfig());

// Database Configuration
container.bind('DatabaseConfig').toConstantValue(config.get('database'));

// Distributed Services Bindings
container.bind('DistributedCache').toConstantValue(null); // Will be initialized with Redis client
container.bind('DistributedLock').toConstantValue(null); // Will be initialized with Redis client
container.bind('DistributedRateLimiter').toConstantValue(null); // Will be initialized with Redis client
container.bind('DistributedEventBus').toConstantValue(null); // Will be initialized with Redis client

// Circuit Breaker Bindings
container.bind('CircuitBreaker').toConstantValue(new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  expectedErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
}));

// Utility Bindings
container.bind('CryptoUtils').toConstantValue(CryptoUtils);
container.bind('SerializationUtils').toConstantValue(SerializationUtils);
container.bind('HealthCheckUtils').toConstantValue(HealthCheckUtils);
container.bind('MetricsUtils').toConstantValue(MetricsUtils.getInstance());

console.log(`Container initialized with ${container.id} services`);
