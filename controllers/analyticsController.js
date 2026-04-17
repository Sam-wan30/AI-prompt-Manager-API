/**
 * Analytics Controller - Production-level analytics backend
 * Uses MongoDB aggregation pipelines for real-time analytics
 */

const Prompt = require('../models/Prompt');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get comprehensive prompt analytics
 * Uses MongoDB aggregation pipelines for efficient data processing
 */
const getPromptAnalytics = asyncHandler(async (req, res) => {
  logger.info('Generating prompt analytics');

  // Execute multiple aggregation pipelines in parallel for optimal performance
  const [
    totalPromptsResult,
    totalUsageResult,
    categoryAnalyticsResult,
    tagAnalyticsResult,
    usageDistributionResult,
    recentActivityResult
  ] = await Promise.all([
    // 1. Total prompts count
    getTotalPromptsCount(),
    
    // 2. Total usage count (sum of all usageCount)
    getTotalUsageCount(),
    
    // 3. Most used category analytics
    getCategoryAnalytics(),
    
    // 4. Top 3 tags frequency analytics
    getTagAnalytics(),
    
    // 5. Usage distribution analytics
    getUsageDistribution(),
    
    // 6. Recent activity analytics
    getRecentActivity()
  ]);

  // Build comprehensive analytics response
  const analytics = {
    overview: {
      totalPrompts: totalPromptsResult.count,
      totalUsage: totalUsageResult.totalUsage,
      averageUsagePerPrompt: totalPromptsResult.count > 0 ? 
        Math.round((totalUsageResult.totalUsage / totalPromptsResult.count) * 100) / 100 : 0,
      lastUpdated: new Date().toISOString()
    },
    categories: categoryAnalyticsResult,
    tags: tagAnalyticsResult,
    usage: usageDistributionResult,
    activity: recentActivityResult,
    insights: generateInsights(
      totalPromptsResult,
      totalUsageResult,
      categoryAnalyticsResult,
      tagAnalyticsResult
    )
  };

  logger.info('Analytics generated successfully', {
    totalPrompts: analytics.overview.totalPrompts,
    totalUsage: analytics.overview.totalUsage,
    topCategory: analytics.categories.mostUsed?.category,
    topTag: analytics.tags.topTags[0]?.tag
  });

  res.json(
    successResponse(analytics, 'Analytics retrieved successfully')
  );
});

/**
 * Get total prompts count
 */
const getTotalPromptsCount = async () => {
  const result = await Prompt.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ]);

  return { count: result[0]?.count || 0 };
};

/**
 * Get total usage count (sum of all usageCount)
 */
const getTotalUsageCount = async () => {
  const result = await Prompt.aggregate([
    {
      $group: {
        _id: null,
        totalUsage: { $sum: '$usageCount' }
      }
    }
  ]);

  return { totalUsage: result[0]?.totalUsage || 0 };
};

/**
 * Get category analytics with usage statistics
 */
const getCategoryAnalytics = async () => {
  const result = await Prompt.aggregate([
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
        minUsage: 1,
        usagePercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$totalUsage', { $sum: '$totalUsage' }] },
                100
              ]
            },
            2
          ]
        }
      }
    }
  ]);

  const mostUsed = result[0] || null;
  const leastUsed = result[result.length - 1] || null;

  return {
    distribution: result,
    mostUsed,
    leastUsed,
    totalCategories: result.length
  };
};

/**
 * Get top 3 tags frequency analytics
 */
const getTagAnalytics = async () => {
  const result = await Prompt.aggregate([
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

  return {
    topTags: result,
    totalUniqueTags: result.length
  };
};

/**
 * Get usage distribution analytics
 */
const getUsageDistribution = async () => {
  const result = await Prompt.aggregate([
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
        totalUsage: 1,
        percentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$count', { $sum: '$count' }] },
                100
              ]
            },
            2
          ]
        }
      }
    }
  ]);

  // Get unused prompts
  const unusedCount = await Prompt.countDocuments({ usageCount: 0 });
  const usedCount = await Prompt.countDocuments({ usageCount: { $gt: 0 } });

  return {
    distribution: result,
    unused: {
      count: unusedCount,
      percentage: Math.round((unusedCount / (unusedCount + usedCount)) * 100)
    },
    used: {
      count: usedCount,
      percentage: Math.round((usedCount / (unusedCount + usedCount)) * 100)
    }
  };
};

/**
 * Get recent activity analytics
 */
const getRecentActivity = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dayResult, weekResult, monthResult] = await Promise.all([
    // Last 24 hours
    Prompt.aggregate([
      {
        $match: { updatedAt: { $gte: oneDayAgo } }
      },
      {
        $group: {
          _id: null,
          promptsUpdated: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]),
    
    // Last 7 days
    Prompt.aggregate([
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
    ]),
    
    // Last 30 days
    Prompt.aggregate([
      {
        $match: { updatedAt: { $gte: oneMonthAgo } }
      },
      {
        $group: {
          _id: null,
          promptsUpdated: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ])
  ]);

  return {
    last24Hours: {
      promptsUpdated: dayResult[0]?.promptsUpdated || 0,
      totalUsage: dayResult[0]?.totalUsage || 0
    },
    last7Days: {
      promptsUpdated: weekResult[0]?.promptsUpdated || 0,
      totalUsage: weekResult[0]?.totalUsage || 0
    },
    last30Days: {
      promptsUpdated: monthResult[0]?.promptsUpdated || 0,
      totalUsage: monthResult[0]?.totalUsage || 0
    }
  };
};

/**
 * Generate insights from analytics data
 */
const generateInsights = (totalPrompts, totalUsage, categoryAnalytics, tagAnalytics) => {
  const insights = [];

  // Usage insights
  if (totalUsage.totalUsage === 0) {
    insights.push({
      type: 'warning',
      message: 'No prompts have been used yet. Consider promoting prompt usage.',
      recommendation: 'Implement usage tracking and user engagement features.'
    });
  }

  // Category insights
  if (categoryAnalytics.mostUsed && categoryAnalytics.leastUsed) {
    const usageRatio = categoryAnalytics.mostUsed.totalUsage / categoryAnalytics.leastUsed.totalUsage;
    if (usageRatio > 10) {
      insights.push({
        type: 'insight',
        message: `${categoryAnalytics.mostUsed.category} category is significantly more popular than ${categoryAnalytics.leastUsed.category}.`,
        recommendation: 'Consider expanding content in popular categories or improving less popular ones.'
      });
    }
  }

  // Tag insights
  if (tagAnalytics.topTags.length > 0) {
    const topTag = tagAnalytics.topTags[0];
    if (topTag.frequency > totalPrompts.count * 0.5) {
      insights.push({
        type: 'insight',
        message: `"${topTag.tag}" is used in over 50% of prompts, indicating high relevance.`,
        recommendation: 'Create more content around this popular tag.'
      });
    }
  }

  // Engagement insights
  const avgUsage = totalPrompts.count > 0 ? totalUsage.totalUsage / totalPrompts.count : 0;
  if (avgUsage < 1) {
    insights.push({
      type: 'warning',
      message: 'Average usage per prompt is less than 1. User engagement may be low.',
      recommendation: 'Improve prompt quality and user experience.'
    });
  } else if (avgUsage > 10) {
    insights.push({
      type: 'success',
      message: 'High user engagement with average usage over 10 per prompt.',
      recommendation: 'Continue maintaining quality and consider expanding the prompt library.'
    });
  }

  return insights;
};

/**
 * Get detailed analytics for a specific time range
 */
const getTimeRangeAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = 'all' } = req.query;
  
  logger.info('Generating time-range analytics', { timeRange });

  let dateFilter = {};
  const now = new Date();
  
  switch (timeRange) {
    case 'day':
      dateFilter = { updatedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
      break;
    case 'week':
      dateFilter = { updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { updatedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      break;
    default:
      dateFilter = {};
  }

  const [promptsResult, usageResult] = await Promise.all([
    Prompt.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]),
    Prompt.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      { $sort: { totalUsage: -1 } },
      { $limit: 5 }
    ])
  ]);

  const analytics = {
    timeRange,
    period: {
      start: dateFilter.updatedAt?.$gte || 'all time',
      end: now.toISOString()
    },
    summary: {
      totalPrompts: promptsResult[0]?.count || 0,
      totalUsage: promptsResult[0]?.totalUsage || 0
    },
    topCategories: usageResult
  };

  res.json(
    successResponse(analytics, `Analytics for ${timeRange} time range`)
  );
});

/**
 * Get comprehensive user analytics
 * @route   GET /api/analytics/users
 * @access  Private (Admin only)
 */
const getUserAnalytics = asyncHandler(async (req, res) => {
  logger.info('Generating user analytics');

  const [
    userStats,
    userGrowth,
    userActivity,
    userRoles
  ] = await Promise.all([
    // User statistics
    User.getStats(),
    
    // User growth over time
    User.getGrowthStats(30),
    
    // User activity by login count
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $gt: ['$loginCount', 0] }, 1, 0]
            }
          },
          avgLoginCount: { $avg: '$loginCount' },
          totalLogins: { $sum: '$loginCount' }
        }
      }
    ]),
    
    // User roles distribution
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          role: '$_id',
          count: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$count', { $sum: '$count' }] },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ])
  ]);

  const analytics = {
    overview: {
      ...userStats,
      ...userActivity[0],
      lastUpdated: new Date().toISOString()
    },
    growth: userGrowth,
    roles: userRoles,
    insights: generateUserInsights(userStats, userGrowth, userActivity[0])
  };

  logger.info('User analytics generated successfully', {
    totalUsers: analytics.overview.totalUsers,
    activeUsers: analytics.overview.activeUsers
  });

  res.json(
    successResponse(analytics, 'User analytics retrieved successfully')
  );
});

/**
 * Generate insights from user analytics data
 */
const generateUserInsights = (userStats, userGrowth, userActivity) => {
  const insights = [];

  // User growth insights
  if (userGrowth.length > 0) {
    const recentGrowth = userGrowth.slice(-7); // Last 7 days
    const totalRecentUsers = recentGrowth.reduce((sum, day) => sum + day.count, 0);
    
    if (totalRecentUsers > userStats.totalUsers * 0.1) {
      insights.push({
        type: 'success',
        message: `Strong user growth with ${totalRecentUsers} new users in the last 7 days.`,
        recommendation: 'Continue marketing efforts and user onboarding improvements.'
      });
    } else if (totalRecentUsers === 0) {
      insights.push({
        type: 'warning',
        message: 'No new user registrations in the last 7 days.',
        recommendation: 'Consider promotional campaigns or feature improvements to attract new users.'
      });
    }
  }

  // User engagement insights
  const engagementRate = userActivity.totalUsers > 0 ? 
    (userActivity.activeUsers / userActivity.totalUsers) * 100 : 0;
  
  if (engagementRate < 50) {
    insights.push({
      type: 'warning',
      message: `Low user engagement rate: ${Math.round(engagementRate)}% of users have logged in.`,
      recommendation: 'Improve user onboarding and send engagement emails.'
    });
  } else if (engagementRate > 80) {
    insights.push({
      type: 'success',
      message: `High user engagement rate: ${Math.round(engagementRate)}% of users are active.`,
      recommendation: 'Maintain current engagement strategies and consider advanced features.'
    });
  }

  // Admin user insights
  const adminCount = userStats.adminUsers || 0;
  if (adminCount === 0 && userStats.totalUsers > 10) {
    insights.push({
      type: 'info',
      message: 'No admin users found. Consider assigning admin roles for better management.',
      recommendation: 'Promote trusted users to admin role for system management.'
    });
  }

  return insights;
};

module.exports = {
  getPromptAnalytics,
  getTimeRangeAnalytics,
  getUserAnalytics
};
