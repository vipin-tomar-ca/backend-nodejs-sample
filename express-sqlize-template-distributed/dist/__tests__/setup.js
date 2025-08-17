"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_NAME = ':memory:';
process.env.JWT_SECRET = 'test-secret-key';
beforeAll(async () => {
    console.log('Setting up test environment...');
});
afterAll(async () => {
    console.log('Cleaning up test environment...');
});
beforeEach(() => {
});
//# sourceMappingURL=setup.js.map