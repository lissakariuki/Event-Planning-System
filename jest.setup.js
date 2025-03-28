// jest.setup.js
jest.mock('@clerk/clerk-sdk-node', () => ({
    ClerkExpressRequireAuth: jest.fn()
  }));