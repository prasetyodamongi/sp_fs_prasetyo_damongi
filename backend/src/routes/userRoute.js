const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/me', authenticateToken, authController.getProfile);
router.get('/search', authController.searchUsers);
router.get('/:id', authController.getUserById);

module.exports = router;