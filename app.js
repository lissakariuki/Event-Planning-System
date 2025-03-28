const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();

// Add middleware to parse JSON bodies
app.use(express.json());
// app.js
app.get('/dashboard', ClerkExpressRequireAuth(), (req, res) => {
    res.status(200).json({ message: 'Access granted' }); // Remove user field
  });

module.exports = app;