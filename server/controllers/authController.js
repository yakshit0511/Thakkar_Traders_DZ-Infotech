const jwt = require('jsonwebtoken');
const { safeCompare } = require('../utils/helpers');

const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    const adminUsername = (process.env.ADMIN_USERNAME || '').trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    // Trim input too — prevents copy-paste whitespace issues
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const usernameMatch = safeCompare(trimmedUsername, adminUsername);
    const passwordMatch = safeCompare(trimmedPassword, adminPassword);

    if (!usernameMatch || !passwordMatch) {
      console.log(`[AUTH] Login failed — username match: ${usernameMatch}, password match: ${passwordMatch}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(username);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
  });
};

module.exports = { login, verifyToken };
