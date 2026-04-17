import React, { useState, useEffect } from 'react';

const AppComplete = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Prompt form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPromptText, setFormPromptText] = useState('');
  const [formCategory, setFormCategory] = useState('coding');
  const [formTags, setFormTags] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/prompts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPassword 
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
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError('Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match');
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: registerName,
          email: registerEmail, 
          password: registerPassword 
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
        setRegisterError(data.message);
      }
    } catch (err) {
      setRegisterError('Connection error. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const response = await fetch('http://localhost:3000/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          promptText: formPromptText,
          category: formCategory,
          tags: tagsArray
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear form
        setFormTitle('');
        setFormDescription('');
        setFormPromptText('');
        setFormCategory('coding');
        setFormTags('');
        setFormError('');
        
        // Go back to prompts page
        setCurrentPage('prompts');
        fetchPrompts();
      } else {
        setFormError(data.message);
      }
    } catch (err) {
      setFormError('Connection error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePrompt = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const response = await fetch(`http://localhost:3000/api/prompts/${editingPrompt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          promptText: formPromptText,
          category: formCategory,
          tags: tagsArray
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear form and editing state
        setEditingPrompt(null);
        setFormTitle('');
        setFormDescription('');
        setFormPromptText('');
        setFormCategory('coding');
        setFormTags('');
        setFormError('');
        
        // Go back to prompts page
        setCurrentPage('prompts');
        fetchPrompts();
      } else {
        setFormError(data.message);
      }
    } catch (err) {
      setFormError('Connection error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPrompts();
      } else {
        alert('Failed to delete prompt: ' + data.message);
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    }
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setFormTitle(prompt.title);
    setFormDescription(prompt.description);
    setFormPromptText(prompt.promptText);
    setFormCategory(prompt.category);
    setFormTags(prompt.tags ? prompt.tags.join(', ') : '');
    setCurrentPage('edit-prompt');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
    setPrompts([]);
    // Clear all form states
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setFormTitle('');
    setFormDescription('');
    setFormPromptText('');
    setFormCategory('coding');
    setFormTags('');
    setEditingPrompt(null);
  };

  // Login Page
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
          borderRadius: '8px',
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
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setCurrentPage('login')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#e5e7eb',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
          
          {loginError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              color: '#dc2626',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loginLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loginLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Register Page
  if (currentPage === 'register') {
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
          borderRadius: '8px',
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
            Create Account
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setCurrentPage('login')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#e5e7eb',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
          
          {registerError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              color: '#dc2626',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {registerError}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
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
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
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
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={registerLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: registerLoading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: registerLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {registerLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard') {
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
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('prompts')}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            My Prompts
          </button>
          <button
            onClick={() => setCurrentPage('create-prompt')}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Create Prompt
          </button>
        </nav>

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
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {prompts.length}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Total Prompts
              </p>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                {[...new Set(prompts.map(p => p.category))].length}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Categories
              </p>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
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
  }

  // Prompts List Page
  if (currentPage === 'prompts') {
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
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('prompts')}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            My Prompts
          </button>
          <button
            onClick={() => setCurrentPage('create-prompt')}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Create Prompt
          </button>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              My Prompts
            </h2>
            <button
              onClick={() => setCurrentPage('create-prompt')}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Create New Prompt
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1rem'
          }}>
            {prompts.map((prompt) => (
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
                
                {prompt.promptText && (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    fontStyle: 'italic'
                  }}>
                    {prompt.promptText.length > 100 ? prompt.promptText.substring(0, 100) + '...' : prompt.promptText}
                  </div>
                )}
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {prompt.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e5e7eb',
                          color: '#6b7280',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          marginRight: '0.5rem',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEditPrompt(prompt)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt._id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Create/Edit Prompt Page
  if (currentPage === 'create-prompt' || currentPage === 'edit-prompt') {
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
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('prompts')}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            My Prompts
          </button>
          <button
            onClick={() => setCurrentPage('create-prompt')}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {currentPage === 'edit-prompt' ? 'Edit Prompt' : 'Create Prompt'}
          </button>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
              {currentPage === 'edit-prompt' ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
            
            {formError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#dc2626',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={currentPage === 'edit-prompt' ? handleUpdatePrompt : handleCreatePrompt}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter prompt title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe what this prompt does"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Prompt Text
                </label>
                <textarea
                  placeholder="Enter the actual prompt text"
                  value={formPromptText}
                  onChange={(e) => setFormPromptText(e.target.value)}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="coding">Coding</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: formLoading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: formLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {formLoading ? (currentPage === 'edit-prompt' ? 'Updating...' : 'Creating...') : (currentPage === 'edit-prompt' ? 'Update Prompt' : 'Create Prompt')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('prompts');
                    setEditingPrompt(null);
                    setFormTitle('');
                    setFormDescription('');
                    setFormPromptText('');
                    setFormCategory('coding');
                    setFormTags('');
                    setFormError('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default AppComplete;
