import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Zap, 
  Brain, 
  Plus,
  ArrowUp,
  ArrowDown,
  Clock,
  Star,
  BarChart3,
  Activity,
  Eye
} from 'lucide-react';

const DashboardModern = ({ user, onCreatePrompt, onNavigate }) => {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalUsage: 0,
    categories: 0,
    recentActivity: 0
  });
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [topPrompts, setTopPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics
      const analyticsResponse = await fetch('http://localhost:3000/api/analytics/prompts');
      const analyticsData = await analyticsResponse.json();
      
      // Fetch prompts
      const promptsResponse = await fetch('http://localhost:3000/api/prompts');
      const promptsData = await promptsResponse.json();
      
      if (analyticsData.success && promptsData.success) {
        const prompts = promptsData.data.prompts || [];
        const overview = analyticsData.data.overview;
        
        setStats({
          totalPrompts: overview.totalPrompts || prompts.length,
          totalUsage: overview.totalUsage || 0,
          categories: [...new Set(prompts.map(p => p.category))].length,
          recentActivity: prompts.filter(p => {
            const createdAt = new Date(p.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdAt > weekAgo;
          }).length
        });
        
        // Set recent prompts
        setRecentPrompts(prompts.slice(0, 5));
        
        // Set top prompts (sorted by usage)
        setTopPrompts(prompts
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 3)
        );
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => {
    const isPositive = trend === 'up';
    
    return (
      <div className={`card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
        isAnimating ? 'fade-in' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{change}%</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    );
  };

  const PromptCard = ({ prompt, index }) => {
    return (
      <div 
        className={`card p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${
          isAnimating ? 'slide-up' : ''
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
              {prompt.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {prompt.description}
            </p>
          </div>
          <div className="ml-3">
            <span className={`category-badge ${prompt.category}`}>
              {prompt.category}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {prompt.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="analytics-badge">
              <Eye className="w-3 h-3" />
              <span>{prompt.usageCount || 0}</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(prompt.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`flex items-center justify-between ${isAnimating ? 'fade-in' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your AI prompts today
          </p>
        </div>
        <button
          onClick={onCreatePrompt}
          className="btn btn-primary btn-lg"
        >
          <Plus className="w-5 h-5" />
          Create Prompt
        </button>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${
        isAnimating ? 'fade-in' : ''
      }`}>
        <StatCard
          title="Total Prompts"
          value={stats.totalPrompts}
          change={12}
          icon={FileText}
          color="bg-blue-500"
          trend="up"
        />
        <StatCard
          title="Total Usage"
          value={stats.totalUsage}
          change={8}
          icon={TrendingUp}
          color="bg-green-500"
          trend="up"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          change={0}
          icon={BarChart3}
          color="bg-purple-500"
          trend="up"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          change={-5}
          icon={Activity}
          color="bg-orange-500"
          trend="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Prompts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Prompts</h2>
            <button
              onClick={() => onNavigate('prompts')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {recentPrompts.length === 0 ? (
              <div className="card p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts yet</h3>
                <p className="text-gray-500 mb-4">
                  Start creating your first AI prompt to see it here
                </p>
                <button
                  onClick={onCreatePrompt}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Prompt
                </button>
              </div>
            ) : (
              recentPrompts.map((prompt, index) => (
                <PromptCard key={prompt._id} prompt={prompt} index={index} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Prompts */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Top Prompts
            </h3>
            <div className="space-y-3">
              {topPrompts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No usage data yet
                </p>
              ) : (
                topPrompts.map((prompt, index) => (
                  <div key={prompt._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prompt.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {prompt.usageCount || 0} uses
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={onCreatePrompt}
                className="btn btn-primary btn-full"
              >
                <Plus className="w-4 h-4" />
                New Prompt
              </button>
              <button
                onClick={() => onNavigate('ai')}
                className="btn btn-secondary btn-full"
              >
                <Brain className="w-4 h-4" />
                AI Generator
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="btn btn-ghost btn-full"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </button>
            </div>
          </div>

          {/* AI Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 text-purple-500 mr-2" />
              AI Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OpenAI API</span>
                <span className="badge badge-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Limit</span>
                <span className="text-sm font-medium text-gray-900">85/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
