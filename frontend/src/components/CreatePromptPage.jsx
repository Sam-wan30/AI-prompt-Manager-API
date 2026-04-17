import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

const CreatePromptPage = ({ user, onNavigate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptText: '',
    category: 'writing',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onNavigate('prompts');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('prompts')}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Prompts
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Prompt</h1>
            <p className="text-gray-600">Create a new AI prompt for your library</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter prompt title"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe what this prompt does"
              rows={3}
            />
          </div>

          <div>
            <label className="form-label">Prompt Text</label>
            <textarea
              name="promptText"
              className="form-textarea"
              value={formData.promptText}
              onChange={handleChange}
              required
              placeholder="Enter the actual prompt text"
              rows={6}
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
              <option value="writing">Writing</option>
              <option value="coding">Coding</option>
              <option value="marketing">Marketing</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          <div>
            <label className="form-label">Tags</label>
            <input
              type="text"
              name="tags"
              className="form-input"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Create Prompt'}
            </button>
            <button type="button" onClick={() => onNavigate('prompts')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromptPage;
