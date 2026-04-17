import React, { useState, useEffect } from 'react';
import './index-simple.css';

// Simple components
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalPrompts: 0, totalUsage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Fetch analytics
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/analytics/prompts');
      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-6">Prompt Manager</h2>
        <nav>
          <a href="/dashboard" className="nav-item active">Dashboard</a>
          <a href="/prompts" className="nav-item">Prompts</a>
          <a href="/prompts/create" className="nav-item">Create Prompt</a>
          <a href="/ai/generator" className="nav-item">AI Generator</a>
        </nav>
        
        <div className="mt-auto pt-6">
          <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
          <button onClick={logout} className="btn btn-ghost w-full">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-600">Welcome back, {user?.name}!</div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Prompts</h3>
            <div className="text-3xl font-bold text-blue-600">{stats.totalPrompts}</div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Usage</h3>
            <div className="text-3xl font-bold text-green-600">{stats.totalUsage}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <a href="/prompts/create" className="btn btn-primary">Create Prompt</a>
            <a href="/ai/generator" className="btn btn-secondary">Generate with AI</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromptsPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/prompts');
      const data = await response.json();
      if (data.success) {
        setPrompts(data.data.prompts);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-6">Prompt Manager</h2>
        <nav>
          <a href="/dashboard" className="nav-item">Dashboard</a>
          <a href="/prompts" className="nav-item active">Prompts</a>
          <a href="/prompts/create" className="nav-item">Create Prompt</a>
          <a href="/ai/generator" className="nav-item">AI Generator</a>
        </nav>
        
        <div className="mt-auto pt-6">
          <button onClick={logout} className="btn btn-ghost w-full">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <a href="/prompts/create" className="btn btn-primary">Create Prompt</a>
        </div>

        {prompts.length === 0 ? (
          <div className="empty-state">
            <h3>No prompts yet</h3>
            <p>Get started by creating your first prompt.</p>
            <a href="/prompts/create" className="btn btn-primary">Create Prompt</a>
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
};

const CreatePromptPage = () => {
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
        window.location.href = '/prompts';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-6">Prompt Manager</h2>
        <nav>
          <a href="/dashboard" className="nav-item">Dashboard</a>
          <a href="/prompts" className="nav-item">Prompts</a>
          <a href="/prompts/create" className="nav-item active">Create Prompt</a>
          <a href="/ai/generator" className="nav-item">AI Generator</a>
        </nav>
        
        <div className="mt-auto pt-6">
          <button onClick={logout} className="btn btn-ghost w-full">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Create Prompt</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  className="textarea"
                  value={formData.description}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input" value={formData.category} onChange={handleChange}>
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
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Create Prompt'}
                </button>
                <a href="/prompts" className="btn btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIGeneratorPage = () => {
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-6">Prompt Manager</h2>
        <nav>
          <a href="/dashboard" className="nav-item">Dashboard</a>
          <a href="/prompts" className="nav-item">Prompts</a>
          <a href="/prompts/create" className="nav-item">Create Prompt</a>
          <a href="/ai/generator" className="nav-item active">AI Generator</a>
        </nav>
        
        <div className="mt-auto pt-6">
          <button onClick={logout} className="btn btn-ghost w-full">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">AI Prompt Generator</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="card mb-6">
            <form onSubmit={handleGenerate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  name="topic"
                  className="input"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Enter a topic for the prompt"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input" value={formData.category} onChange={handleChange}>
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
                <select name="tone" className="input" value={formData.tone} onChange={handleChange}>
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

          {generatedPrompt && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Generated Prompt</h3>
              <div className="p-4 bg-gray-50 rounded mb-4">
                <p className="whitespace-pre-wrap">{generatedPrompt}</p>
              </div>
              <div className="flex gap-4">
                <button className="btn btn-primary">Save to Library</button>
                <button className="btn btn-secondary">Copy to Clipboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Component
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/prompts" element={
        <ProtectedRoute>
          <PromptsPage />
        </ProtectedRoute>
      } />
      <Route path="/prompts/create" element={
        <ProtectedRoute>
          <CreatePromptPage />
        </ProtectedRoute>
      } />
      <Route path="/ai/generator" element={
        <ProtectedRoute>
          <AIGeneratorPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
