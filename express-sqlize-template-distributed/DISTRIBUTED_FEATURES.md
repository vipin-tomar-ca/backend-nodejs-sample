# Distributed Features & Microservice Adaptability

This template provides comprehensive distributed architecture patterns and microservice adaptability features for building scalable, resilient applications.

## 🏗️ Architecture Overview

The template implements a distributed architecture with the following key components:

- **Dependency Injection Container** - IoC pattern for service management
- **Distributed Caching** - Redis-based caching with TTL support
- **Distributed Locking** - Redis-based distributed locks for concurrency control
- **Circuit Breaker Pattern** - Fault tolerance and resilience
- **Health Checks** - Comprehensive health monitoring
- **Metrics Collection** - Prometheus-compatible metrics
- **Rate Limiting** - Distributed rate limiting
- **Event Bus** - Distributed event publishing/subscribing
- **Configuration Management** - Environment-aware configuration

## 🚀 Distributed Features

### 1. Distributed Caching

Redis-based distributed caching with automatic serialization and TTL support.

```typescript
// Get cache instance
const cache = redisService.getCache();

// Set cache with TTL
await cache.set('user:123', userData, 3600000); // 1 hour

// Get cache value
const user = await cache.get('user:123');

// Check if key exists
const exists = await cache.exists('user:123');

// Delete cache
await cache.delete('user:123');
```

**Features:**
- Automatic JSON serialization/deserialization
- TTL (Time To Live) support
- Error handling and fallbacks
- Memory-efficient storage

### 2. Distributed Locking

Redis-based distributed locks for coordinating access to shared resources.

```typescript
// Create a distributed lock
const lock = redisService.createLock('resource:123', {
  ttl: 30000,        // 30 seconds
  retryAttempts: 3,  // Retry 3 times
  retryDelay: 1000   // Wait 1 second between retries
});

// Acquire lock
const acquired = await lock.acquire();
if (acquired) {
  try {
    // Perform critical operation
    await performCriticalOperation();
  } finally {
    // Always release the lock
    await lock.release();
  }
}
```

**Features:**
- Automatic lock expiration
- Retry mechanism with exponential backoff
- Deadlock prevention
- Atomic lock release

### 3. Circuit Breaker Pattern

Fault tolerance pattern that prevents cascading failures.

```typescript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  recoveryTimeout: 60000,   // Wait 1 minute before retry
  expectedErrors: ['ECONNREFUSED', 'ETIMEDOUT']
});

// Execute operation with circuit breaker
const result = await circuitBreaker.execute(async () => {
  return await externalServiceCall();
});
```

**States:**
- **CLOSED** - Normal operation
- **OPEN** - Failing, reject requests
- **HALF_OPEN** - Testing if service recovered

### 4. Health Checks

Comprehensive health monitoring for all system components.

```typescript
// Register custom health check
HealthCheckUtils.registerCheck({
  name: 'database',
  check: async () => {
    return await sequelize.authenticate();
  },
  timeout: 5000,
  critical: true
});

// Run all health checks
const health = await HealthCheckUtils.runHealthChecks();
```

**Built-in Health Checks:**
- Database connectivity
- Redis connectivity
- Memory usage
- Disk space
- HTTP endpoints
- Custom business logic

### 5. Metrics Collection

Prometheus-compatible metrics collection and export.

```typescript
const metrics = MetricsUtils.getInstance();

// Record metrics
metrics.increment('http_requests_total', 1, { method: 'GET', path: '/api/users' });
metrics.gauge('active_connections', 42);
metrics.histogram('request_duration_ms', 150, { endpoint: '/api/users' });

// Export in Prometheus format
const prometheusMetrics = metrics.exportPrometheus();
```

**Metric Types:**
- **Counter** - Incrementing values (requests, errors)
- **Gauge** - Current values (memory, connections)
- **Histogram** - Distribution of values (latency, size)
- **Summary** - Quantiles of values

### 6. Distributed Rate Limiting

Redis-based rate limiting that works across multiple instances.

```typescript
const rateLimiter = redisService.getRateLimiter();

// Check if request is allowed
const allowed = await rateLimiter.isAllowed(
  'user:123',  // Identifier
  100,         // Max requests
  60000        // Time window (1 minute)
);
```

**Features:**
- Sliding window algorithm
- Per-user/IP rate limiting
- Distributed across multiple instances
- Configurable limits and windows

### 7. Event Bus

Distributed event publishing and subscribing.

```typescript
const eventBus = redisService.getEventBus();

// Subscribe to events
eventBus.subscribe('user.created', (event) => {
  console.log('User created:', event.data);
});

// Publish events
await eventBus.publish('user.created', {
  userId: 123,
  email: 'user@example.com',
  timestamp: new Date()
});
```

**Features:**
- Pub/Sub pattern
- Event persistence
- Automatic serialization
- Error handling

## 🔧 Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_RETRY_DELAY=100
REDIS_MAX_RETRIES=3

# Service Configuration
SERVICE_NAME=user-service
REGION=us-west-2
ZONE=us-west-2a

# Metrics Configuration
METRICS_ENABLED=true
METRICS_PORT=9090
METRICS_PATH=/metrics
METRICS_COLLECT_INTERVAL=60000

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

### Configuration Management

```typescript
import { config } from './config';

// Get configuration
const appConfig = config.getConfig();
const dbConfig = config.get('database');
const redisConfig = config.get('redis');

// Update configuration at runtime
config.update('port', 3001);

// Validate configuration
const validation = config.validate();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## 🧪 Testing Distributed Features

### Running Tests

```bash
# Run all tests
npm test

# Run distributed tests only
npm test -- --testNamePattern="Distributed"

# Run with coverage
npm run test:coverage
```

### Test Categories

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Service interaction testing
3. **Concurrency Tests** - Race condition testing
4. **Failure Tests** - Error handling testing
5. **Performance Tests** - Load and stress testing

### Example Test

```typescript
describe('Distributed Cache Concurrency', () => {
  it('should handle concurrent operations', async () => {
    const cache = redisService.getCache();
    const concurrentOperations = 100;
    const promises = [];

    // Start concurrent operations
    for (let i = 0; i < concurrentOperations; i++) {
      promises.push(cache.set(`key-${i}`, `value-${i}`));
    }

    await Promise.all(promises);

    // Verify all operations completed
    for (let i = 0; i < concurrentOperations; i++) {
      const value = await cache.get(`key-${i}`);
      expect(value).toBe(`value-${i}`);
    }
  });
});
```

## 📊 Monitoring & Observability

### Health Check Endpoints

- `GET /distributed/health` - Comprehensive health status
- `GET /distributed/ready` - Readiness check
- `GET /distributed/live` - Liveness check

### Metrics Endpoints

- `GET /distributed/metrics` - Prometheus format
- `GET /distributed/metrics/json` - JSON format

### Monitoring Endpoints

- `GET /distributed/redis/status` - Redis status
- `GET /distributed/config` - Configuration (sanitized)
- `GET /distributed/info` - Service information

### Example Health Check Response

```json
{
  "status": "healthy",
  "timestamp": 1640995200000,
  "uptime": 3600000,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "memory": {
      "status": "healthy",
      "responseTime": 1
    }
  },
  "metadata": {
    "serviceId": "user-service-12345",
    "instanceId": "12345-1640995200000",
    "environment": "production",
    "region": "us-west-2",
    "zone": "us-west-2a"
  }
}
```

## 🚀 Deployment & Scaling

### Docker Support

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=app_db
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=app_password
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_HOST
          value: "redis-service"
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /distributed/live
            port: 3000
        readinessProbe:
          httpGet:
            path: /distributed/ready
            port: 3000
```

## 🔒 Security Considerations

### Authentication & Authorization

```typescript
// JWT-based authentication
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Role-based access control
const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Data Encryption

```typescript
// Encrypt sensitive data
const encrypted = CryptoUtils.encrypt(sensitiveData, {
  algorithm: 'aes-256-cbc',
  key: process.env.ENCRYPTION_KEY
});

// Decrypt data
const decrypted = CryptoUtils.decrypt(encrypted, {
  algorithm: 'aes-256-cbc',
  key: process.env.ENCRYPTION_KEY
});
```

### Rate Limiting

```typescript
// Apply rate limiting middleware
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

## 📈 Performance Optimization

### Caching Strategies

1. **Application Cache** - In-memory caching for frequently accessed data
2. **Distributed Cache** - Redis-based caching for shared data
3. **Database Cache** - Query result caching
4. **CDN Cache** - Static asset caching

### Connection Pooling

```typescript
// Database connection pooling
const sequelize = new Sequelize({
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Redis connection pooling
const redis = new Redis({
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});
```

### Load Balancing

```typescript
// Health check for load balancer
app.get('/health', async (req, res) => {
  const health = await HealthCheckUtils.runHealthChecks();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check Redis server status
   - Verify network connectivity
   - Check authentication credentials

2. **Database Connection Issues**
   - Verify database server status
   - Check connection pool settings
   - Review connection limits

3. **Memory Leaks**
   - Monitor memory usage metrics
   - Check for unclosed connections
   - Review cache TTL settings

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug categories
DEBUG=redis,db,metrics npm run dev
```

### Log Analysis

```typescript
// Structured logging
logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
  metadata: {
    requestId: req.headers['x-request-id'],
    userAgent: req.headers['user-agent']
  }
});
```

## 🔄 Migration & Upgrades

### Version Compatibility

- Node.js >= 18.0.0
- Redis >= 6.0.0
- PostgreSQL >= 13.0 or MySQL >= 8.0

### Breaking Changes

1. **v2.0.0** - Updated Redis client to ioredis
2. **v1.5.0** - Added circuit breaker pattern
3. **v1.0.0** - Initial release

### Migration Guide

```bash
# Backup current data
pg_dump database_name > backup.sql

# Update dependencies
npm update

# Run migrations
npm run db:migrate

# Verify health checks
curl http://localhost:3000/distributed/health
```

## 📚 Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Distributed Systems Patterns](https://martinfowler.com/articles/microservices.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
