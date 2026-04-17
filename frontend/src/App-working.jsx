import React, { useState, useEffect } from 'react';
import './index-simple.css';

// Simple working App without Router
const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    title: '',
    description: '',
    promptText: '',
    category: 'writing',
    tags: '',
    topic: '',
    tone: 'professional'
  });

  // Check for existing user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('dashboard');
      fetchPrompts();
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setCurrentPage('dashboard');
        fetchPrompts();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setCurrentPage('dashboard');
        fetchPrompts();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
    setPrompts([]);
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/prompts');
      const data = await response.json();
      if (data.success) {
        setPrompts(data.data.prompts || []);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          promptText: formData.promptText,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentPage('prompts');
        fetchPrompts();
        // Reset form
        setFormData({
          ...formData,
          title: '',
          description: '',
          promptText: '',
          tags: ''
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          category: formData.category,
          tone: formData.tone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show the generated prompt in an alert for now
        alert('Generated Prompt:\n\n' + data.data.prompt);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderNavigation = () => (
    <div className="sidebar">
      <h2 className="text-xl font-bold mb-6">Prompt Manager</h2>
      <nav>
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentPage('prompts')} 
          className={`nav-item ${currentPage === 'prompts' ? 'active' : ''}`}
        >
          Prompts
        </button>
        <button 
          onClick={() => setCurrentPage('create')} 
          className={`nav-item ${currentPage === 'create' ? 'active' : ''}`}
        >
          Create Prompt
        </button>
        <button 
          onClick={() => setCurrentPage('ai')} 
          className={`nav-item ${currentPage === 'ai' ? 'active' : ''}`}
        >
          AI Generator
        </button>
      </nav>
      
      <div className="mt-auto pt-6">
        <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
        <button onClick={handleLogout} className="btn btn-ghost w-full">Logout</button>
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <button 
              onClick={() => setCurrentPage('register')} 
              className="text-blue-600 hover:underline ml-1"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderRegisterPage = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <button 
              onClick={() => setCurrentPage('login')} 
              className="text-blue-600 hover:underline ml-1"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex h-screen bg-gray-50">
      {renderNavigation()}
      <div className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-600">Welcome back, {user?.name}!</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Prompts</h3>
            <div className="text-3xl font-bold text-blue-600">{prompts.length}</div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="text-3xl font-bold text-green-600">
              {[...new Set(prompts.map(p => p.category))].length}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Prompts</h3>
          {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No prompts yet. <button onClick={() => setCurrentPage('create')} className="text-blue-600 hover:underline">Create your first prompt</button>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.slice(0, 5).map((prompt) => (
                <div key={prompt._id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{prompt.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-primary">{prompt.category}</span>
                    <span className="text-xs text-gray-500">Used {prompt.usageCount || 0} times</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPromptsPage = () => (
    <div className="flex h-screen bg-gray-50">
      {renderNavigation()}
      <div className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <button onClick={() => setCurrentPage('create')} className="btn btn-primary">Create Prompt</button>
        </div>

        {prompts.length === 0 ? (
          <div className="empty-state">
            <h3>No prompts yet</h3>
            <p>Get started by creating your first prompt.</p>
            <button onClick={() => setCurrentPage('create')} className="btn btn-primary">Create Prompt</button>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Usage</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt) => (
                  <tr key={prompt._id}>
                    <td>{prompt.title}</td>
                    <td>
                      <span className="badge badge-primary">{prompt.category}</span>
                    </td>
                    <td>{prompt.usageCount || 0}</td>
                    <td>{new Date(prompt.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreatePage = () => (
    <div className="flex h-screen bg-gray-50">
      {renderNavigation()}
      <div className="main-content">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Create Prompt</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleCreatePrompt}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  className="textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Prompt Text</label>
                <textarea
                  name="promptText"
                  className="textarea"
                  rows="6"
                  value={formData.promptText}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input" value={formData.category} onChange={handleInputChange}>
                  <option value="writing">Writing</option>
                  <option value="coding">Coding</option>
                  <option value="marketing">Marketing</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="input"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Create Prompt'}
                </button>
                <button type="button" onClick={() => setCurrentPage('prompts')} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIGeneratorPage = () => (
    <div className="flex h-screen bg-gray-50">
      {renderNavigation()}
      <div className="main-content">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">AI Prompt Generator</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleGenerateAI}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  name="topic"
                  className="input"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Enter a topic for the prompt"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input" value={formData.category} onChange={handleInputChange}>
                  <option value="writing">Writing</option>
                  <option value="coding">Coding</option>
                  <option value="marketing">Marketing</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tone</label>
                <select name="tone" className="input" value={formData.tone} onChange={handleInputChange}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Generate Prompt'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current page
  if (currentPage === 'login') return renderLoginPage();
  if (currentPage === 'register') return renderRegisterPage();
  if (currentPage === 'dashboard') return renderDashboard();
  if (currentPage === 'prompts') return renderPromptsPage();
  if (currentPage === 'create') return renderCreatePage();
  if (currentPage === 'ai') return renderAIGeneratorPage();
  
  return renderLoginPage();
};

export default App;
