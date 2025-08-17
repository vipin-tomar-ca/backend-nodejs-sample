# Express.js + Sequelize Template (JavaScript)

A comprehensive, production-ready Express.js template with Sequelize ORM, built in JavaScript (Node.js).

## Features

- **Express.js** - Fast, unopinionated web framework
- **Sequelize ORM** - Promise-based ORM for Node.js
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Express-validator for request validation
- **Rate Limiting** - Protection against abuse
- **Security Middleware** - Helmet.js for security headers
- **Structured Logging** - Winston.js with daily rotation
- **Error Handling** - Comprehensive error handling middleware
- **CORS Support** - Cross-origin resource sharing
- **Compression** - Response compression
- **Testing Setup** - Jest testing framework
- **Code Quality** - ESLint and Prettier configuration

## Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── AuthController.js    # Authentication controller
│   └── UserController.js    # User management controller
├── database/
│   └── connection.js        # Database connection setup
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling middleware
│   ├── rateLimit.js        # Rate limiting middleware
│   └── validation.js       # Input validation middleware
├── models/
│   ├── User.js             # User model
│   └── index.js            # Models initialization
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   └── index.js            # Main routes
├── services/
│   ├── AuthService.js      # Authentication service
│   ├── UserService.js      # User management service
│   └── ValidationService.js # Input validation service
├── utils/
│   └── logger.js           # Winston logger setup
└── server.js               # Main application file
```

## Quick Start

### Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-sequelize-nodejs-no-ts
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:9700`

5. Test the API endpoints:
```bash
npm run test:api
```

## Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
PORT=9700
NODE_ENV=development

# Database Configuration
DB_DIALECT=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_NAME=template_db
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/logout` - Logout (authenticated)

### User Management
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users` - Get all users (authenticated)
- `GET /api/v1/users/:id` - Get user by ID (authenticated)
- `PUT /api/v1/users/:id` - Update user (admin only)
- `DELETE /api/v1/users/:id` - Delete user (admin only)
- `GET /api/v1/users/me` - Get current user profile (authenticated)
- `PUT /api/v1/users/me` - Update current user profile (authenticated)

### Health Check
- `GET /health` - Health check endpoint

## Database

The template uses SQLite by default for development. You can easily switch to other databases by updating the configuration in `src/config/database.js`.

### Supported Databases
- SQLite (default)
- MySQL
- PostgreSQL
- MariaDB
- Microsoft SQL Server

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Code Quality

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatting
```bash
npm run format
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:api` - Test API endpoints
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Request validation and sanitization
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **SQL Injection Protection** - Sequelize ORM protection

## Logging

The application uses Winston.js for structured logging with:
- Console output for development
- Daily rotating file logs
- Error tracking
- Request/response logging
- Performance monitoring

## Error Handling

Comprehensive error handling for:
- Validation errors
- Database errors
- Authentication errors
- JWT errors
- General application errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.
