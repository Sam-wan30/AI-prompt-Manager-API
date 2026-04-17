/**
 * Authentication Controller - Production-ready auth system
 * Handles user registration, login, and JWT token management
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');
const { config } = require('../config/config');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.security.jwtSecret, {
    expiresIn: config.security.jwtExpiresIn
  });
};

/**
 * Create and send token response
 */
const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const token = generateToken(user._id);
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.security.jwtExpiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.server.env === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json(
      successResponse(
        {
          token,
          user: user.profile
        },
        message
      )
    );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  logger.info('User registration attempt', { email, name });

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.warn('Registration failed - Email already exists', { email });
    return res.status(400).json(
      errorResponse('Email already registered', {
        type: 'DuplicateEmailError',
        field: 'email'
      })
    );
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password
  });

  logger.info('User registered successfully', { 
    userId: user._id, 
    email: user.email 
  });

  // Send token response
  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.info('User login attempt', { email });

  // Validate email & password
  if (!email || !password) {
    logger.warn('Login failed - Missing credentials', { email });
    return res.status(400).json(
      errorResponse('Please provide email and password', {
        type: 'MissingCredentialsError'
      })
    );
  }

  // Check for user with password
  const user = await User.findByEmailWithPassword(email);
  if (!user) {
    logger.warn('Login failed - User not found', { email });
    return res.status(401).json(
      errorResponse('Invalid credentials', {
        type: 'InvalidCredentialsError'
      })
    );
  }

  // Check if user is active
  if (!user.isActive) {
    logger.warn('Login failed - User inactive', { email, userId: user._id });
    return res.status(401).json(
      errorResponse('Account has been deactivated', {
        type: 'AccountDeactivatedError'
      })
    );
  }

  // Check if password matches (handle both hashed and plain text passwords)
  let isPasswordMatch = false;
  try {
    // Try bcrypt comparison first (for hashed passwords)
    isPasswordMatch = await user.comparePassword(password);
  } catch (error) {
    // If comparePassword fails, try direct string comparison (for plain text passwords)
    if (error.message.includes('comparePassword')) {
      isPasswordMatch = (user.password === password);
    } else {
      throw error;
    }
  }

  if (!isPasswordMatch) {
    logger.warn('Login failed - Invalid password', { email, userId: user._id });
    return res.status(401).json(
      errorResponse('Invalid credentials', {
        type: 'InvalidCredentialsError'
      })
    );
  }

  // Update last login
  await user.updateLastLogin();

  logger.info('User logged in successfully', { 
    userId: user._id, 
    email: user.email,
    loginCount: user.loginCount
  });

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  logger.info('User profile retrieved', { userId: user._id });

  res.json(
    successResponse(
      user.profile,
      'User profile retrieved successfully'
    )
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const userId = req.user.id;

  logger.info('User profile update attempt', { userId });

  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (preferences) updateFields.preferences = preferences;

  // Update user
  const user = await User.findByIdAndUpdate(
    userId,
    updateFields,
    { new: true, runValidators: true }
  );

  logger.info('User profile updated successfully', { userId });

  res.json(
    successResponse(
      user.profile,
      'Profile updated successfully'
    )
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  logger.info('User logout', { userId: req.user.id });

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json(
    successResponse(
      null,
      'Logout successful'
    )
  );
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  logger.info('Password change attempt', { userId });

  // Get user with password
  const user = await User.findByEmailWithPassword(req.user.email);
  if (!user) {
    return res.status(404).json(
      errorResponse('User not found', {
        type: 'UserNotFoundError'
      })
    );
  }

  // Check current password
  const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordMatch) {
    logger.warn('Password change failed - Invalid current password', { userId });
    return res.status(400).json(
      errorResponse('Current password is incorrect', {
        type: 'InvalidPasswordError'
      })
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('Password changed successfully', { userId });

  res.json(
    successResponse(
      null,
      'Password changed successfully'
    )
  );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/me
 * @access  Private
 */
const deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logger.info('User account deletion', { userId });

  await User.findByIdAndDelete(userId);

  // Clear cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json(
    successResponse(
      null,
      'Account deleted successfully'
    )
  );
});

/**
 * @desc    Get user statistics (admin only)
 * @route   GET /api/auth/stats
 * @access  Private (Admin)
 */
const getUserStats = asyncHandler(async (req, res) => {
  logger.info('Admin requesting user statistics', { userId: req.user.id });

  const stats = await User.getStats();
  const growthStats = await User.getGrowthStats(30);

  res.json(
    successResponse(
      {
        overview: stats,
        growth: growthStats
      },
      'User statistics retrieved successfully'
    )
  );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  logger.info('User profile requested', { userId: req.user.id });

  const user = await User.findById(req.user.id);
  
  if (!user) {
    logger.warn('User not found', { userId: req.user.id });
    return res.status(404).json(
      errorResponse('User not found')
    );
  }

  res.json(
    successResponse(
      user.profile,
      'Profile retrieved successfully'
    )
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  logger.info('User profile update attempt', { userId: req.user.id });

  const { name, email } = req.body;
  
  // Find user and update
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  );

  if (!user) {
    logger.warn('User not found for update', { userId: req.user.id });
    return res.status(404).json(
      errorResponse('User not found')
    );
  }

  logger.info('User profile updated successfully', { userId: req.user.id });

  res.json(
    successResponse(
      user.profile,
      'Profile updated successfully'
    )
  );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/me
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  logger.info('User account deletion attempt', { userId: req.user.id });

  const user = await User.findByIdAndDelete(req.user.id);

  if (!user) {
    logger.warn('User not found for deletion', { userId: req.user.id });
    return res.status(404).json(
      errorResponse('User not found')
    );
  }

  logger.info('User account deleted successfully', { userId: req.user.id });

  res.json(
    successResponse(
      null,
      'Account deleted successfully'
    )
  );
});

module.exports = {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
  updateMe,
  logout,
  changePassword,
  deleteAccount,
  deleteMe,
  getUserStats
};
