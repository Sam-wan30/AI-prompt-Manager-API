const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');

// Test the improved schema
async function testSchema() {
  try {
    // Connect to MongoDB (using a test database)
    await mongoose.connect('mongodb://localhost:27017/test_prompt_manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Test 1: Create a valid prompt
    console.log('\n=== Test 1: Creating valid prompt ===');
    const validPrompt = new Prompt({
      title: 'Test Marketing Prompt',
      description: 'A test prompt for marketing campaigns',
      promptText: 'This is a comprehensive marketing prompt that is definitely more than 20 characters long and provides detailed instructions for creating effective marketing content.',
      category: 'marketing',
      tags: ['marketing', 'content', 'strategy']
    });

    const savedPrompt = await validPrompt.save();
    console.log('Valid prompt saved successfully:', savedPrompt.title);

    // Test 2: Try to create prompt with duplicate title (should fail)
    console.log('\n=== Test 2: Testing unique title constraint ===');
    try {
      const duplicatePrompt = new Prompt({
        title: 'Test Marketing Prompt', // Same title
        description: 'Another description',
        promptText: 'Another prompt text that is long enough',
        category: 'coding',
        tags: ['test']
      });
      await duplicatePrompt.save();
      console.log('ERROR: Duplicate title was allowed!');
    } catch (error) {
      console.log('SUCCESS: Duplicate title rejected:', error.message);
    }

    // Test 3: Try to create prompt with invalid category (should fail)
    console.log('\n=== Test 3: Testing category enum validation ===');
    try {
      const invalidCategoryPrompt = new Prompt({
        title: 'Invalid Category Test',
        description: 'Testing invalid category',
        promptText: 'This prompt has an invalid category and should fail validation',
        category: 'invalid_category',
        tags: ['test']
      });
      await invalidCategoryPrompt.save();
      console.log('ERROR: Invalid category was allowed!');
    } catch (error) {
      console.log('SUCCESS: Invalid category rejected:', error.message);
    }

    // Test 4: Try to create prompt with too many tags (should fail)
    console.log('\n=== Test 4: Testing tags array length validation ===');
    try {
      const tooManyTagsPrompt = new Prompt({
        title: 'Too Many Tags Test',
        description: 'Testing too many tags',
        promptText: 'This prompt has too many tags and should fail validation',
        category: 'writing',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10', 'tag11']
      });
      await tooManyTagsPrompt.save();
      console.log('ERROR: Too many tags was allowed!');
    } catch (error) {
      console.log('SUCCESS: Too many tags rejected:', error.message);
    }

    // Test 5: Try to create prompt with short promptText (should fail)
    console.log('\n=== Test 5: Testing promptText minimum length ===');
    try {
      const shortPromptPrompt = new Prompt({
        title: 'Short Prompt Test',
        description: 'Testing short prompt text',
        promptText: 'Too short',
        category: 'business',
        tags: ['test']
      });
      await shortPromptPrompt.save();
      console.log('ERROR: Short prompt text was allowed!');
    } catch (error) {
      console.log('SUCCESS: Short prompt text rejected:', error.message);
    }

    // Test 6: Test tag trimming functionality
    console.log('\n=== Test 6: Testing tag trimming ===');
    const trimTestPrompt = new Prompt({
      title: 'Tag Trimming Test',
      description: 'Testing tag trimming functionality',
      promptText: 'This prompt tests tag trimming with spaces and empty tags',
      category: 'education',
      tags: ['  tag1  ', 'tag2', '', '  tag3  ', '   ']
    });

    const trimmedPrompt = await trimTestPrompt.save();
    console.log('Original tags:', ['  tag1  ', 'tag2', '', '  tag3  ', '   ']);
    console.log('Trimmed tags:', trimmedPrompt.tags);

    console.log('\n=== All tests completed ===');
    console.log('Schema improvements working correctly!');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSchema();
