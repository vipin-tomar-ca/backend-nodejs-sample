# Express.js + Sequelize Template with Distributed Architecture

A comprehensive, production-ready Express.js template with Sequelize ORM, featuring dependency injection, business rules engine, validation, logging, and distributed architecture patterns.

## 🚀 Features

### Core Architecture
- **Dependency Injection Container** - Custom IoC container for service management
- **Business Rules Engine** - Dynamic rule-based validation and business logic
- **Service Layer Pattern** - Clean separation of business logic
- **Repository Pattern** - Data access abstraction
- **Middleware Architecture** - Modular, composable middleware

### Security & Validation
- **Input Validation** - Express-validator integration with custom validation
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Rate Limiting** - Multiple rate limiting strategies
- **Input Sanitization** - XSS protection and data cleaning
- **Security Headers** - Helmet.js integration

### Database & ORM
- **Sequelize ORM** - Full-featured ORM with TypeScript support
- **Multiple Database Support** - SQLite, MySQL, PostgreSQL
- **Migration System** - Database schema management
- **Connection Pooling** - Optimized database connections

### Logging & Monitoring
- **Structured Logging** - Winston.js with daily rotation
- **Request Correlation** - Request tracking across services
- **Performance Monitoring** - Response time tracking
- **Error Handling** - Comprehensive error management

### API Design
- **RESTful API** - Standard REST endpoints
- **Pagination** - Built-in pagination support
- **Response Standardization** - Consistent API responses
- **API Versioning** - Versioned API endpoints

## 📁 Project Structure

```
src/
├── container/           # Dependency injection container
│   ├── ioc.ts         # IoC container implementation
│   └── index.ts       # Service bindings
├── controllers/        # HTTP request handlers
│   └── UserController.ts
├── services/          # Business logic layer
│   ├── UserService.ts
│   ├── BusinessRuleEngine.ts
│   ├── ValidationService.ts
│   └── LoggerService.ts
├── models/            # Sequelize models
│   ├── User.ts
│   └── index.ts
├── routes/            # API route definitions
│   ├── users.ts
│   └── index.ts
├── middleware/        # Express middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── rateLimit.ts
│   └── errorHandler.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── database/          # Database configuration
│   └── connection.ts
├── utils/             # Utility functions
├── config/            # Configuration files
└── server.ts          # Main application entry point
```

## 🛠️ Installation

1. **Clone the template**
   ```bash
   git clone <repository-url>
   cd express-sqlize-template-distributed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # For SQLite (default)
   npm run db:reset
   
   # For other databases, update .env and run migrations
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_DIALECT=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_NAME=template_db
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### Database Support

The template supports multiple databases:

- **SQLite** (default) - Perfect for development and testing
- **MySQL** - Production-ready relational database
- **PostgreSQL** - Advanced features and ACID compliance

## 📚 Usage Examples

### Creating a New Service

```typescript
import { injectable, inject } from '../container/ioc';
import { IBaseService } from '../types';

@injectable()
export class ProductService implements IBaseService<Product> {
  constructor(
    @inject('ProductRepository') private productRepo: IProductRepository,
    @inject('BusinessRuleEngine') private ruleEngine: BusinessRuleEngine
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    // Business logic here
    return this.productRepo.create(data);
  }
}
```

### Adding Business Rules

```typescript
// Register a new business rule
businessRuleEngine.registerRule({
  id: 'product-price-validation',
  name: 'Product Price Validation',
  type: BusinessRuleType.VALIDATION,
  severity: BusinessRuleSeverity.ERROR,
  condition: 'price < 0',
  action: 'addError(errors, "Price cannot be negative")',
  message: 'Product price validation',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### Creating API Endpoints

```typescript
// In routes/products.ts
router.post(
  '/',
  validationMiddleware.validateProductCreation,
  productController.createProduct.bind(productController)
);

router.get(
  '/:id',
  validationMiddleware.validateProductId,
  productController.getProductById.bind(productController)
);
```

### Custom Validation

```typescript
// In middleware/validation.ts
export const validateProductCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors,
];
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (drop, create, migrate, seed)
```

### Adding New Models

1. **Create the model file**
   ```typescript
   // src/models/Product.ts
   import { Model, DataTypes, Sequelize } from 'sequelize';

   export interface IProduct {
     id: number;
     name: string;
     price: number;
     // ... other fields
   }

   export class Product extends Model<IProduct> implements IProduct {
     // ... model implementation
   }

   export const initProductModel = (sequelize: Sequelize): void => {
     Product.init({
       // ... field definitions
     }, {
       sequelize,
       tableName: 'products',
     });
   };
   ```

2. **Register in models index**
   ```typescript
   // src/models/index.ts
   import { Product, initProductModel } from './Product';

   export const initializeModels = (sequelize: Sequelize): void => {
     initProductModel(sequelize);
     // ... other models
   };

   export { Product };
   ```

### Adding New Services

1. **Create the service**
   ```typescript
   // src/services/ProductService.ts
   import { injectable, inject } from '../container/ioc';
   import { IBaseService } from '../types';

   @injectable()
   export class ProductService implements IBaseService<Product> {
     // ... service implementation
   }
   ```

2. **Register in container**
   ```typescript
   // src/container/index.ts
   import { ProductService } from '../services/ProductService';

   container.bind('ProductService').to(ProductService).inSingletonScope();
   ```

## 🧪 Testing

The template includes a comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/__tests__/
├── controllers/       # Controller tests
├── services/         # Service tests
├── middleware/       # Middleware tests
└── integration/      # Integration tests
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Environment-Specific Configuration

```typescript
// config/database.ts
const config = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};

export default config[process.env.NODE_ENV || 'development'];
```

## 📖 API Documentation

### Authentication

All protected endpoints require a Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Endpoints

#### Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword"
}
```

#### Get Users (with pagination)
```http
GET /api/v1/users?page=1&limit=10&status=active
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "correlationId": "req_1234567890_abc123"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This template is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core architecture implementation
- User management system
- Business rules engine
- Comprehensive middleware stack
- Database integration
- Logging and monitoring
- Security features
