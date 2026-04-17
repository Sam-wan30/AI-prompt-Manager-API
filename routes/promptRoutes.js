/**
 * Prompt Routes
 * Handles all prompt-related API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createPrompt,
  getAllPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt,
  searchPrompts,
  usePrompt,
  getTopUsedPrompts,
  bulkInsertPrompts
} = require('../controllers/promptController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate, schemas, validateObjectId, validatePagination, validateSearch, userActivityLogger } = require('../middleware/inputValidation');

// Apply authentication middleware to all routes
router.use(protect);

// Prompt CRUD operations with validation
router.post('/', 
  validate(schemas.createPrompt, 'body'),
  userActivityLogger('prompt_create'),
  createPrompt
);

router.get('/', 
  validatePagination,
  userActivityLogger('prompt_list'),
  getAllPrompts
);

router.get('/search', 
  validateSearch,
  userActivityLogger('prompt_search'),
  searchPrompts
);

router.get('/top-used', 
  validatePagination,
  userActivityLogger('prompt_top_used'),
  getTopUsedPrompts
);

router.post('/bulk', 
  validate(schemas.createPrompt, 'body'), // Basic validation for bulk operations
  userActivityLogger('prompt_bulk_create'),
  bulkInsertPrompts
);

router.get('/:id', 
  validateObjectId('id'),
  userActivityLogger('prompt_view'),
  getPromptById
);

router.put('/:id', 
  validateObjectId('id'),
  validate(schemas.updatePrompt, 'body'),
  userActivityLogger('prompt_update'),
  updatePrompt
);

router.delete('/:id', 
  validateObjectId('id'),
  userActivityLogger('prompt_delete'),
  deletePrompt
);

router.post('/:id/use', 
  validateObjectId('id'),
  userActivityLogger('prompt_use'),
  usePrompt
);

module.exports = router;
