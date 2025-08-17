# Deel Backend Assignment - Production Ready Implementation

A comprehensive Node.js backend application built with Express, TypeScript, and Sequelize ORM, implementing industry best practices for a senior-level developer position.

## 🏗️ Architecture Overview

This application follows a clean, scalable architecture with:

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Dependency Injection**: Services are injected into controllers for better testability
- **Separation of Concerns**: Clear separation between routes, controllers, services, and models
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Security**: Comprehensive security middleware and validation
- **Testing**: Unit and integration tests with high coverage
- **Error Handling**: Centralized error handling with proper logging
- **Database**: SQLite with Sequelize ORM and proper migrations

## 🚀 Features

### Core Functionality
- ✅ **Authentication**: Profile-based authentication with header validation
- ✅ **Authorization**: Role-based access control (Client/Contractor)
- ✅ **Contracts**: CRUD operations with ownership validation
- ✅ **Jobs**: Payment processing with transaction safety
- ✅ **Balances**: Deposit functionality with business rules
- ✅ **Analytics**: Admin endpoints for reporting

### Technical Features
- ✅ **TypeScript**: Full type safety with strict configuration
- ✅ **Express**: Fast, unopinionated web framework
- ✅ **Sequelize**: Powerful ORM with migrations and seeding
- ✅ **SQLite**: Lightweight, file-based database
- ✅ **IoC/DI**: InversifyJS container with dependency injection
- ✅ **Validation**: Request validation with express-validator
- ✅ **Security**: Helmet, CORS, rate limiting, input sanitization
- ✅ **Logging**: Winston with daily rotation and structured logging
- ✅ **Testing**: Jest with supertest for API testing
- ✅ **Error Handling**: Centralized error handling with proper HTTP codes
- ✅ **Transactions**: ACID compliance for financial operations
- ✅ **Documentation**: Comprehensive API documentation

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- TypeScript knowledge
- Basic understanding of REST APIs

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd express-sqlize-pro
npm install
```

### 2. Environment Configuration

Copy the environment example and configure:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite3
DB_LOGGING=false
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
CORS_ORIGIN=http://localhost:3000
API_KEY_HEADER=profile_id
```

### 3. Database Setup

```bash
# Seed the database with sample data
npm run seed
```

### 4. Start the Application

```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:watch
```

### Run Specific Test Files
```bash
npm test -- contracts.test.ts
```

## 📚 API Documentation

### Authentication
All endpoints require authentication via the `profile_id` header:
```
profile_id: 1
```

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
Returns service health status.

#### 2. Contracts

**Get All Active Contracts**
```http
GET /contracts
Headers: profile_id: 1
```

**Get Specific Contract**
```http
GET /contracts/:id
Headers: profile_id: 1
```

**Get Contract Statistics**
```http
GET /contracts/stats
Headers: profile_id: 1
```

#### 3. Jobs

**Get Unpaid Jobs**
```http
GET /jobs/unpaid
Headers: profile_id: 1
```

**Pay for a Job**
```http
POST /jobs/:job_id/pay
Headers: profile_id: 1
```

**Get Job Statistics**
```http
GET /jobs/stats
Headers: profile_id: 1
```

#### 4. Balances

**Get Balance Information**
```http
GET /balances/:userId
Headers: profile_id: 1
```

**Deposit Money**
```http
POST /balances/deposit/:userId
Headers: profile_id: 1
Content-Type: application/json

{
  "amount": 100
}
```

#### 5. Admin Analytics

**Get Best Profession**
```http
GET /admin/best-profession?start=2023-01-01&end=2023-12-31
Headers: profile_id: 1
```

**Get Best Clients**
```http
GET /admin/best-clients?start=2023-01-01&end=2023-12-31&limit=2
Headers: profile_id: 1
```

**Get Comprehensive Analytics**
```http
GET /admin/analytics?start=2023-01-01&end=2023-12-31
Headers: profile_id: 1
```

## 🗄️ Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  profession VARCHAR(200),
  balance DECIMAL(10,2) DEFAULT 0,
  type ENUM('client', 'contractor') NOT NULL,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Contracts Table
```sql
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  terms TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'terminated') DEFAULT 'new',
  ClientId INTEGER REFERENCES profiles(id),
  ContractorId INTEGER REFERENCES profiles(id),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paymentDate DATETIME,
  ContractId INTEGER REFERENCES contracts(id),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## 🔧 Development

### Project Structure
```
src/
├── config/          # Configuration management
├── container/       # IoC container and DI setup
├── controllers/     # Request handlers
├── database/        # Database connection and seeding
├── middleware/      # Express middleware
├── models/          # Sequelize models
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── __tests__/       # Test files
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

### Code Quality

**Linting**
```bash
npm run lint
npm run lint:fix
```

**Type Checking**
```bash
npm run type-check
```

**Formatting**
```bash
npm run prettier
```

### Adding New Features

1. **Create Model**: Add Sequelize model in `src/models/`
2. **Create Service**: Add business logic in `src/services/` with IoC/DI
3. **Create Controller**: Add request handling in `src/controllers/`
4. **Create Routes**: Add route definitions in `src/routes/`
5. **Register in Container**: Add to IoC container in `src/container/`
6. **Add Tests**: Create test files in `src/__tests__/`
7. **Update Types**: Add TypeScript interfaces in `src/types/`

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Request validation
- **SQL Injection Protection**: Sequelize ORM
- **Authentication**: Profile-based auth
- **Authorization**: Role-based access control

## 📊 Monitoring & Logging

- **Winston**: Structured logging
- **Daily Rotation**: Log file management
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Centralized error handling
- **Performance**: Request timing

## 🚀 Deployment

### Docker
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `JWT_SECRET`
- [ ] Set up proper database (PostgreSQL/MySQL)
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Configure SSL/TLS
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using industry best practices for production-ready Node.js applications.**
