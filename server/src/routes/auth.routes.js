const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);

// Protected Routes
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
