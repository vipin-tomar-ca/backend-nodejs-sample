# 🎓 LEARNER'S GUIDE - Express-Sqlize-Template-Distributed

Welcome to the Express-Sqlize-Template-Distributed project! This guide is designed for beginners who want to understand and work with this distributed architecture template.

## 📚 Table of Contents

1. [What is this project?](#what-is-this-project)
2. [Project Structure Overview](#project-structure-overview)
3. [Getting Started](#getting-started)
4. [Understanding the Architecture](#understanding-the-architecture)
5. [Step-by-Step Usage](#step-by-step-usage)
6. [Common Commands](#common-commands)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Learning Path](#learning-path)

## 🤔 What is this project?

This is a **template** (a starting point) for building web applications that can handle many users and scale across multiple servers. Think of it like a blueprint for a modern, robust web application.

### Key Concepts for Beginners:

- **Express.js**: A web framework for Node.js (like a toolkit for building web applications)
- **Sequelize**: A tool that helps us work with databases easily
- **Distributed**: Means the application can run on multiple computers/servers
- **Microservice**: Breaking a big application into smaller, manageable pieces
- **Template**: A pre-built foundation that you can customize for your needs

## 📁 Project Structure Overview

Let's explore the folder structure step by step:

```
express-sqlize-template-distributed/
├── 📁 src/                          # Main source code
│   ├── 📁 config/                   # Configuration files
│   ├── 📁 container/                # Dependency injection setup
│   ├── 📁 controllers/              # Request handlers (like traffic controllers)
│   ├── 📁 database/                 # Database connection setup
│   ├── 📁 middleware/               # Request processing functions
│   ├── 📁 models/                   # Database table definitions
│   ├── 📁 routes/                   # URL path definitions
│   ├── 📁 services/                 # Business logic (the brain of the app)
│   ├── 📁 types/                    # TypeScript type definitions
│   ├── 📁 utils/                    # Helper functions
│   └── 📁 __tests__/                # Test files
├── 📄 package.json                  # Project dependencies and scripts
├── 📄 docker-compose.yml            # Docker setup for local development
├── 📄 Dockerfile                    # Instructions for building the app
├── 📄 env.example                   # Example environment variables
└── 📄 README.md                     # Project documentation
```

### What Each Folder Does:

#### 🎯 **src/config/** - Settings and Configuration
- Contains all the settings for your application
- Database connection settings
- Redis (cache) settings
- Environment-specific configurations

#### 🎯 **src/container/** - Dependency Injection
- Think of this as a "service manager"
- Helps organize and connect different parts of your application
- Makes testing easier

#### 🎯 **src/controllers/** - Request Handlers
- These are like "receptionists" for your application
- They receive requests from users and decide what to do with them
- Example: When someone wants to create a user, the controller handles that request

#### 🎯 **src/database/** - Database Connection
- Sets up the connection to your database
- Handles database initialization

#### 🎯 **src/middleware/** - Request Processing
- Functions that process requests before they reach your main logic
- Examples: Authentication, logging, error handling

#### 🎯 **src/models/** - Database Structure
- Defines what your data looks like
- Example: A "User" model defines what information a user has (name, email, etc.)

#### 🎯 **src/routes/** - URL Paths
- Defines the URLs (web addresses) that your application responds to
- Example: `/api/users` might show all users

#### 🎯 **src/services/** - Business Logic
- Contains the main logic of your application
- Examples: UserService handles all user-related operations

#### 🎯 **src/utils/** - Helper Functions
- Reusable functions that help with common tasks
- Examples: encryption, data formatting, health checks

## 🚀 Getting Started

### Prerequisites (What you need installed):

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - This is the JavaScript runtime environment

2. **Git** (for version control)
   - Download from: https://git-scm.com/

3. **Docker** (optional, for containerized development)
   - Download from: https://www.docker.com/

### Step 1: Clone and Setup

```bash
# 1. Navigate to where you want to store the project
cd /path/to/your/projects

# 2. Clone the project (if using Git)
git clone <repository-url>
cd express-sqlize-template-distributed

# 3. Install dependencies
npm install
```

### Step 2: Environment Setup

```bash
# 1. Copy the example environment file
cp env.example .env

# 2. Edit the .env file with your settings
# You can use any text editor like VS Code, Notepad++, etc.
```

### Step 3: Basic Configuration

Open the `.env` file and update these basic settings:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (for beginners, use SQLite)
DB_DIALECT=sqlite
DB_NAME=template_db

# JWT Configuration (change this to something secure)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis Configuration (optional for beginners)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

## 🏗️ Understanding the Architecture

### The Flow of a Request:

```
User Request → Routes → Middleware → Controller → Service → Database
                ↓
            Response ← Controller ← Service ← Database
```

### 1. **Routes** (src/routes/)
Routes define the URLs your application responds to.

**Example from `src/routes/users.ts`:**
```typescript
// When someone visits GET /api/v1/users
router.get('/', userController.getUsers.bind(userController));

// When someone visits POST /api/v1/users
router.post('/', userController.createUser.bind(userController));
```

### 2. **Controllers** (src/controllers/)
Controllers handle the requests and responses.

**Example from `src/controllers/UserController.ts`:**
```typescript
// This function runs when someone visits GET /api/v1/users
public async getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await this.userService.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### 3. **Services** (src/services/)
Services contain the business logic.

**Example from `src/services/UserService.ts`:**
```typescript
// This function finds all users in the database
public async findAll(): Promise<IUser[]> {
  return await User.findAll();
}
```

### 4. **Models** (src/models/)
Models define the database structure.

**Example from `src/models/User.ts`:**
```typescript
// This defines what a User looks like in the database
export class User extends Model {
  public id!: number;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  // ... more fields
}
```

## 📝 Step-by-Step Usage

### Step 1: Start the Development Server

```bash
# Start the development server with auto-reload
npm run dev
```

You should see output like:
```
🚀 Server is running on port 3000
📊 Health check: http://localhost:3000/health
🔧 API test: http://localhost:3000/api/test
🌍 Environment: development
⏰ Started at: 2025-08-17T21:17:42.038Z
```

### Step 2: Test the Basic Endpoints

Open your web browser or use a tool like Postman/curl:

```bash
# Test health check
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api/test
```

### Step 3: Explore the API

The application provides several endpoints to explore:

#### Health and Status Endpoints:
```bash
# Basic health check
curl http://localhost:3000/health

# Comprehensive health check
curl http://localhost:3000/distributed/health

# Service information
curl http://localhost:3000/distributed/info
```

#### User Management Endpoints:
```bash
# Get all users (will be empty initially)
curl http://localhost:3000/api/v1/users

# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }'
```

### Step 4: Understanding the Response

When you make a request, you'll get responses like this:

**Successful Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "createdAt": "2025-08-17T21:17:42.038Z",
      "updatedAt": "2025-08-17T21:17:42.038Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User with this email already exists",
  "timestamp": "2025-08-17T21:17:42.038Z"
}
```

## 🛠️ Common Commands

### Development Commands:

```bash
# Start development server (auto-reload on changes)
npm run dev

# Build the project for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch
```

### Database Commands:

```bash
# Create database tables
npm run db:migrate

# Add sample data
npm run db:seed

# Reset database (delete all data and recreate)
npm run db:reset
```

### Code Quality Commands:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
```

### Docker Commands (if using Docker):

```bash
# Start all services (app, database, redis)
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Rebuild containers
docker-compose up --build
```

## 🔄 Development Workflow

### 1. **Making Changes to the Code**

When you want to add new features or fix bugs:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Make your changes** in the appropriate files:
   - Add new routes in `src/routes/`
   - Add new controllers in `src/controllers/`
   - Add new services in `src/services/`
   - Add new models in `src/models/`

3. **The server will automatically restart** when you save changes

4. **Test your changes** by making requests to your endpoints

### 2. **Adding a New Feature - Example**

Let's say you want to add a "Product" feature:

#### Step 1: Create the Model
Create `src/models/Product.ts`:
```typescript
import { Model, DataTypes, Sequelize } from 'sequelize';

export interface IProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Model<IProduct> implements IProduct {
  public id!: number;
  public name!: string;
  public price!: number;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initProductModel = (sequelize: Sequelize): void => {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'products',
      timestamps: true,
    }
  );
};
```

#### Step 2: Create the Service
Create `src/services/ProductService.ts`:
```typescript
import { injectable, inject } from '../container/ioc';
import { Product, IProduct } from '../models/Product';
import { LoggerService } from './LoggerService';

@injectable()
export class ProductService {
  private logger: LoggerService;

  constructor(@inject('LoggerService') logger: LoggerService) {
    this.logger = logger;
  }

  public async findAll(): Promise<IProduct[]> {
    return await Product.findAll();
  }

  public async create(data: Partial<IProduct>): Promise<IProduct> {
    return await Product.create(data as any);
  }
}
```

#### Step 3: Create the Controller
Create `src/controllers/ProductController.ts`:
```typescript
import { Request, Response } from 'express';
import { injectable, inject } from '../container/ioc';
import { ProductService } from '../services/ProductService';

@injectable()
export class ProductController {
  private productService: ProductService;

  constructor(@inject('ProductService') productService: ProductService) {
    this.productService = productService;
  }

  public async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.findAll();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

#### Step 4: Create the Routes
Create `src/routes/products.ts`:
```typescript
import { Router } from 'express';
import { container } from '../container';
import { ProductController } from '../controllers/ProductController';

const router = Router();
const productController = container.get<ProductController>('ProductController');

router.get('/', productController.getProducts.bind(productController));
router.post('/', productController.createProduct.bind(productController));

export default router;
```

#### Step 5: Register Everything
Update `src/container/index.ts`:
```typescript
// Add service binding
container.bind('ProductService').to(ProductService).inSingletonScope();

// Add controller binding
container.bind('ProductController').to(ProductController).inTransientScope();
```

Update `src/routes/index.ts`:
```typescript
import productRoutes from './products';

// Add route
router.use(`${API_VERSION}/products`, productRoutes);
```

Update `src/models/index.ts`:
```typescript
import { Product, initProductModel } from './Product';

// Initialize model
initProductModel(sequelize);
```

#### Step 6: Test Your New Feature
```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Create a product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "price": 29.99,
    "description": "This is a sample product"
  }'
```

### 3. **Testing Your Changes**

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --testNamePattern="Product"

# Run tests in watch mode
npm run test:watch
```

## 🐛 Troubleshooting

### Common Issues and Solutions:

#### 1. **"Cannot find module" errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. **Port already in use**
```bash
# Solution: Change the port in .env file
PORT=3001

# Or kill the process using the port
lsof -ti:3000 | xargs kill -9
```

#### 3. **Database connection errors**
```bash
# Solution: Check your .env file database settings
# For SQLite (easiest for beginners):
DB_DIALECT=sqlite
DB_NAME=template_db
```

#### 4. **TypeScript compilation errors**
```bash
# Solution: Check for type errors
npm run build

# Fix common issues:
# - Add missing imports
# - Fix type annotations
# - Add missing properties
```

#### 5. **Redis connection errors**
```bash
# Solution: Either install Redis or disable Redis features
# Option 1: Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Option 2: Disable Redis in .env
# Comment out REDIS_HOST and related settings
```

### Debug Mode:

```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug categories
DEBUG=express:* npm run dev
DEBUG=sequelize:* npm run dev
```

### Getting Help:

1. **Check the logs** - Look at the console output for error messages
2. **Check the documentation** - Read the README.md and other docs
3. **Search the code** - Look for similar patterns in existing code
4. **Use the health endpoints** - Check `/health` and `/distributed/health`

## 📚 Learning Path

### For Complete Beginners:

1. **Week 1: Basics**
   - Learn about Node.js and Express.js
   - Understand HTTP requests and responses
   - Practice with the basic endpoints

2. **Week 2: Database**
   - Learn about databases and SQL
   - Understand Sequelize ORM
   - Practice creating and querying data

3. **Week 3: Architecture**
   - Understand MVC pattern (Model-View-Controller)
   - Learn about services and business logic
   - Practice adding new features

4. **Week 4: Advanced Features**
   - Learn about authentication and authorization
   - Understand middleware and request processing
   - Practice with distributed features

### Recommended Learning Resources:

1. **Node.js and Express.js:**
   - [Node.js Official Documentation](https://nodejs.org/docs/)
   - [Express.js Guide](https://expressjs.com/en/guide/routing.html)

2. **Databases:**
   - [SQLite Tutorial](https://www.sqlitetutorial.net/)
   - [Sequelize Documentation](https://sequelize.org/docs/v6/)

3. **TypeScript:**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)

4. **Docker:**
   - [Docker Getting Started](https://docs.docker.com/get-started/)

### Practice Exercises:

1. **Exercise 1: Add a Blog Post Feature**
   - Create a BlogPost model with title, content, author
   - Add CRUD operations (Create, Read, Update, Delete)
   - Add validation for required fields

2. **Exercise 2: Add Authentication**
   - Implement user login/logout
   - Add protected routes
   - Add role-based access control

3. **Exercise 3: Add File Upload**
   - Create an endpoint to upload images
   - Store file metadata in database
   - Serve uploaded files

4. **Exercise 4: Add Search and Filtering**
   - Add search functionality to existing endpoints
   - Implement pagination
   - Add sorting options

## 🎯 Key Takeaways

### What You've Learned:

1. **Project Structure** - How to organize a large application
2. **API Development** - How to create RESTful APIs
3. **Database Integration** - How to work with databases
4. **Error Handling** - How to handle errors gracefully
5. **Testing** - How to write and run tests
6. **Deployment** - How to deploy applications

### Best Practices:

1. **Always validate input** - Check data before processing
2. **Handle errors gracefully** - Don't let errors crash your app
3. **Write tests** - Test your code to ensure it works
4. **Use meaningful names** - Name variables and functions clearly
5. **Document your code** - Add comments and documentation
6. **Follow conventions** - Use consistent coding style

### Next Steps:

1. **Build your own project** - Use this template as a starting point
2. **Learn more advanced topics** - Study microservices, cloud deployment
3. **Contribute to open source** - Help improve this template
4. **Share your knowledge** - Teach others what you've learned

## 🤝 Getting Help

If you get stuck or have questions:

1. **Check the documentation** - This guide and other docs in the project
2. **Look at the code** - Study how existing features are implemented
3. **Use the health endpoints** - Check if your application is running correctly
4. **Search online** - Look for solutions to specific error messages
5. **Ask the community** - Join forums or communities for help

Remember: **Every expert was once a beginner!** Don't be afraid to make mistakes and learn from them.

---

**Happy Coding! 🚀**

This template is designed to help you learn and build amazing applications. Take your time, experiment, and don't hesitate to ask questions!
