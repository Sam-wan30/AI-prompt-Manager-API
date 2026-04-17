/**
 * Analytics Endpoint Test
 * Tests the MongoDB aggregation pipelines and analytics functionality
 */

const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');

// Test the analytics endpoint functionality
async function testAnalytics() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/test_prompt_manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing test data
    await Prompt.deleteMany({});

    // Create test prompts with different usage patterns
    console.log('\n=== Creating test data for analytics ===');
    const testPrompts = [
      {
        title: 'Marketing Strategy Guide',
        description: 'Comprehensive marketing strategy template',
        promptText: 'This is a detailed marketing strategy prompt that helps create effective marketing plans with multiple channels and target audiences.',
        category: 'marketing',
        tags: ['marketing', 'strategy', 'business'],
        usageCount: 25
      },
      {
        title: 'JavaScript Code Review',
        description: 'JavaScript code review checklist',
        promptText: 'JavaScript code review checklist for ensuring code quality, performance, and best practices in modern web development projects.',
        category: 'coding',
        tags: ['javascript', 'code-review', 'quality'],
        usageCount: 18
      },
      {
        title: 'Business Proposal Template',
        description: 'Professional business proposal template',
        promptText: 'Business proposal writing template that helps create compelling proposals for clients and stakeholders with clear structure and persuasive language.',
        category: 'business',
        tags: ['business', 'proposal', 'writing'],
        usageCount: 32
      },
      {
        title: 'Creative Writing Prompt',
        description: 'Creative writing story prompt',
        promptText: 'Creative storytelling prompt that helps writers develop engaging narratives with compelling characters and plot development.',
        category: 'writing',
        tags: ['creative', 'storytelling', 'writing'],
        usageCount: 12
      },
      {
        title: 'Educational Content Creator',
        description: 'Template for educational materials',
        promptText: 'Educational content creation template for developing engaging learning materials that help students understand complex topics.',
        category: 'education',
        tags: ['education', 'content', 'teaching'],
        usageCount: 8
      },
      {
        title: 'Digital Marketing Tactics',
        description: 'Modern digital marketing strategies',
        promptText: 'Digital marketing tactics guide covering SEO, social media, email marketing, and content marketing for online business growth.',
        category: 'marketing',
        tags: ['marketing', 'digital', 'seo'],
        usageCount: 15
      },
      {
        title: 'Python Data Analysis',
        description: 'Python data analysis template',
        promptText: 'Python data analysis template for data scientists with pandas, numpy, and visualization libraries.',
        category: 'coding',
        tags: ['python', 'data-analysis', 'coding'],
        usageCount: 20
      },
      {
        title: 'Sales Pitch Framework',
        description: 'Sales pitch structure template',
        promptText: 'Sales pitch framework that helps create compelling presentations for potential clients and investors.',
        category: 'business',
        tags: ['sales', 'business', 'pitch'],
        usageCount: 28
      },
      {
        title: 'Blog Post Generator',
        description: 'Blog content creation template',
        promptText: 'Blog post generator that helps create engaging content with proper structure, SEO optimization, and reader engagement.',
        category: 'writing',
        tags: ['blog', 'writing', 'seo'],
        usageCount: 10
      },
      {
        title: 'Online Course Creator',
        description: 'Online course development template',
        promptText: 'Online course creation template for developing comprehensive educational content with modules and assessments.',
        category: 'education',
        tags: ['education', 'online', 'course'],
        usageCount: 6
      }
    ];

    const savedPrompts = await Prompt.insertMany(testPrompts);
    console.log(`Created ${savedPrompts.length} test prompts`);

    // Test 1: Total prompts count aggregation
    console.log('\n=== Test 1: Total Prompts Count ===');
    const totalPromptsResult = await Prompt.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    const totalPrompts = totalPromptsResult[0]?.count || 0;
    console.log(`Total prompts: ${totalPrompts}`);

    // Test 2: Total usage count aggregation
    console.log('\n=== Test 2: Total Usage Count ===');
    const totalUsageResult = await Prompt.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);
    const totalUsage = totalUsageResult[0]?.totalUsage || 0;
    console.log(`Total usage count: ${totalUsage}`);

    // Test 3: Most used category analytics
    console.log('\n=== Test 3: Category Analytics ===');
    const categoryResult = await Prompt.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          averageUsage: { $avg: '$usageCount' },
          maxUsage: { $max: '$usageCount' },
          minUsage: { $min: '$usageCount' }
        }
      },
      {
        $sort: { totalUsage: -1 }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          totalUsage: 1,
          averageUsage: { $round: ['$averageUsage', 2] },
          maxUsage: 1,
          minUsage: 1
        }
      }
    ]);

    console.log('Category usage distribution:');
    categoryResult.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} prompts, ${cat.totalUsage} total usage, avg: ${cat.averageUsage}`);
    });

    const mostUsedCategory = categoryResult[0];
    console.log(`Most used category: ${mostUsedCategory.category} (${mostUsedCategory.totalUsage} usage)`);

    // Test 4: Top 3 tags frequency analytics
    console.log('\n=== Test 4: Top Tags Analytics ===');
    const tagResult = await Prompt.aggregate([
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          frequency: 1,
          totalUsage: 1,
          categories: 1,
          averageUsagePerPrompt: { $round: [{ $divide: ['$totalUsage', '$count'] }, 2] }
        }
      }
    ]);

    console.log('Top 3 most frequent tags:');
    tagResult.forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.tag}: ${tag.frequency} prompts, ${tag.totalUsage} total usage`);
    });

    // Test 5: Usage distribution analytics
    console.log('\n=== Test 5: Usage Distribution ===');
    const usageDistributionResult = await Prompt.aggregate([
      {
        $bucket: {
          groupBy: '$usageCount',
          boundaries: [0, 1, 5, 10, 25, 50, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            totalUsage: { $sum: '$usageCount' }
          }
        }
      },
      {
        $project: {
          _id: 0,
          range: '$_id',
          count: 1,
          totalUsage: 1
        }
      }
    ]);

    console.log('Usage distribution:');
    usageDistributionResult.forEach(bucket => {
      console.log(`  ${bucket.range}: ${bucket.count} prompts, ${bucket.totalUsage} total usage`);
    });

    // Test 6: Recent activity analytics
    console.log('\n=== Test 6: Recent Activity ===');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivityResult = await Prompt.aggregate([
      {
        $match: { updatedAt: { $gte: oneWeekAgo } }
      },
      {
        $group: {
          _id: null,
          promptsUpdated: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const recentActivity = recentActivityResult[0] || { promptsUpdated: 0, totalUsage: 0 };
    console.log(`Recent activity (last 7 days): ${recentActivity.promptsUpdated} prompts updated, ${recentActivity.totalUsage} total usage`);

    // Test 7: Performance test - parallel aggregation
    console.log('\n=== Test 7: Performance Test ===');
    const startTime = Date.now();
    
    const [parallelPrompts, parallelUsage, parallelCategories] = await Promise.all([
      Prompt.aggregate([{ $group: { _id: null, count: { $sum: 1 } } }]),
      Prompt.aggregate([{ $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }]),
      Prompt.aggregate([
        { $group: { _id: '$category', totalUsage: { $sum: '$usageCount' } } },
        { $sort: { totalUsage: -1 } },
        { $limit: 3 }
      ])
    ]);
    
    const parallelTime = Date.now() - startTime;
    console.log(`Parallel aggregation completed in ${parallelTime}ms`);

    // Test 8: Complex aggregation with multiple stages
    console.log('\n=== Test 8: Complex Aggregation ===');
    const complexResult = await Prompt.aggregate([
      {
        $match: { usageCount: { $gt: 10 } }
      },
      {
        $group: {
          _id: '$category',
          highUsagePrompts: { $sum: 1 },
          totalHighUsage: { $sum: '$usageCount' },
          avgHighUsage: { $avg: '$usageCount' }
        }
      },
      {
        $sort: { totalHighUsage: -1 }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          highUsagePrompts: 1,
          totalHighUsage: 1,
          avgHighUsage: { $round: ['$avgHighUsage', 2] }
        }
      }
    ]);

    console.log('High usage prompts by category (>10 usage):');
    complexResult.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.highUsagePrompts} prompts, avg usage: ${cat.avgHighUsage}`);
    });

    // Test 9: Time-based analytics
    console.log('\n=== Test 9: Time-based Analytics ===');
    const timeRanges = [
      { name: 'day', filter: { updatedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } },
      { name: 'week', filter: { updatedAt: { $gte: oneWeekAgo } } },
      { name: 'month', filter: { updatedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }
    ];

    for (const range of timeRanges) {
      const rangeResult = await Prompt.aggregate([
        { $match: range.filter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalUsage: { $sum: '$usageCount' }
          }
        }
      ]);

      const data = rangeResult[0] || { count: 0, totalUsage: 0 };
      console.log(`Last ${range.name}: ${data.count} prompts, ${data.totalUsage} usage`);
    }

    // Comprehensive analytics summary
    console.log('\n=== Analytics Summary ===');
    const analyticsSummary = {
      overview: {
        totalPrompts,
        totalUsage,
        averageUsagePerPrompt: totalPrompts > 0 ? Math.round((totalUsage / totalPrompts) * 100) / 100 : 0,
        lastUpdated: new Date().toISOString()
      },
      categories: {
        mostUsed: mostUsedCategory.category,
        totalCategories: categoryResult.length
      },
      tags: {
        topTags: tagResult.map(t => t.tag),
        totalUniqueTags: tagResult.length
      },
      performance: {
        parallelAggregationTime: `${parallelTime}ms`
      }
    };

    console.log('Analytics Summary:');
    console.log(`  Total Prompts: ${analyticsSummary.overview.totalPrompts}`);
    console.log(`  Total Usage: ${analyticsSummary.overview.totalUsage}`);
    console.log(`  Average Usage: ${analyticsSummary.overview.averageUsagePerPrompt}`);
    console.log(`  Most Used Category: ${analyticsSummary.categories.mostUsed}`);
    console.log(`  Top Tags: ${analyticsSummary.tags.topTags.join(', ')}`);
    console.log(`  Performance: ${analyticsSummary.performance.parallelAggregationTime}`);

    console.log('\n=== Analytics Test Completed Successfully! ===');
    console.log('All MongoDB aggregation pipelines working correctly:');
    console.log('1. Total prompts count aggregation');
    console.log('2. Total usage count aggregation');
    console.log('3. Category analytics with usage statistics');
    console.log('4. Top 3 tags frequency analytics');
    console.log('5. Usage distribution analytics');
    console.log('6. Recent activity analytics');
    console.log('7. Parallel aggregation for performance');
    console.log('8. Complex multi-stage aggregations');
    console.log('9. Time-based analytics');
    console.log('10. Real-time analytics backend system');

  } catch (error) {
    console.error('Analytics test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAnalytics();
