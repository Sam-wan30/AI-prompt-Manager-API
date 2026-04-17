/**
 * Analytics Routes - Production-level analytics endpoints
 * Provides comprehensive analytics for the prompt management system
 */

const express = require('express');
const router = express.Router();
const { getPromptAnalytics, getTimeRangeAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get comprehensive prompt analytics
// @route   GET /api/analytics/prompts
// @access  Private
router.get('/prompts', protect, getPromptAnalytics);

// @desc    Get analytics for specific time range
// @route   GET /api/analytics/prompts/timerange
// @access  Private
// Query params: timeRange (all, day, week, month)
router.get('/prompts/timerange', protect, getTimeRangeAnalytics);

// @desc    Get user analytics (admin only)
// @route   GET /api/analytics/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), getUserAnalytics);

// @desc    Get analytics overview (simplified version)
// @route   GET /api/analytics/overview
// @access  Private
router.get('/overview', protect, getPromptAnalytics);

module.exports = router;
