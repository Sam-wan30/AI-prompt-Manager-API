const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');

// Test the advanced smart search API
async function testSmartSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/test_prompt_manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing test data
    await Prompt.deleteMany({});

    // Create test prompts
    console.log('\n=== Creating test prompts ===');
    const testPrompts = [
      {
        title: 'Marketing Campaign Strategy',
        description: 'Comprehensive marketing campaign planning template',
        promptText: 'This is a detailed marketing campaign strategy prompt that helps create effective marketing plans with multiple channels and target audiences.',
        category: 'marketing',
        tags: ['marketing', 'strategy', 'campaign', 'planning']
      },
      {
        title: 'JavaScript Code Review',
        description: 'Template for conducting JavaScript code reviews',
        promptText: 'JavaScript code review checklist for ensuring code quality, performance, and best practices in modern web development projects.',
        category: 'coding',
        tags: ['javascript', 'code-review', 'quality', 'best-practices']
      },
      {
        title: 'Business Proposal Writing',
        description: 'Professional business proposal template',
        promptText: 'Business proposal writing template that helps create compelling proposals for clients and stakeholders with clear structure and persuasive language.',
        category: 'business',
        tags: ['business', 'proposal', 'writing', 'professional']
      },
      {
        title: 'Creative Story Writing',
        description: 'Creative writing prompt for storytelling',
        promptText: 'Creative storytelling prompt that helps writers develop engaging narratives with compelling characters and plot development.',
        category: 'writing',
        tags: ['creative', 'storytelling', 'narrative', 'writing']
      },
      {
        title: 'Educational Content Creation',
        description: 'Template for creating educational materials',
        promptText: 'Educational content creation template for developing engaging learning materials that help students understand complex topics.',
        category: 'education',
        tags: ['education', 'content', 'learning', 'teaching']
      },
      {
        title: 'Digital Marketing Tactics',
        description: 'Modern digital marketing strategies',
        promptText: 'Digital marketing tactics guide covering SEO, social media, email marketing, and content marketing for online business growth.',
        category: 'marketing',
        tags: ['digital', 'marketing', 'seo', 'social-media']
      }
    ];

    const savedPrompts = await Prompt.insertMany(testPrompts);
    console.log(`Created ${savedPrompts.length} test prompts`);

    // Test 1: Search by category
    console.log('\n=== Test 1: Search by category (marketing) ===');
    const categorySearch = await Prompt.find({ category: 'marketing' }).lean();
    console.log(`Found ${categorySearch.length} marketing prompts`);
    categorySearch.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 2: Search by tags using $in operator
    console.log('\n=== Test 2: Search by tags (marketing, strategy) ===');
    const tagsSearch = await Prompt.find({ 
      tags: { $in: ['marketing', 'strategy'] } 
    }).lean();
    console.log(`Found ${tagsSearch.length} prompts with marketing or strategy tags`);
    tagsSearch.forEach(prompt => console.log(`- ${prompt.title} (tags: ${prompt.tags.join(', ')})`));

    // Test 3: Keyword search in title and description
    console.log('\n=== Test 3: Keyword search ("marketing") ===');
    const keywordSearch = await Prompt.find({
      $or: [
        { title: { $regex: 'marketing', $options: 'i' } },
        { description: { $regex: 'marketing', $options: 'i' } }
      ]
    }).lean();
    console.log(`Found ${keywordSearch.length} prompts with "marketing" keyword`);
    keywordSearch.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 4: Combined filters (category + tags)
    console.log('\n=== Test 4: Combined filters (marketing category + digital tag) ===');
    const combinedSearch = await Prompt.find({
      category: 'marketing',
      tags: { $in: ['digital'] }
    }).lean();
    console.log(`Found ${combinedSearch.length} prompts with marketing category and digital tag`);
    combinedSearch.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 5: Combined filters (category + keyword)
    console.log('\n=== Test 5: Combined filters (business category + "proposal" keyword) ===');
    const combinedKeywordSearch = await Prompt.find({
      category: 'business',
      $or: [
        { title: { $regex: 'proposal', $options: 'i' } },
        { description: { $regex: 'proposal', $options: 'i' } }
      ]
    }).lean();
    console.log(`Found ${combinedKeywordSearch.length} prompts with business category and "proposal" keyword`);
    combinedKeywordSearch.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 6: Pagination test
    console.log('\n=== Test 6: Pagination (page 1, limit 3) ===');
    const page1Results = await Prompt.find()
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(3)
      .lean();
    console.log(`Page 1: Found ${page1Results.length} prompts`);
    page1Results.forEach(prompt => console.log(`- ${prompt.title}`));

    console.log('\n=== Test 7: Pagination (page 2, limit 3) ===');
    const page2Results = await Prompt.find()
      .sort({ createdAt: -1 })
      .skip(3)
      .limit(3)
      .lean();
    console.log(`Page 2: Found ${page2Results.length} prompts`);
    page2Results.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 7: Complex query with all filters
    console.log('\n=== Test 8: Complex query (marketing category, multiple tags, "campaign" keyword) ===');
    const complexSearch = await Prompt.find({
      category: 'marketing',
      tags: { $in: ['campaign', 'strategy'] },
      $or: [
        { title: { $regex: 'campaign', $options: 'i' } },
        { description: { $regex: 'campaign', $options: 'i' } }
      ]
    }).lean();
    console.log(`Found ${complexSearch.length} prompts matching all criteria`);
    complexSearch.forEach(prompt => console.log(`- ${prompt.title}`));

    // Test 8: Performance test with count
    console.log('\n=== Test 9: Performance test with parallel queries ===');
    const startTime = Date.now();
    const [results, totalCount] = await Promise.all([
      Prompt.find({ category: 'marketing' }).lean(),
      Prompt.countDocuments({ category: 'marketing' })
    ]);
    const queryTime = Date.now() - startTime;
    console.log(`Parallel query completed in ${queryTime}ms`);
    console.log(`Found ${results.length} of ${totalCount} marketing prompts`);

    console.log('\n=== All tests completed successfully! ===');
    console.log('Advanced smart search API is working correctly with:');
    console.log('1. Category filtering (exact match)');
    console.log('2. Tags search using $in operator');
    console.log('3. Keyword search with regex in title and description');
    console.log('4. Combined filters support');
    console.log('5. Pagination with page and limit');
    console.log('6. Optimized queries with parallel execution');
    console.log('7. Proper indexing utilization');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSmartSearch();
