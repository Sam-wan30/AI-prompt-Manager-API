import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { promptsAPI } from '../services/api';
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CreatePromptPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, executeApiCall, clearError } = useApi();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptText: '',
    category: 'marketing',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'writing',
    'coding',
    'marketing',
    'business',
    'education',
    'creative',
    'research',
    'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    } else if (formData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (!formData.description.trim()) {
      errors.push('Description is required');
    } else if (formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    if (!formData.promptText.trim()) {
      errors.push('Prompt text is required');
    } else if (formData.promptText.trim().length < 20) {
      errors.push('Prompt text must be at least 20 characters');
    }

    if (formData.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    try {
      const result = await executeApiCall(promptsAPI.create, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        promptText: formData.promptText.trim(),
        category: formData.category,
        tags: formData.tags
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/prompts');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Prompt Created Successfully!</h3>
          <p className="text-gray-600 mb-6">Your prompt has been saved to the library.</p>
          <button
            onClick={() => navigate('/prompts')}
            className="btn btn-primary"
          >
            View Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/prompts')}
            className="btn btn-ghost mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Prompt</h1>
            <p className="text-gray-600 mt-1">Add a new AI prompt to your library</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter prompt title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="textarea"
              placeholder="Describe what this prompt does"
              required
            />
          </div>

          {/* Prompt Text */}
          <div>
            <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Text *
            </label>
            <textarea
              id="promptText"
              name="promptText"
              value={formData.promptText}
              onChange={handleChange}
              rows={6}
              className="textarea"
              placeholder="Enter the actual prompt text that will be used with AI models"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  placeholder="Add a tag and press Enter"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  className="btn btn-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length === 0 && (
                <p className="text-sm text-gray-500">Add at least one tag to categorize your prompt</p>
              )}
              {formData.tags.length >= 10 && (
                <p className="text-sm text-amber-600">Maximum 10 tags allowed</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/prompts')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Create Prompt
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for creating effective prompts:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Be specific and clear about what you want the AI to do</li>
          <li>Provide context and constraints to guide the AI's response</li>
          <li>Use descriptive titles that clearly indicate the prompt's purpose</li>
          <li>Add relevant tags to make your prompts easy to find</li>
          <li>Consider the target audience and tone when writing your prompt</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePromptPage;
