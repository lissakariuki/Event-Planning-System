const request = require('supertest');
const app = require('../app');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Mock Clerk middleware with conditional behavior
jest.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressRequireAuth: jest.fn(() => (req, res, next) => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Simulate valid user
    req.auth = { userId: 'user_123' };
    next();
  })
}));

describe('Clerk Authentication', () => {
  test('Blocks unauthenticated users from /dashboard', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('Allows authenticated users with valid session', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Access granted' });
  });
});