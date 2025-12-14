const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');

// Mount routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Conevent API'
  });
});

module.exports = router;
