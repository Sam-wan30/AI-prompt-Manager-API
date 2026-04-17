/**
 * Prompt Controller - Production-level implementation
 * Uses asyncHandler, responseFormatter, and logging for clean, maintainable code
 */

const Prompt = require('../models/Prompt');
const { successResponse, errorResponse, paginatedResponse, notFoundResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new prompt
// @route   POST /api/prompts
// @access  Public
const createPrompt = asyncHandler(async (req, res) => {
  const { title, description, promptText, category, tags } = req.body;

  // Log the creation attempt
  logger.info('Creating new prompt', { 
    title, 
    category, 
    tagsCount: tags?.length || 0 
  });

  const prompt = new Prompt({
    title,
    description,
    promptText,
    category,
    tags: tags || []
  });

  const savedPrompt = await prompt.save();

  logger.info('Prompt created successfully', { 
    promptId: savedPrompt._id,
    title: savedPrompt.title 
  });

  res.status(201).json(
    successResponse(savedPrompt, 'Prompt created successfully')
  );
});

// @desc    Get all prompts with pagination and sorting
// @route   GET /api/prompts
// @access  Public
const getAllPrompts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const skip = (page - 1) * limit;

  // Validate sort field
  const validSortFields = ['createdAt', 'updatedAt', 'title', 'category', 'usageCount'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const sortOptions = {};
  sortOptions[sortField] = sortOrder;

  logger.info('Fetching prompts with pagination', { 
    page, 
    limit, 
    sortBy: sortField, 
    sortOrder: sortOrder === 1 ? 'asc' : 'desc' 
  });

  // Execute queries in parallel for better performance
  const [prompts, total] = await Promise.all([
    Prompt.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-__v') // Exclude unnecessary fields
      .lean(), // Better performance for read operations
    Prompt.countDocuments()
  ]);

  const totalPages = Math.ceil(total / limit);

  logger.info('Prompts retrieved successfully', { 
    count: prompts.length, 
    total,
    page,
    totalPages 
  });

  res.json(
    paginatedResponse(prompts, {
      currentPage: page,
      totalPages,
      totalResults: total,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }, 'Prompts retrieved successfully')
  );
});

// @desc    Get single prompt by ID
// @route   GET /api/prompts/:id
// @access  Public
const getPromptById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Fetching prompt by ID', { promptId: id });

  const prompt = await Prompt.findById(id);

  if (!prompt) {
    logger.warn('Prompt not found', { promptId: id });
    return res.status(404).json(
      notFoundResponse('Prompt')
    );
  }

  logger.info('Prompt retrieved successfully', { 
    promptId: id, 
    title: prompt.title 
  });

  res.json(
    successResponse(prompt, 'Prompt retrieved successfully')
  );
});

// @desc    Update a prompt
// @route   PUT /api/prompts/:id
// @access  Public
const updatePrompt = async (req, res) => {
  try {
    const { title, description, promptText, category, tags } = req.body;

    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json(
        createResponse(false, null, 'Prompt not found')
      );
    }

    // Update fields
    if (title !== undefined) prompt.title = title;
    if (description !== undefined) prompt.description = description;
    if (promptText !== undefined) prompt.promptText = promptText;
    if (category !== undefined) prompt.category = category;
    if (tags !== undefined) prompt.tags = tags;

    const updatedPrompt = await prompt.save();

    res.json(
      createResponse(true, updatedPrompt, 'Prompt updated successfully')
    );
  } catch (error) {
    res.status(400).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Public
const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json(
        createResponse(false, null, 'Prompt not found')
      );
    }

    await Prompt.findByIdAndDelete(req.params.id);

    res.json(
      createResponse(true, null, 'Prompt deleted successfully')
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Bulk insert prompts with validation and error handling
// @route   POST /api/prompts/bulk
// @access  Public
const bulkInsertPrompts = async (req, res) => {
  try {
    const { prompts } = req.body;

    // Input validation
    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json(
        createResponse(false, null, 'Prompts array is required')
      );
    }

    if (prompts.length === 0) {
      return res.status(400).json(
        createResponse(false, null, 'Prompts array cannot be empty')
      );
    }

    // Safety limits to prevent server overload
    const MAX_BATCH_SIZE = 100;
    if (prompts.length > MAX_BATCH_SIZE) {
      return res.status(400).json(
        createResponse(false, null, `Maximum ${MAX_BATCH_SIZE} prompts allowed per batch`)
      );
    }

    // Validate and sanitize each prompt
    const validationResults = [];
    const validPrompts = [];
    const invalidPrompts = [];

    prompts.forEach((prompt, index) => {
      try {
        // Create a new Prompt instance to trigger validation
        const promptInstance = new Prompt(prompt);
        const validationError = promptInstance.validateSync();
        
        if (validationError) {
          const errors = Object.keys(validationError.errors).map(field => ({
            field,
            message: validationError.errors[field].message,
            value: validationError.errors[field].value
          }));
          
          invalidPrompts.push({
            index,
            prompt,
            errors,
            reason: 'validation_failed'
          });
        } else {
          // Sanitize and clean the prompt data
          const sanitizedPrompt = {
            title: prompt.title?.trim(),
            description: prompt.description?.trim(),
            promptText: prompt.promptText?.trim(),
            category: prompt.category?.trim(),
            tags: Array.isArray(prompt.tags) ? 
              prompt.tags.map(tag => tag?.trim()).filter(Boolean) : [],
            usageCount: typeof prompt.usageCount === 'number' ? prompt.usageCount : 0
          };
          
          validPrompts.push(sanitizedPrompt);
          validationResults.push({
            index,
            status: 'valid',
            title: sanitizedPrompt.title
          });
        }
      } catch (error) {
        invalidPrompts.push({
          index,
          prompt,
          errors: [{ message: error.message }],
          reason: 'processing_error'
        });
      }
    });

    let insertedPrompts = [];
    let insertionErrors = [];

    // Only attempt insertion if there are valid prompts
    if (validPrompts.length > 0) {
      try {
        // Use insertMany with ordered: false to continue on errors
        insertedPrompts = await Prompt.insertMany(validPrompts, { 
          ordered: false,
          runValidators: true 
        });
      } catch (insertionError) {
        // Handle bulk write errors
        if (insertionError.name === 'BulkWriteError') {
          insertionError.writeErrors?.forEach((writeError) => {
            insertionErrors.push({
              index: writeError.index,
              code: writeError.code,
              message: writeError.errmsg,
              reason: 'database_write_error'
            });
          });
        } else {
          insertionErrors.push({
            message: insertionError.message,
            reason: 'database_error'
          });
        }
      }
    }

    // Prepare comprehensive response
    const response = {
      summary: {
        totalReceived: prompts.length,
        validCount: validPrompts.length,
        invalidCount: invalidPrompts.length,
        insertedCount: insertedPrompts.length,
        failedCount: invalidPrompts.length + insertionErrors.length,
        successRate: prompts.length > 0 ? Math.round((insertedPrompts.length / prompts.length) * 100) : 0
      },
      results: {
        inserted: insertedPrompts.map(prompt => ({
          id: prompt._id,
          title: prompt.title,
          category: prompt.category
        })),
        validationResults,
        invalidPrompts,
        insertionErrors
      },
      performance: {
        processingTime: Date.now(),
        batchSize: prompts.length
      }
    };

    // Determine appropriate status code
    const statusCode = insertedPrompts.length > 0 ? 201 : 400;
    const message = insertedPrompts.length > 0 
      ? `${insertedPrompts.length} prompts inserted successfully`
      : 'No prompts were inserted due to validation errors';

    res.status(statusCode).json(
      createResponse(true, response, message)
    );

  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json(
      createResponse(false, null, 'Internal server error during bulk insert')
    );
  }
};

// @desc    Advanced smart search with optimized queries
// @route   GET /api/prompts/search
// @access  Public
const searchPrompts = async (req, res) => {
  try {
    const {
      q: keyword,
      category,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 results per page
    const skip = (pageNum - 1) * limitNum;

    // Build optimized query
    const query = {};
    
    // Category filter (exact match)
    if (category) {
      query.category = category;
    }
    
    // Tags filter using $in operator for optimal performance
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Keyword search with regex for title and description
    if (keyword) {
      const searchRegex = new RegExp(keyword.trim(), 'i'); // Case-insensitive
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'usageCount', 'title', 'category'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel for better performance
    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Prompt.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(
      createResponse(true, {
        data: prompts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalResults: total,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        search: {
          keyword: keyword || '',
          category: category || '',
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : []
        }
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Use a prompt (increment usage count)
// @route   POST /api/prompts/:id/use
// @access  Public
const usePrompt = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json(
        createResponse(false, null, 'Invalid prompt ID format')
      );
    }

    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { usageCount: 1 },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true, 
        runValidators: true,
        select: '-__v' // Exclude unnecessary fields
      }
    );

    if (!prompt) {
      return res.status(404).json(
        createResponse(false, null, 'Prompt not found')
      );
    }

    res.json(
      createResponse(true, {
        ...prompt.toObject(),
        usageIncremented: true,
        previousUsageCount: prompt.usageCount - 1
      }, 'Prompt usage recorded successfully')
    );
  } catch (error) {
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json(
        createResponse(false, null, 'Invalid prompt ID format')
      );
    }
    
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Get top used prompts (usage analytics)
// @route   GET /api/prompts/top-used
// @access  Public
const getTopUsedPrompts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20); // Max 20 results
    const timeRange = req.query.timeRange || 'all'; // all, week, month
    
    // Build filter based on time range
    let dateFilter = {};
    const now = new Date();
    
    if (timeRange === 'week') {
      dateFilter = { updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === 'month') {
      dateFilter = { updatedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    // Get top used prompts with additional analytics
    const topPrompts = await Prompt.find(dateFilter)
      .sort({ usageCount: -1, updatedAt: -1 })
      .limit(limit)
      .select('-__v')
      .lean();
    
    // Get analytics summary
    const [totalUsage, totalPrompts, avgUsage] = await Promise.all([
      Prompt.aggregate([
        ...Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : [],
        { $group: { _id: null, total: { $sum: '$usageCount' } } }
      ]),
      Prompt.countDocuments(dateFilter),
      Prompt.aggregate([
        ...Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : [],
        { $group: { _id: null, avg: { $avg: '$usageCount' } } }
      ])
    ]);
    
    // Add ranking and performance metrics
    const rankedPrompts = topPrompts.map((prompt, index) => ({
      ...prompt,
      rank: index + 1,
      usagePercentage: totalUsage[0]?.total > 0 ? 
        Math.round((prompt.usageCount / totalUsage[0].total) * 100) : 0,
      isAboveAverage: avgUsage[0]?.avg ? prompt.usageCount > avgUsage[0].avg : false
    }));

    res.json(
      createResponse(true, {
        prompts: rankedPrompts,
        analytics: {
          totalUsage: totalUsage[0]?.total || 0,
          totalPrompts,
          averageUsage: avgUsage[0]?.avg || 0,
          timeRange,
          rankingPeriod: timeRange === 'all' ? 'All time' : 
                          timeRange === 'week' ? 'Last 7 days' : 'Last 30 days'
        },
        pagination: {
          limit,
          hasMore: topPrompts.length === limit
        }
      }, `Top ${limit} most used prompts retrieved`)
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Get popular prompts
// @route   GET /api/prompts/popular
// @access  Public
const getPopularPrompts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popularPrompts = await Prompt.getPopular(limit);

    res.json(
      createResponse(true, popularPrompts)
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Advanced smart search with enhanced filters and optimization
// @route   GET /api/prompts/smart-search
// @access  Public
const smartSearch = async (req, res) => {
  try {
    const {
      q: keyword,
      category,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Parse and validate pagination with safety limits
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build optimized MongoDB query
    const query = {};
    
    // Category filter (exact match) - uses indexed field
    if (category) {
      query.category = category;
    }
    
    // Tags filter using $in operator - uses indexed field
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }
    
    // Keyword search with regex for title and description
    if (keyword && keyword.trim()) {
      const searchTerm = keyword.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Sort options with validation
    const sortOptions = {};
    const validSortFields = ['createdAt', 'usageCount', 'title', 'category'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel for optimal performance
    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean() // Better performance for read operations
        .select('-__v'), // Exclude unnecessary fields
      Prompt.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Enhanced response format
    res.json(
      createResponse(true, {
        data: prompts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalResults: total,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        search: {
          keyword: keyword || '',
          category: category || '',
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').filter(Boolean)) : [],
          sortBy: sortField,
          sortOrder: sortOrder || 'desc'
        },
        performance: {
          queryTime: Date.now(), // For monitoring
          resultsPerPage: limitNum,
          totalResults: total
        }
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

// @desc    Get prompt statistics
// @route   GET /api/prompts/stats
// @access  Public
const getPromptStats = async (req, res) => {
  try {
    const totalPrompts = await Prompt.countDocuments();
    const totalUsage = await Prompt.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);
    const categoryStats = await Prompt.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const mostUsed = await Prompt.findOne().sort({ usageCount: -1 });

    res.json(
      createResponse(true, {
        totalPrompts,
        totalUsage: totalUsage[0]?.total || 0,
        categoryStats,
        mostUsedPrompt: mostUsed
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, null, error.message)
    );
  }
};

module.exports = {
  createPrompt,
  getAllPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt,
  bulkInsertPrompts,
  searchPrompts,
  smartSearch,
  usePrompt,
  getTopUsedPrompts,
  getPopularPrompts,
  getPromptStats
};
