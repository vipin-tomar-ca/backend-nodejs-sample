# 🎓 Express.js + Sequelize Template - Complete Beginner's Guide

Welcome to the Express.js + Sequelize template! This guide will walk you through every aspect of this project, explaining what each part does and how everything works together. No prior experience required!

## 📚 Table of Contents

1. [What is this project?](#what-is-this-project)
2. [Project Structure Overview](#project-structure-overview)
3. [Getting Started](#getting-started)
4. [Understanding the Code](#understanding-the-code)
5. [How Everything Works Together](#how-everything-works-together)
6. [Common Tasks & How to Do Them](#common-tasks--how-to-do-them)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## 🎯 What is this project?

This is a **web application template** built with:
- **Express.js**: A web framework for Node.js (like a skeleton for your website)
- **Sequelize**: A tool to work with databases easily (like a translator between your code and database)
- **JavaScript**: The programming language everything is written in

Think of it as a **pre-built foundation** for creating web applications. It's like having a house with the foundation, walls, and basic rooms already built - you just need to add your furniture!

### What can you build with this?
- User registration and login systems
- APIs (ways for other applications to talk to your app)
- Web services
- Backend for mobile apps
- Any web application that needs user accounts

---

## 📁 Project Structure Overview

Let's explore what's in each folder and why it's there:

```
express-sequelize-nodejs-no-ts/
├── 📁 src/                          # Main source code folder
│   ├── 📁 config/                   # Configuration files
│   ├── 📁 controllers/              # Request handlers (like receptionists)
│   ├── 📁 database/                 # Database connection and setup
│   ├── 📁 middleware/               # Security and processing layers
│   ├── 📁 models/                   # Database table definitions
│   ├── 📁 routes/                   # URL paths and their handlers
│   ├── 📁 services/                 # Business logic (the "brain")
│   ├── 📁 utils/                    # Helper tools and utilities
│   └── 📁 __tests__/                # Test files
├── 📄 package.json                  # Project settings and dependencies
├── 📄 .env                          # Environment variables (secrets)
├── 📄 README.md                     # Project documentation
└── 📄 LEARNER.md                    # This file!
```

### 🎯 Why this structure?

This structure follows the **MVC (Model-View-Controller)** pattern, which is like organizing a restaurant:

- **Models** (📁 models/): Like the kitchen recipes - define what data looks like
- **Controllers** (📁 controllers/): Like waiters - handle customer requests
- **Services** (📁 services/): Like the kitchen staff - do the actual work
- **Routes** (📁 routes/): Like the menu - define what customers can order

---

## 🚀 Getting Started

### Step 1: Understanding What You Need

Before you start, you need these tools installed on your computer:
- **Node.js**: The engine that runs JavaScript (like installing a car engine)
- **npm**: Package manager (like an app store for code libraries)

### Step 2: Setting Up the Project

1. **Open your terminal/command prompt**
2. **Navigate to the project folder**:
   ```bash
   cd express-sequelize-nodejs-no-ts
   ```

3. **Install dependencies** (this downloads all the code libraries you need):
   ```bash
   npm install
   ```
   This is like going to the store and buying all the ingredients you need for cooking.

4. **Copy the environment file**:
   ```bash
   cp env.example .env
   ```
   This creates a file with your project's settings (like copying a recipe).

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   This starts your application (like turning on the stove).

### Step 3: Verify Everything Works

After starting the server, you should see messages like:
```
Server is running on port 9700
Database connection established successfully
```

Now you can visit `http://localhost:9700` in your web browser to see your application!

---

## 🔍 Understanding the Code

Let's break down each part and understand what it does:

### 1. 📁 config/ - Configuration Files

**What it is**: Settings for your application (like the settings menu on your phone)

**What's inside**:
- `database.js`: Database connection settings
- `index.js`: General application settings

**Why it matters**: This tells your app how to connect to the database and what settings to use.

### 2. 📁 models/ - Database Table Definitions

**What it is**: Blueprints for your data (like defining what a "user" looks like)

**Example - User Model** (`src/models/User.js`):
```javascript
const User = (sequelize) => {
  const UserModel = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // ... more fields
  });
};
```

**What this means**:
- `email`: A text field that must be filled and must be unique
- `firstName`: A text field that must be filled
- This creates a table in your database with these columns

### 3. 📁 services/ - Business Logic

**What it is**: The "brain" of your application (like the kitchen staff that actually cooks)

**Example - UserService** (`src/services/UserService.js`):
```javascript
class UserService {
  async createUser(userData) {
    // Validate the data
    // Create the user in database
    // Return the result
  }
  
  async findUserById(id) {
    // Find user in database
    // Return user data
  }
}
```

**What this means**: These are the functions that actually do the work - creating users, finding users, updating users, etc.

### 4. 📁 controllers/ - Request Handlers

**What it is**: The "receptionists" that handle incoming requests (like waiters taking orders)

**Example - UserController** (`src/controllers/UserController.js`):
```javascript
class UserController {
  async createUser(req, res) {
    try {
      // Get data from request
      const userData = req.body;
      
      // Use service to create user
      const user = await this.userService.createUser(userData);
      
      // Send response back
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      // Handle errors
    }
  }
}
```

**What this means**:
- `req.body`: The data sent by the user (like order details)
- `res.json()`: The response sent back to the user (like the cooked meal)
- This function handles when someone wants to create a new user

### 5. 📁 routes/ - URL Paths

**What it is**: The "menu" that defines what URLs your app responds to

**Example** (`src/routes/index.js`):
```javascript
// When someone visits /api/v1/users with POST method
router.post('/users', userController.createUser.bind(userController));

// When someone visits /api/v1/users/:id with GET method
router.get('/users/:id', userController.getUserById.bind(userController));
```

**What this means**:
- `POST /api/v1/users`: Create a new user
- `GET /api/v1/users/:id`: Get a specific user by ID
- These are like menu items - each URL does a specific thing

### 6. 📁 middleware/ - Processing Layers

**What it is**: Security guards and processors that check requests before they reach your main code

**Examples**:
- **Authentication** (`auth.js`): Checks if user is logged in
- **Error Handler** (`errorHandler.js`): Catches and handles errors gracefully
- **Rate Limiting**: Prevents too many requests from one user

### 7. 📁 database/ - Database Connection

**What it is**: The connection between your app and the database (like the phone line to the kitchen)

**What it does**:
- Connects to the database
- Creates tables if they don't exist
- Handles database errors

---

## 🔄 How Everything Works Together

Let's trace through what happens when someone tries to create a new user:

### Step-by-Step Flow:

1. **User sends request**: `POST http://localhost:9700/api/v1/users`
   ```json
   {
     "email": "john@example.com",
     "firstName": "John",
     "lastName": "Doe",
     "password": "password123"
   }
   ```

2. **Server receives request** (`src/server.js`):
   - Express.js receives the HTTP request
   - Middleware processes it (validation, authentication, etc.)

3. **Route matches** (`src/routes/index.js`):
   ```javascript
   router.post('/users', userController.createUser.bind(userController));
   ```

4. **Controller handles request** (`src/controllers/UserController.js`):
   ```javascript
   async createUser(req, res) {
     const userData = req.body; // Gets the JSON data
     const user = await this.userService.createUser(userData);
     res.json({ success: true, data: user });
   }
   ```

5. **Service does the work** (`src/services/UserService.js`):
   ```javascript
   async createUser(userData) {
     // Validates the data
     // Hashes the password
     // Saves to database using the User model
   }
   ```

6. **Model saves to database** (`src/models/User.js`):
   ```javascript
   const user = await User.create(userData);
   ```

7. **Response sent back**:
   ```json
   {
     "success": true,
     "data": {
       "id": 1,
       "email": "john@example.com",
       "firstName": "John",
       "lastName": "Doe"
     }
   }
   ```

### 🎯 Think of it like a Restaurant:

1. **Customer** (User) places an order (sends request)
2. **Host** (Route) directs them to the right waiter
3. **Waiter** (Controller) takes the order and sends it to kitchen
4. **Kitchen Staff** (Service) prepares the food (processes data)
5. **Recipe** (Model) defines how to make the dish (database structure)
6. **Kitchen** (Database) stores ingredients and cooks food
7. **Waiter** brings the food back to customer (sends response)

---

## 🛠️ Common Tasks & How to Do Them

### 1. Adding a New User Field

**What you want to do**: Add a "phone number" field to users

**Steps**:

1. **Update the Model** (`src/models/User.js`):
   ```javascript
   phoneNumber: {
     type: DataTypes.STRING(20),
     allowNull: true, // Optional field
     validate: {
       is: /^[\+]?[1-9][\d]{0,15}$/ // Phone number format
     }
   }
   ```

2. **Update the Service** (`src/services/UserService.js`):
   ```javascript
   // Add phone number to validation
   const { error } = userValidationSchema.validate(userData);
   ```

3. **Update the Controller** (if needed):
   - Usually no changes needed - it automatically handles new fields

4. **Restart the server**:
   ```bash
   npm run dev
   ```

### 2. Creating a New API Endpoint

**What you want to do**: Add an endpoint to get all users

**Steps**:

1. **Add method to Service** (`src/services/UserService.js`):
   ```javascript
   async getAllUsers() {
     return await this.User.findAll({
       attributes: ['id', 'email', 'firstName', 'lastName', 'role']
     });
   }
   ```

2. **Add method to Controller** (`src/controllers/UserController.js`):
   ```javascript
   async getAllUsers(req, res) {
     try {
       const users = await this.userService.getAllUsers();
       res.json({
         success: true,
         data: users,
         message: 'Users retrieved successfully'
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: error.message
       });
     }
   }
   ```

3. **Add route** (`src/routes/index.js`):
   ```javascript
   router.get('/users', userController.getAllUsers.bind(userController));
   ```

4. **Test it**:
   ```bash
   curl http://localhost:9700/api/v1/users
   ```

### 3. Adding Authentication to an Endpoint

**What you want to do**: Make an endpoint require login

**Steps**:

1. **Import the auth middleware**:
   ```javascript
   const { authenticateToken } = require('../middleware/auth');
   ```

2. **Add it to the route**:
   ```javascript
   router.get('/protected-endpoint', authenticateToken, controller.method);
   ```

3. **Now users need to include a token**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:9700/api/v1/protected-endpoint
   ```

### 4. Adding Input Validation

**What you want to do**: Validate that email is required and valid

**Steps**:

1. **Update validation schema** (`src/services/ValidationService.js`):
   ```javascript
   const userValidationSchema = Joi.object({
     email: Joi.string().email().required(),
     firstName: Joi.string().min(1).max(100).required(),
     // ... other fields
   });
   ```

2. **Use it in your service**:
   ```javascript
   const { error } = userValidationSchema.validate(userData);
   if (error) {
     throw new Error(error.details[0].message);
   }
   ```

### 5. Running Tests

**To run all tests**:
```bash
npm test
```

**To run tests in watch mode** (reruns when files change):
```bash
npm run test:watch
```

**To run specific test file**:
```bash
npm test -- UserService.test.js
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### 1. "Port already in use" Error
**Problem**: `Error: listen EADDRINUSE: address already in use :::9700`

**Solution**:
```bash
# Find what's using the port
lsof -i :9700

# Kill the process
kill -9 PROCESS_ID

# Or use a different port in .env file
PORT=9701
```

#### 2. "Database connection failed" Error
**Problem**: Can't connect to database

**Solution**:
1. Check if `.env` file exists: `ls -la .env`
2. Verify database settings in `.env`:
   ```
   DB_DIALECT=sqlite
   DB_NAME=template_db
   ```
3. Make sure you're in the right directory

#### 3. "Module not found" Error
**Problem**: `Cannot find module 'express'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. "Validation failed" Error
**Problem**: API returns validation errors

**Solution**:
1. Check the request data format
2. Look at the validation rules in `ValidationService.js`
3. Make sure all required fields are provided

#### 5. "JWT token invalid" Error
**Problem**: Authentication fails

**Solution**:
1. Make sure you're including the token: `Authorization: Bearer YOUR_TOKEN`
2. Check if the token is expired
3. Verify the token was generated correctly

### Debugging Tips:

1. **Check server logs**: Look at the terminal where you ran `npm run dev`
2. **Use console.log**: Add `console.log('Debug:', data)` in your code
3. **Check database**: Look at the `database.sqlite` file
4. **Test endpoints**: Use tools like Postman or curl to test APIs

---

## 🎯 Next Steps

Now that you understand the basics, here are some things you can try:

### 1. Explore the Code
- Read through each file and understand what it does
- Try changing small things and see what happens
- Add console.log statements to see data flow

### 2. Build Something Simple
- Add a new field to the User model
- Create a new API endpoint
- Add validation for a new field

### 3. Learn More About:
- **Express.js**: [Express.js Official Guide](https://expressjs.com/)
- **Sequelize**: [Sequelize Documentation](https://sequelize.org/)
- **JWT**: [JWT.io](https://jwt.io/)
- **REST APIs**: [REST API Tutorial](https://restfulapi.net/)

### 4. Common Next Features to Add:
- Password reset functionality
- Email verification
- File upload
- Search functionality
- Pagination for lists
- User roles and permissions

### 5. Practice Projects:
- Todo list API
- Blog post system
- E-commerce product catalog
- Social media user profiles

---

## 📞 Getting Help

If you get stuck:

1. **Check the error messages** - they often tell you exactly what's wrong
2. **Look at the logs** - the server logs show what's happening
3. **Search online** - most errors have been solved before
4. **Ask questions** - don't be afraid to ask for help!

### Useful Resources:
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [JavaScript Tutorial](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🎉 Congratulations!

You've now learned how to:
- ✅ Understand the project structure
- ✅ Start and run the application
- ✅ Make changes to the code
- ✅ Add new features
- ✅ Debug common issues

You're ready to start building your own web applications! Remember, programming is like learning to cook - start with simple recipes, practice a lot, and gradually try more complex dishes.

Happy coding! 🚀
