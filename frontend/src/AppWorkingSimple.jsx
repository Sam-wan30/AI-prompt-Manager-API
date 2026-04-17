import React, { useState, useEffect } from 'react';

const AppWorkingSimple = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setCurrentPage('dashboard');
        fetchPrompts();
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
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
    }
  };

  const handleLogin = async (e) => {
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  if (currentPage === 'login') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            AI Prompt Manager
          </h2>
          
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="demo@example.com"
                value={email}
                onChange={handleEmailChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="demo123456"
                value={password}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Demo Credentials:
            </div>
            <div>Email: demo@example.com</div>
            <div>Password: demo123456</div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
          AI Prompt Manager
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Welcome, {user?.name}!
        </h2>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {prompts.length}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total Prompts
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {[...new Set(prompts.map(p => p.category))].length}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Categories
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total Usage
            </p>
          </div>
        </div>

        {/* Recent Prompts */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Recent Prompts
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {prompts.slice(0, 6).map((prompt) => (
              <div
                key={prompt._id}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {prompt.title}
                </h4>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {prompt.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {prompt.category}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Used {prompt.usageCount || 0} times
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppWorkingSimple;
