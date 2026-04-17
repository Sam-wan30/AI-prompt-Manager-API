/**
 * AI Routes - OpenAI API Integration
 * Handles AI-powered prompt generation and improvement endpoints
 */

const express = require('express');
const router = express.Router();
const {
  generateAIPrompt,
  improveAIPrompt,
  generatePromptVariations,
  analyzePrompt,
  getAIStatus,
  getAIAnalytics
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, schemas, userActivityLogger } = require('../middleware/inputValidation');

// Apply authentication middleware to all AI routes
router.use(protect);

// @desc    Generate AI prompt based on topic, category, and tone
// @route   POST /api/ai/generate
// @access  Private
router.post('/generate', 
  validate(schemas.aiGenerate, 'body'),
  userActivityLogger('ai_generate'),
  generateAIPrompt
);

// @desc    Improve an existing prompt using AI
// @route   POST /api/ai/improve
// @access  Private
router.post('/improve', 
  validate(schemas.aiImprove, 'body'),
  userActivityLogger('ai_improve'),
  improveAIPrompt
);

// @desc    Generate multiple prompt variations
// @route   POST /api/ai/variations
// @access  Private
router.post('/variations', 
  validate(schemas.aiGenerate, 'body'), // Reuse aiGenerate schema
  userActivityLogger('ai_variations'),
  generatePromptVariations
);

// @desc    Analyze prompt quality and provide feedback
// @route   POST /api/ai/analyze
// @access  Private
router.post('/analyze', 
  validate(schemas.aiImprove, 'body'), // Reuse aiImprove schema
  userActivityLogger('ai_analyze'),
  analyzePrompt
);

// @desc    Get AI service status and usage statistics
// @route   GET /api/ai/status
// @access  Private
router.get('/status', 
  userActivityLogger('ai_status'),
  getAIStatus
);

// @desc    Get AI usage analytics (admin only)
// @route   GET /api/ai/analytics
// @access  Private (Admin only)
router.get('/analytics', 
  authorize('admin'),
  userActivityLogger('ai_analytics'),
  getAIAnalytics
);

module.exports = router;
