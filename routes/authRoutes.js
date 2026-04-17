/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  changePassword,
  deleteAccount,
  getUserStats
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas, userActivityLogger } = require('../middleware/inputValidation');

// Public routes with validation
router.post('/register', 
  validate(schemas.register, 'body'),
  userActivityLogger('user_register'),
  register
);

router.post('/login', 
  validate(schemas.login, 'body'),
  userActivityLogger('user_login'),
  login
);

// Protected routes
router.use(protect); // Apply protect middleware to all subsequent routes

router.get('/me', 
  userActivityLogger('profile_view'),
  getProfile
);

router.put('/me', 
  validate(schemas.updateProfile, 'body'),
  userActivityLogger('profile_update'),
  updateProfile
);

router.post('/logout', 
  userActivityLogger('user_logout'),
  logout
);

router.put('/password', 
  validate(schemas.changePassword, 'body'),
  userActivityLogger('password_change'),
  changePassword
);

router.delete('/me', 
  userActivityLogger('account_delete'),
  deleteAccount
);

// Admin only routes
router.get('/stats', 
  authorize('admin'),
  userActivityLogger('admin_stats_view'),
  getUserStats
);

module.exports = router;
