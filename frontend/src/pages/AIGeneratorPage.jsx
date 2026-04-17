import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { aiAPI, promptsAPI } from '../services/api';
import {
  Zap,
  Save,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  Wand2,
  Sparkles
} from 'lucide-react';

const AIGeneratorPage = () => {
  const navigate = useNavigate();
  const { loading, error, executeApiCall, clearError } = useApi();
  const [formData, setFormData] = useState({
    topic: '',
    category: 'marketing',
    tone: 'professional'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const tones = [
    'professional',
    'casual',
    'formal',
    'friendly',
    'technical',
    'creative',
    'academic',
    'conversational'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(false);
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic for the prompt');
      return;
    }

    setGeneratedPrompt('');
    clearError();

    try {
      const result = await executeApiCall(aiAPI.generate,
        formData.topic.trim(),
        formData.category,
        formData.tone
      );

      if (result) {
        setGeneratedPrompt(result.prompt);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt.trim()) {
      setError('No prompt to save');
      return;
    }

    try {
      const promptData = {
        title: `${formData.topic.charAt(0).toUpperCase() + formData.topic.slice(1)} Prompt`,
        description: `AI-generated prompt for ${formData.topic} in ${formData.category} category`,
        promptText: generatedPrompt,
        category: formData.category,
        tags: ['ai-generated', formData.category, formData.topic.toLowerCase().replace(/\s+/g, '-')]
      };

      const result = await executeApiCall(promptsAPI.create, promptData);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/prompts');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  if (success && generatedPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Prompt Generated Successfully!</h3>
          <p className="text-gray-600 mb-6">Your AI-generated prompt is ready to use.</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSuccess(false)}
              className="btn btn-secondary"
            >
              Generate Another
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 mr-3 text-primary-600" />
            AI Prompt Generator
          </h1>
          <p className="text-gray-600 mt-1">Create powerful prompts using AI technology</p>
        </div>
        <button
          onClick={() => navigate('/prompts')}
          className="btn btn-secondary"
        >
          Back to Library
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-primary-600" />
              Prompt Configuration
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Topic */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <textarea
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  rows={3}
                  className="textarea"
                  placeholder="What should the AI prompt be about? (e.g., 'Social media marketing strategy', 'Python code review checklist')"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="input"
                >
                  {tones.map(tone => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !formData.topic.trim()}
                className="btn btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Prompt
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
              Tips for Better Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">1.</span>
                Be specific about the topic and context
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">2.</span>
                Choose the category that best fits your use case
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">3.</span>
                Select a tone that matches your desired output style
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">4.</span>
                Include specific requirements or constraints in your topic
              </li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {generatedPrompt && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Generated Prompt
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedPrompt}
                </pre>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Library
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="btn btn-secondary flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!generatedPrompt && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600 mb-6">
                Configure your prompt settings and click "Generate Prompt" to create an AI-powered prompt
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Powered by OpenAI GPT-3.5 Turbo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
