// routes/authRoutes.js
// Authentication routes definition

const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 */
router.post('/register', registerUser);

module.exports = router;
