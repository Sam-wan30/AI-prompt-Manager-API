

himport React, { useState } from 'react';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';

const AIGeneratorPage = ({ user, onNavigate }) => {
  const [formData, setFormData] = useState({
    topic: '',
    category: 'marketing',
    tone: 'professional'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedPrompt('');

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedPrompt(data.data.prompt);
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
            onClick={() => onNavigate('dashboard')}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Generator</h1>
            <p className="text-gray-600">Generate prompts using AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            Generate Prompt
          </h2>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="form-label">Topic</label>
              <input
                type="text"
                name="topic"
                className="form-input"
                value={formData.topic}
                onChange={handleChange}
                required
                placeholder="Enter a topic for the prompt"
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
              <label className="form-label">Tone</label>
              <select name="tone" className="form-select" value={formData.tone} onChange={handleChange}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Prompt
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Output */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Prompt</h2>
          
          {generatedPrompt ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="whitespace-pre-wrap text-gray-700">
                  {generatedPrompt}
                </p>
              </div>
              <div className="flex gap-4">
                <button className="btn btn-primary">
                  Save to Library
                </button>
                <button className="btn btn-secondary">
                  Copy to Clipboard
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompt generated yet</h3>
              <p className="text-gray-500 mb-4">
                Fill in the form and click generate to create an AI prompt
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
