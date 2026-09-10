// controllers/authController.js
// Registration Controller for RepairMithra Project

const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Helper function to validate email format using regular expression
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate phone number (expects 10-15 digits, allowing optional + or spaces/dashes)
 */
const isValidPhone = (phone) => {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
  return phoneRegex.test(trimmed) && trimmed.replace(/\D/g, '').length >= 7;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Validation: Required fields check
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required and cannot be empty.',
      });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Email is required and cannot be empty.',
      });
    }

    // Email format validation
    const sanitizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required and cannot be empty.',
      });
    }

    // Phone format validation
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    // Password length check (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // 2. Check if user with given email already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered. Please use another email or log in.',
      });
    }

    // 3. Hash password using bcryptjs before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create and save new user record in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: sanitizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
    });

    // 5. Return success response (201 Created) without exposing the password
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error('[authController] Registration error:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
};
