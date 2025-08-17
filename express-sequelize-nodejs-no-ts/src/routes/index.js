const express = require('express');
const userRoutes = require('./users');
const authRoutes = require('./auth');

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

// Root endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Express.js + Sequelize Template API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api/v1',
      health: '/health'
    },
    documentation: 'Check the README.md file for API documentation'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API root endpoint
router.get(API_VERSION, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Express.js + Sequelize API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      health: '/health'
    },
    documentation: 'Check the README.md file for API documentation'
  });
});

// API routes
router.use(`${API_VERSION}/users`, userRoutes.router);
router.use(`${API_VERSION}/auth`, authRoutes.router);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date(),
  });
});

// Function to initialize controllers
const initializeControllers = (UserModel) => {
  userRoutes.setController(UserModel);
  authRoutes.setController(UserModel);
};

module.exports = { router, initializeControllers };
