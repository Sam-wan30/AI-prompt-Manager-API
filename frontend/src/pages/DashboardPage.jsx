import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { promptsAPI, analyticsAPI } from '../services/api';
import {
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Zap,
  Target,
  Activity,
  RefreshCw
} from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalUsage: 0,
    mostUsedCategory: null,
    topPrompts: [],
    recentActivity: [],
  });
  const { user, logout } = useAuth();
  const { loading, error, executeApiCall, clearError } = useApi();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [analyticsResult, topPromptsResult] = await Promise.all([
        executeApiCall(analyticsAPI.getPromptAnalytics),
        executeApiCall(promptsAPI.getTopUsed)
      ]);

      if (analyticsResult && analyticsResult.success) {
        setStats(prev => ({
          ...prev,
          totalPrompts: analyticsResult.data.overview.totalPrompts,
          totalUsage: analyticsResult.data.overview.totalUsage,
          mostUsedCategory: analyticsResult.data.categories.mostUsed,
          recentActivity: analyticsResult.data.activity,
        }));
      }

      if (topPromptsResult && topPromptsResult.success) {
        setStats(prev => ({
          ...prev,
          topPrompts: topPromptsResult.data.prompts || []
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    return (
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="text-gray-600 mt-1">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchDashboardData();
            }}
            className="btn btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/prompts/create')}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </button>
          <button
            onClick={() => navigate('/ai/generator')}
            className="btn btn-secondary flex items-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            AI Generator
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Prompts"
          value={stats.totalPrompts}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Total Usage"
          value={stats.totalUsage}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Top Category"
          value={stats.mostUsedCategory?.category || 'N/A'}
          icon={BarChart3}
          color="info"
        />
        <StatCard
          title="Avg Usage/Prompt"
          value={stats.totalPrompts > 0 ? Math.round(stats.totalUsage / stats.totalPrompts) : 0}
          icon={Activity}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Used Prompts */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Used Prompts</h2>
              <button className="btn btn-ghost">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {stats.topPrompts.slice(0, 5).map((prompt, index) => (
                <div key={prompt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{prompt.title}</p>
                      <p className="text-xs text-gray-500">{prompt.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{prompt.usageCount}</p>
                    <p className="text-xs text-gray-500">uses</p>
                  </div>
                </div>
              ))}
              {stats.topPrompts.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No prompts yet</p>
                  <button
                    onClick={() => navigate('/prompts/create')}
                    className="btn btn-primary mt-4"
                  >
                    Create Your First Prompt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="btn btn-ghost">
                <Clock className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last 24 Hours</p>
                    <p className="text-xs text-gray-500">Recent activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stats.recentActivity?.last24Hours?.totalUsage || 0}</p>
                  <p className="text-xs text-gray-500">uses</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last 7 Days</p>
                    <p className="text-xs text-gray-500">Weekly activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stats.recentActivity?.last7Days?.totalUsage || 0}</p>
                  <p className="text-xs text-gray-500">uses</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last 30 Days</p>
                    <p className="text-xs text-gray-500">Monthly activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stats.recentActivity?.last30Days?.totalUsage || 0}</p>
                  <p className="text-xs text-gray-500">uses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/prompts/create')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-medium text-primary-600">Create New Prompt</span>
              </button>
              <button
                onClick={() => navigate('/ai/generator')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Zap className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-medium text-primary-600">Generate with AI</span>
              </button>
              <button
                onClick={() => navigate('/prompts')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Search className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-medium text-primary-600">Browse Library</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
