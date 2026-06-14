const express = require('express');
const { login, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/verify', protect, verifyToken);

module.exports = router;
