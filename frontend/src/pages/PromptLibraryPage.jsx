import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { promptsAPI } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Tag,
  MoreVertical,
  ChevronDown,
  X,
  RefreshCw
} from 'lucide-react';

const PromptLibraryPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' });
  const { loading, error, executeApiCall, clearError } = useApi();
  const navigate = useNavigate();

  const categories = [
    'all',
    'writing',
    'coding',
    'marketing',
    'business',
    'education',
    'creative',
    'research',
    'other'
  ];

  const commonTags = [
    'ai',
    'automation',
    'productivity',
    'analysis',
    'creative',
    'technical',
    'business',
    'education'
  ];

  const fetchPrompts = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      };

      if (searchTerm) {
        params.q = searchTerm;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }

      const result = await executeApiCall(promptsAPI.getAll, params);
      
      if (result) {
        setPrompts(result.prompts);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [currentPage, searchTerm, selectedCategory, selectedTags, sortConfig]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
  };

  const handleDelete = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        const result = await executeApiCall(promptsAPI.delete, promptId);
        if (result) {
          fetchPrompts();
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    }
  };

  const handleUsePrompt = async (promptId) => {
    try {
      const result = await executeApiCall(promptsAPI.incrementUsage, promptId);
      if (result) {
        fetchPrompts();
      }
    } catch (error) {
      console.error('Error using prompt:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const getBadgeColor = (category) => {
    const colors = {
      writing: 'badge-primary',
      coding: 'badge-success',
      marketing: 'badge-warning',
      business: 'badge-secondary',
      education: 'badge-info',
      creative: 'badge-primary',
      research: 'badge-success',
      other: 'badge-secondary'
    };
    return colors[category] || 'badge-secondary';
  };

  if (loading && prompts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
          <p className="text-gray-600 mt-1">Manage and organize your AI prompts</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchPrompts}
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
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={handleSearch}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(selectedTags.length > 0) && (
              <span className="ml-2 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filter by Tags</h3>
              <button
                onClick={clearFilters}
                className="btn btn-ghost text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {prompts.length} of {totalPages * 10} prompts
        </p>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={`${sortConfig.field}-${sortConfig.order}`}
            onChange={(e) => handleSort(e.target.value.split('-')[0])}
            className="input text-sm"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="usageCount-desc">Most Used</option>
            <option value="usageCount-asc">Least Used</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Category</th>
                <th className="table-header">Tags</th>
                <th className="table-header">Usage</th>
                <th className="table-header">Created</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr key={prompt._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{prompt.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {prompt.description}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getBadgeColor(prompt.category)}`}>
                      {prompt.category}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="badge badge-secondary text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {prompt.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{prompt.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-medium">{prompt.usageCount}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/prompts/${prompt._id}`)}
                        className="btn btn-ghost p-1"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/prompts/${prompt._id}/edit`)}
                        className="btn btn-ghost p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUsePrompt(prompt._id)}
                        className="btn btn-ghost p-1"
                        title="Use Prompt"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prompt._id)}
                        className="btn btn-ghost p-1 text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {prompts.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedTags.length > 0
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first prompt'}
          </p>
          <button
            onClick={() => navigate('/prompts/create')}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'btn btn-secondary'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptLibraryPage;
