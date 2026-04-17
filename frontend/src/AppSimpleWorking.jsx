import React, { useState, useEffect } from 'react';
import './index-simple.css';

// Simple working components
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
        window.location.reload(); // Reload to trigger dashboard
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account? Register for free
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ user, onLogout }) => {
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
        setPrompts(data.data.prompts || []);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Prompt Manager</h1>
          <button onClick={onLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">Here's what's happening with your AI prompts today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Prompts</h3>
            <div className="text-3xl font-bold text-blue-600">{prompts.length}</div>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
            <div className="text-3xl font-bold text-green-600">
              {[...new Set(prompts.map(p => p.category))].length}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Usage</h3>
            <div className="text-3xl font-bold text-purple-600">
              {prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
            </div>
          </div>
        </div>

        {/* Recent Prompts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Prompts</h2>
          {prompts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 mb-4">No prompts yet</p>
              <p className="text-gray-500">Create your first prompt to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.slice(0, 6).map((prompt) => (
                <div key={prompt._id} className="card p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{prompt.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                  <div className="flex items-center justify-between">
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
};

const AppSimpleWorking = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} />;
};

export default AppSimpleWorking;
