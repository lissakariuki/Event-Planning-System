module.exports = {
    ClerkExpressRequireAuth: jest.fn(() => (req, res, next) => {
      // Default mock behavior: allow all requests
      next();
    }),
    
    // Add other Clerk exports if needed
    Clerk: jest.fn(),
    withAuth: jest.fn()
  };