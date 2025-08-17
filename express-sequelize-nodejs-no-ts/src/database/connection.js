const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database (create tables)
const syncDatabase = async (force = false) => {
  try {
    // Import and initialize models before syncing
    const { initializeModels } = require('../models');
    initializeModels(sequelize);
    
    await sequelize.sync({ force });
    console.log(`Database synced successfully (force: ${force})`);
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

// Close database connection
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeDatabase,
};
