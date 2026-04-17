/**
 * AI Service - OpenAI API Integration
 * Handles AI prompt generation and improvement using OpenAI's API
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');
const { config } = require('../config/config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI prompt based on topic, category, and tone
 * @param {string} topic - The topic for the prompt
 * @param {string} category - The category of the prompt
 * @param {string} tone - The tone for the prompt (optional)
 * @returns {Promise<string>} Generated prompt text
 */
const generatePrompt = async (topic, category, tone = 'professional') => {
  try {
    logger.info('Generating AI prompt', { topic, category, tone });

    // Construct the system prompt
    const systemPrompt = `You are an expert prompt engineer. Generate high-quality, detailed, and effective AI prompts based on the given requirements.

Your prompts should:
- Be clear and specific
- Include context and constraints
- Be actionable and practical
- Follow best practices for prompt engineering
- Be suitable for the specified category
- Match the requested tone

Format your response as a single, well-structured prompt without additional commentary.`;

    // Construct the user prompt
    const userPrompt = `Generate a high-quality AI prompt for: ${topic} in ${category} category with ${tone} tone`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const generatedPrompt = completion.choices[0]?.message?.content?.trim();
    
    if (!generatedPrompt) {
      throw new Error('No content generated from OpenAI API');
    }

    logger.info('AI prompt generated successfully', {
      topic,
      category,
      tone,
      promptLength: generatedPrompt.length
    });

    return generatedPrompt;

  } catch (error) {
    logger.error('Error generating AI prompt', {
      error: error.message,
      topic,
      category,
      tone
    });
    throw handleOpenAIError(error);
  }
};

/**
 * Improve an existing prompt using AI
 * @param {string} existingPrompt - The prompt to improve
 * @returns {Promise<string>} Improved prompt text
 */
const improvePrompt = async (existingPrompt) => {
  try {
    logger.info('Improving AI prompt', { promptLength: existingPrompt.length });

    // Construct the system prompt
    const systemPrompt = `You are an expert prompt engineer. Improve the given AI prompt to make it more effective, clear, and actionable.

Your improvements should:
- Enhance clarity and specificity
- Add missing context or constraints
- Improve structure and organization
- Fix any ambiguities or issues
- Maintain the original intent while enhancing effectiveness
- Follow best practices for prompt engineering

Format your response as a single, improved prompt without additional commentary.`;

    // Construct the user prompt
    const userPrompt = `Improve this AI prompt: ${existingPrompt}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const improvedPrompt = completion.choices[0]?.message?.content?.trim();
    
    if (!improvedPrompt) {
      throw new Error('No content generated from OpenAI API');
    }

    logger.info('AI prompt improved successfully', {
      originalLength: existingPrompt.length,
      improvedLength: improvedPrompt.length
    });

    return improvedPrompt;

  } catch (error) {
    logger.error('Error improving AI prompt', {
      error: error.message,
      promptLength: existingPrompt.length
    });
    throw handleOpenAIError(error);
  }
};

/**
 * Generate multiple prompt variations
 * @param {string} topic - The topic for the prompts
 * @param {string} category - The category of the prompts
 * @param {string} tone - The tone for the prompts
 * @param {number} variations - Number of variations to generate
 * @returns {Promise<string[]>} Array of generated prompts
 */
const generatePromptVariations = async (topic, category, tone = 'professional', variations = 3) => {
  try {
    logger.info('Generating AI prompt variations', { topic, category, tone, variations });

    const systemPrompt = `You are an expert prompt engineer. Generate ${variations} different, high-quality AI prompts for the given requirements.

Each prompt should:
- Be unique and distinct from the others
- Approach the topic from different angles
- Include different contexts or use cases
- Follow best practices for prompt engineering
- Be suitable for the specified category
- Match the requested tone

Format your response as a numbered list with each prompt on a separate line, without additional commentary.`;

    const userPrompt = `Generate ${variations} different AI prompts for: ${topic} in ${category} category with ${tone} tone`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.8,
      presence_penalty: 0.2,
      frequency_penalty: 0.2
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('No content generated from OpenAI API');
    }

    // Parse numbered list into array
    const prompts = response
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(prompt => prompt.length > 0);

    logger.info('AI prompt variations generated successfully', {
      topic,
      category,
      tone,
      requestedVariations: variations,
      actualVariations: prompts.length
    });

    return prompts.slice(0, variations); // Ensure we don't return more than requested

  } catch (error) {
    logger.error('Error generating AI prompt variations', {
      error: error.message,
      topic,
      category,
      tone,
      variations
    });
    throw handleOpenAIError(error);
  }
};

/**
 * Analyze prompt quality and provide feedback
 * @param {string} prompt - The prompt to analyze
 * @returns {Promise<object>} Analysis results
 */
const analyzePrompt = async (prompt) => {
  try {
    logger.info('Analyzing AI prompt quality', { promptLength: prompt.length });

    const systemPrompt = `You are an expert prompt engineer. Analyze the given AI prompt and provide detailed feedback on its quality.

Your analysis should include:
- Overall quality score (1-10)
- Strengths of the prompt
- Areas for improvement
- Specific recommendations
- Clarity assessment
- Completeness assessment
- Actionability assessment

Format your response as JSON with the following structure:
{
  "score": 8,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "clarity": 8,
  "completeness": 7,
  "actionability": 9
}`;

    const userPrompt = `Analyze this AI prompt for quality: ${prompt}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('No content generated from OpenAI API');
    }

    // Parse JSON response
    const analysis = JSON.parse(response);

    logger.info('AI prompt analysis completed', {
      promptLength: prompt.length,
      score: analysis.score
    });

    return analysis;

  } catch (error) {
    logger.error('Error analyzing AI prompt', {
      error: error.message,
      promptLength: prompt.length
    });
    throw handleOpenAIError(error);
  }
};

/**
 * Handle OpenAI API errors and provide meaningful error messages
 * @param {Error} error - The error from OpenAI API
 * @returns {Error} Formatted error
 */
const handleOpenAIError = (error) => {
  if (error.code === 'insufficient_quota') {
    return new Error('OpenAI API quota exceeded. Please check your billing.');
  } else if (error.code === 'invalid_api_key') {
    return new Error('Invalid OpenAI API key. Please check your configuration.');
  } else if (error.code === 'model_not_found') {
    return new Error('OpenAI model not found. Please check your model configuration.');
  } else if (error.code === 'rate_limit_exceeded') {
    return new Error('OpenAI API rate limit exceeded. Please try again later.');
  } else if (error.code === 'invalid_request_error') {
    return new Error(`Invalid request to OpenAI API: ${error.message}`);
  } else if (error.code === 'service_unavailable') {
    return new Error('OpenAI API service is temporarily unavailable. Please try again later.');
  } else if (error.message.includes('OPENAI_API_KEY')) {
    return new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  } else {
    return new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Check if OpenAI API is available and configured
 * @returns {Promise<boolean>} True if API is available
 */
const checkAPIAvailability = async () => {
  try {
    // Make a simple API call to check availability
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    
    logger.info('OpenAI API availability check: Success');
    return true;
  } catch (error) {
    logger.error('OpenAI API availability check: Failed', { error: error.message });
    return false;
  }
};

/**
 * Get AI usage statistics
 * @returns {object} Usage statistics
 */
const getUsageStats = () => {
  return {
    model: 'gpt-3.5-turbo',
    maxTokens: {
      generate: 500,
      improve: 500,
      variations: 1000,
      analyze: 300
    },
    temperature: {
      generate: 0.7,
      improve: 0.7,
      variations: 0.8,
      analyze: 0.3
    },
    features: [
      'generate',
      'improve',
      'variations',
      'analyze'
    ]
  };
};

module.exports = {
  generatePrompt,
  improvePrompt,
  generatePromptVariations,
  analyzePrompt,
  checkAPIAvailability,
  getUsageStats,
  handleOpenAIError
};
