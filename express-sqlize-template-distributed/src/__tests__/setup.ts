// Test setup file
import { container } from '../container';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_NAME = ':memory:';
process.env.JWT_SECRET = 'test-secret-key';

// Global test setup
beforeAll(async () => {
  // Setup test database
  console.log('Setting up test environment...');
});

// Global test teardown
afterAll(async () => {
  // Cleanup test database
  console.log('Cleaning up test environment...');
});

// Reset container between tests
beforeEach(() => {
  // Reset any test-specific state
});
