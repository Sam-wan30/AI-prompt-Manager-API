/**
 * AI Controller - OpenAI API Integration
 * Handles AI-powered prompt generation and improvement
 */

const {
  generatePrompt,
  improvePrompt,
  checkAPIAvailability,
  getUsageStats
} = require('../services/aiService');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Generate AI prompt based on topic, category, and tone
 * @route   POST /api/ai/generate
 * @access  Private
 */
const generateAIPrompt = asyncHandler(async (req, res) => {
  const { topic, category, tone = 'professional' } = req.body;

  // Validate input
  const validationErrors = [];
  
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    validationErrors.push({
      field: 'topic',
      message: 'Topic is required and must be a non-empty string'
    });
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    validationErrors.push({
      field: 'category',
      message: 'Category is required and must be a non-empty string'
    });
  }
  
  if (tone && (typeof tone !== 'string' || tone.trim().length === 0)) {
    validationErrors.push({
      field: 'tone',
      message: 'Tone must be a non-empty string if provided'
    });
  }

  if (validationErrors.length > 0) {
    return res.status(400).json(
      validationErrorResponse(validationErrors, 'Validation failed')
    );
  }

  // Check API availability
  const isAPIAvailable = await checkAPIAvailability();
  if (!isAPIAvailable) {
    return res.status(503).json(
      errorResponse('AI service is currently unavailable. Please try again later.', {
        type: 'ServiceUnavailableError'
      })
    );
  }

  logger.info('AI prompt generation request', {
    userId: req.user.id,
    topic,
    category,
    tone
  });

  try {
    const generatedPrompt = await generatePrompt(topic.trim(), category.trim(), tone.trim());

    res.json(
      successResponse(
        {
          prompt: generatedPrompt,
          metadata: {
            topic: topic.trim(),
            category: category.trim(),
            tone: tone.trim(),
            generatedAt: new Date().toISOString(),
            promptLength: generatedPrompt.length
          }
        },
        'AI prompt generated successfully'
      )
    );

  } catch (error) {
    logger.error('AI prompt generation failed', {
      error: error.message,
      userId: req.user.id,
      topic,
      category,
      tone
    });

    res.status(500).json(
      errorResponse('Failed to generate AI prompt', {
        type: 'AIGenerationError',
        details: error.message
      })
    );
  }
});

/**
 * @desc    Improve an existing prompt using AI
 * @route   POST /api/ai/improve
 * @access  Private
 */
const improveAIPrompt = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  // Validate input
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json(
      validationErrorResponse([{
        field: 'prompt',
        message: 'Prompt is required and must be a non-empty string'
      }], 'Validation failed')
    );
  }

  // Check if prompt is too long
  if (prompt.trim().length > 2000) {
    return res.status(400).json(
      validationErrorResponse([{
        field: 'prompt',
        message: 'Prompt is too long. Maximum 2000 characters allowed.'
      }], 'Validation failed')
    );
  }

  // Check API availability
  const isAPIAvailable = await checkAPIAvailability();
  if (!isAPIAvailable) {
    return res.status(503).json(
      errorResponse('AI service is currently unavailable. Please try again later.', {
        type: 'ServiceUnavailableError'
      })
    );
  }

  logger.info('AI prompt improvement request', {
    userId: req.user.id,
    promptLength: prompt.trim().length
  });

  try {
    const improvedPrompt = await improvePrompt(prompt.trim());

    res.json(
      successResponse(
        {
          originalPrompt: prompt.trim(),
          improvedPrompt,
          metadata: {
            originalLength: prompt.trim().length,
            improvedLength: improvedPrompt.length,
            improvementRatio: Math.round(((improvedPrompt.length - prompt.trim().length) / prompt.trim().length) * 100),
            improvedAt: new Date().toISOString()
          }
        },
        'AI prompt improved successfully'
      )
    );

  } catch (error) {
    logger.error('AI prompt improvement failed', {
      error: error.message,
      userId: req.user.id,
      promptLength: prompt.trim().length
    });

    res.status(500).json(
      errorResponse('Failed to improve AI prompt', {
        type: 'AIImprovementError',
        details: error.message
      })
    );
  }
});

/**
 * @desc    Generate multiple prompt variations
 * @route   POST /api/ai/variations
 * @access  Private
 */
const generatePromptVariations = asyncHandler(async (req, res) => {
  const { topic, category, tone = 'professional', variations = 3 } = req.body;

  // Validate input
  const validationErrors = [];
  
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    validationErrors.push({
      field: 'topic',
      message: 'Topic is required and must be a non-empty string'
    });
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    validationErrors.push({
      field: 'category',
      message: 'Category is required and must be a non-empty string'
    });
  }
  
  if (variations && (typeof variations !== 'number' || variations < 1 || variations > 5)) {
    validationErrors.push({
      field: 'variations',
      message: 'Variations must be a number between 1 and 5'
    });
  }

  if (validationErrors.length > 0) {
    return res.status(400).json(
      validationErrorResponse(validationErrors, 'Validation failed')
    );
  }

  // Check API availability
  const isAPIAvailable = await checkAPIAvailability();
  if (!isAPIAvailable) {
    return res.status(503).json(
      errorResponse('AI service is currently unavailable. Please try again later.', {
        type: 'ServiceUnavailableError'
      })
    );
  }

  logger.info('AI prompt variations request', {
    userId: req.user.id,
    topic,
    category,
    tone,
    variations
  });

  try {
    const generatedVariations = await generatePromptVariations(
      topic.trim(), 
      category.trim(), 
      tone.trim(), 
      variations
    );

    res.json(
      successResponse(
        {
          variations: generatedVariations,
          metadata: {
            topic: topic.trim(),
            category: category.trim(),
            tone: tone.trim(),
            requestedVariations: variations,
            actualVariations: generatedVariations.length,
            generatedAt: new Date().toISOString()
          }
        },
        'AI prompt variations generated successfully'
      )
    );

  } catch (error) {
    logger.error('AI prompt variations generation failed', {
      error: error.message,
      userId: req.user.id,
      topic,
      category,
      tone,
      variations
    });

    res.status(500).json(
      errorResponse('Failed to generate AI prompt variations', {
        type: 'AIVariationsError',
        details: error.message
      })
    );
  }
});

/**
 * @desc    Analyze prompt quality and provide feedback
 * @route   POST /api/ai/analyze
 * @access  Private
 */
const analyzePrompt = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  // Validate input
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json(
      validationErrorResponse([{
        field: 'prompt',
        message: 'Prompt is required and must be a non-empty string'
      }], 'Validation failed')
    );
  }

  // Check if prompt is too long
  if (prompt.trim().length > 2000) {
    return res.status(400).json(
      validationErrorResponse([{
        field: 'prompt',
        message: 'Prompt is too long. Maximum 2000 characters allowed.'
      }], 'Validation failed')
    );
  }

  // Check API availability
  const isAPIAvailable = await checkAPIAvailability();
  if (!isAPIAvailable) {
    return res.status(503).json(
      errorResponse('AI service is currently unavailable. Please try again later.', {
        type: 'ServiceUnavailableError'
      })
    );
  }

  logger.info('AI prompt analysis request', {
    userId: req.user.id,
    promptLength: prompt.trim().length
  });

  try {
    const analysis = await analyzePrompt(prompt.trim());

    res.json(
      successResponse(
        {
          prompt: prompt.trim(),
          analysis,
          metadata: {
            promptLength: prompt.trim().length,
            analyzedAt: new Date().toISOString()
          }
        },
        'AI prompt analysis completed successfully'
      )
    );

  } catch (error) {
    logger.error('AI prompt analysis failed', {
      error: error.message,
      userId: req.user.id,
      promptLength: prompt.trim().length
    });

    res.status(500).json(
      errorResponse('Failed to analyze AI prompt', {
        type: 'AIAnalysisError',
        details: error.message
      })
    );
  }
});

/**
 * @desc    Get AI service status and usage statistics
 * @route   GET /api/ai/status
 * @access  Private
 */
const getAIStatus = asyncHandler(async (req, res) => {
  logger.info('AI service status request', { userId: req.user.id });

  try {
    const isAPIAvailable = await checkAPIAvailability();
    const usageStats = getUsageStats();

    const status = {
      available: isAPIAvailable,
      service: 'OpenAI API',
      model: usageStats.model,
      features: usageStats.features,
      limits: usageStats.maxTokens,
      lastChecked: new Date().toISOString()
    };

    res.json(
      successResponse(
        status,
        'AI service status retrieved successfully'
      )
    );

  } catch (error) {
    logger.error('AI service status check failed', {
      error: error.message,
      userId: req.user.id
    });

    res.status(500).json(
      errorResponse('Failed to check AI service status', {
        type: 'AIStatusError',
        details: error.message
      })
    );
  }
});

/**
 * @desc    Get AI usage analytics (admin only)
 * @route   GET /api/ai/analytics
 * @access  Private (Admin only)
 */
const getAIAnalytics = asyncHandler(async (req, res) => {
  logger.info('AI analytics request', { userId: req.user.id });

  // This would typically include database tracking of AI usage
  // For now, return basic service analytics
  const analytics = {
    service: {
      name: 'OpenAI API',
      model: 'gpt-3.5-turbo',
      status: 'active'
    },
    usage: {
      totalRequests: 0, // Would be tracked in database
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    },
    features: {
      generate: 'Available',
      improve: 'Available',
      variations: 'Available',
      analyze: 'Available'
    },
    limits: {
      maxTokens: {
        generate: 500,
        improve: 500,
        variations: 1000,
        analyze: 300
      },
      maxVariations: 5,
      maxPromptLength: 2000
    }
  };

  res.json(
    successResponse(
      analytics,
      'AI analytics retrieved successfully'
    )
  );
});

module.exports = {
  generateAIPrompt,
  improveAIPrompt,
  generatePromptVariations,
  analyzePrompt,
  getAIStatus,
  getAIAnalytics
};
