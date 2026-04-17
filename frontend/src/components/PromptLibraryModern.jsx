import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Zap,
  Calendar,
  TrendingUp,
  Star,
  MoreVertical,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';

const PromptLibraryModern = ({ onCreatePrompt, onNavigate }) => {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'writing', label: 'Writing' },
    { value: 'coding', label: 'Coding' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'creative', label: 'Creative' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'title', label: 'Title' },
    { value: 'usageCount', label: 'Usage Count' },
    { value: 'category', label: 'Category' }
  ];

  useEffect(() => {
    setIsAnimating(true);
    fetchPrompts();
  }, []);

  useEffect(() => {
    filterAndSortPrompts();
  }, [prompts, searchQuery, selectedCategory, sortBy, sortOrder]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/prompts');
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.data.prompts || []);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPrompts = () => {
    let filtered = [...prompts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Sort prompts
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPrompts(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/prompts/${promptId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPrompts(prompts.filter(p => p._id !== promptId));
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const handleUsePrompt = async (promptId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/prompts/${promptId}/use`, {
        method: 'POST'
      });

      if (response.ok) {
        // Increment usage count locally
        setPrompts(prompts.map(p => 
          p._id === promptId 
            ? { ...p, usageCount: (p.usageCount || 0) + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to use prompt:', error);
    }
  };

  const PromptCard = ({ prompt, index }) => {
    return (
      <div 
        className={`prompt-card ${
          isAnimating ? 'slide-up' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Header */}
        <div className="prompt-card-header">
          <div className="flex-1">
            <h3 className="prompt-card-title">
              {prompt.title}
            </h3>
            <p className="prompt-card-description">
              {prompt.description}
            </p>
          </div>
        </div>

        {/* Tags and Category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`category-badge ${prompt.category}`}>
            {prompt.category}
          </span>
          {prompt.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag-pill">
              {tag}
            </span>
          ))}
          {prompt.tags?.length > 3 && (
            <span className="text-xs text-gray-500">+{prompt.tags.length - 3} more</span>
          )}
        </div>

        {/* Footer */}
        <div className="prompt-card-footer">
          <div className="prompt-card-meta">
            <div className="analytics-badge">
              <Eye className="w-3 h-3" />
              <span>{prompt.usageCount || 0}</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(prompt.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="prompt-card-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUsePrompt(prompt._id);
              }}
              className="action-button use-prompt"
              title="Use prompt"
            >
              <Zap className="w-3 h-3" />
              Use
            </button>
            <div className="icon-action edit" title="Edit">
              <Edit className="w-4 h-4" />
            </div>
            <div 
              className="icon-action delete" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(prompt._id);
              }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PromptListItem = ({ prompt, index }) => {
    return (
      <div 
        className={`card hover:shadow-md transition-all duration-300 ${
          isAnimating ? 'slide-up' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {prompt.title}
                </h3>
                <span className={`category-badge ${prompt.category}`}>
                  {prompt.category}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-1 mb-2">
                {prompt.description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {prompt.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleUsePrompt(prompt._id)}
                className="action-button use-prompt"
                title="Use prompt"
              >
                <Zap className="w-3 h-3" />
                Use
              </button>
              <div className="icon-action edit" title="Edit">
                <Edit className="w-4 h-4" />
              </div>
              <div 
                className="icon-action delete" 
                onClick={() => handleDelete(prompt._id)}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </div>
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
          <p className="text-gray-500">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isAnimating ? 'fade-in' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Library</h1>
          <p className="text-gray-600">
            Manage and organize your AI prompts
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

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showFilters && (
                <div className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.value
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button className="btn btn-secondary flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Sort</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="form-input text-sm py-1 px-2"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompts Grid/List */}
      {filteredPrompts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first AI prompt'
            }
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredPrompts.map((prompt, index) => (
            viewMode === 'grid' ? (
              <PromptCard key={prompt._id} prompt={prompt} index={index} />
            ) : (
              <PromptListItem key={prompt._id} prompt={prompt} index={index} />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptLibraryModern;
