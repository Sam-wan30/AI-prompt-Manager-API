import React, { useState, useEffect } from 'react';

const AppBeautifulColors = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  
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

  // Beautiful and attractive color scheme
  const colors = {
    primary: '#6366f1',      // Deep purple
    secondary: '#8b5cf6',    // Medium purple
    accent: '#ec4899',      // Bright purple
    success: '#10b981',     // Emerald green
    warning: '#f59e0b',     // Amber
    error: '#ef4444',      // Red
    background: '#faf5ff',   // Very light purple
    surface: '#ffffff',      // Pure white
    text: {
      primary: '#1e1b4b',    // Deep purple
      secondary: '#64748b',  // Slate gray
      muted: '#94a3b8'      // Muted gray
    },
    border: '#e5e7eb'      // Light gray border
  };

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
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.accent} 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, ${colors.success} 0%, transparent 50%)`,
          opacity: 0.1
        }} />

        {/* Login Container */}
        <div style={{
          background: colors.surface,
          borderRadius: '16px',
          padding: '3rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
          border: `1px solid ${colors.border}`,
          position: 'relative',
          zIndex: 1
        }}>
          {/* Company Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1))',
                animation: 'spin 20s linear infinite'
              }} />
              <span style={{ 
                color: 'white', 
                fontSize: '32px', 
                fontWeight: '700',
                letterSpacing: '2px',
                position: 'relative',
                zIndex: 1
              }}>
                AI
              </span>
            </div>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: '0.5rem',
              textAlign: 'center',
              letterSpacing: '1px'
            }}>
              Prompt Manager
            </h2>
            <p style={{
              color: colors.text.secondary,
              fontSize: '1rem',
              marginBottom: '2rem',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              Beautiful AI prompt management platform
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setCurrentPage('login')}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(236, 72, 153, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: colors.text.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = colors.surface;
                e.target.style.borderColor = colors.accent;
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = colors.border;
              }}
            >
              Get Started
            </button>
          </div>
          
          {loginError && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${colors.error}`,
              borderRadius: '8px',
              color: colors.error,
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your professional email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your secure password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: loginLoading ? colors.text.muted : `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loginLoading ? 'none' : '0 4px 12px rgba(236, 72, 153, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!loginLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(236, 72, 153, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Beautiful Workspace'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: `1px solid ${colors.border}`
          }}>
            <p style={{ color: colors.text.secondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              New to our beautiful platform?
            </p>
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: colors.accent,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = colors.surface;
                e.target.style.borderColor = colors.accent;
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = colors.border;
              }}
            >
              Create Beautiful Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Register Page
  if (currentPage === 'register') {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.success} 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, ${colors.warning} 0%, transparent 50%)`,
          opacity: 0.1
        }} />

        <div style={{
          background: colors.surface,
          borderRadius: '16px',
          padding: '3rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
          border: `1px solid ${colors.border}`,
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: '0.5rem',
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            Create Beautiful Account
          </h2>
          
          {registerError && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${colors.error}`,
              borderRadius: '8px',
              color: colors.error,
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {registerError}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your beautiful name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Professional Email
              </label>
              <input
                type="email"
                placeholder="your.beautiful.email@company.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Secure Password
              </label>
              <input
                type="password"
                placeholder="Create a beautiful password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                minLength="8"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your beautiful password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
                minLength="8"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: colors.surface,
                  color: colors.text.primary,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={registerLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: registerLoading ? colors.text.muted : `linear-gradient(135deg, ${colors.success}, ${colors.warning})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: registerLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: registerLoading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}
              onMouseOver={(e) => {
                if (!registerLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.2)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
            >
              {registerLoading ? 'Creating Beautiful Account...' : 'Create Beautiful Account'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: `1px solid ${colors.border}`
          }}>
            <p style={{ color: colors.text.secondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Already have a beautiful account?
            </p>
            <button
              onClick={() => setCurrentPage('login')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: colors.accent,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = colors.surface;
                e.target.style.borderColor = colors.accent;
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = colors.border;
              }}
            >
              Sign In to Beautiful Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Header */}
        <header style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '20px', 
                fontWeight: '700',
                letterSpacing: '-0.5px',
                position: 'relative',
                zIndex: 1
              }}>
                AI
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: colors.text.primary }}>
              Beautiful Prompt Manager
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: colors.text.secondary, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Welcome back,
              </p>
              <p style={{ color: colors.text.primary, fontSize: '1rem', fontWeight: '600' }}>
                {user?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: colors.error,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = colors.error;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          background: colors.surface,
          padding: '1rem 2rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: colors.text.muted,
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('prompts')}
            style={{
              padding: '0.5rem 1rem',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            My Prompts
          </button>
          <button
            onClick={() => setCurrentPage('create-prompt')}
            style={{
              padding: '0.5rem 1rem',
              background: colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Prompt
          </button>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          {/* Welcome Section */}
          <div style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 20% 80%, ${colors.accent} 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, ${colors.success} 0%, transparent 50%)`,
              opacity: 0.05
            }} />
            
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}>
              Welcome to Your Beautiful Workspace
            </h2>
            <p style={{ 
              color: colors.text.secondary, 
              fontSize: '1.125rem', 
              lineHeight: '1.6',
              maxWidth: '600px',
              position: 'relative',
              zIndex: 1
            }}>
              Manage your AI prompts with our beautiful and intuitive platform. 
              Track performance, collaborate with your team, and optimize your workflow 
              with enterprise-grade tools and analytics.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: colors.surface,
              borderRadius: '16px',
              padding: '1.5rem',
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-6px)';
              e.target.style.boxShadow = '0 12px 24px rgba(236, 72, 153, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.15)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, ${colors.accent}, ${colors.success})',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)'
              }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
                  📊
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.5rem' }}>
                {prompts.length}
              </h3>
              <p style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
                Beautiful Prompts
              </p>
            </div>
            <div style={{
              background: colors.surface,
              borderRadius: '16px',
              padding: '1.5rem',
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-6px)';
              e.target.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${colors.success}, ${colors.warning})`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
                  📁
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.5rem' }}>
                {[...new Set(prompts.map(p => p.category))].length}
              </h3>
              <p style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
                Creative Categories
              </p>
            </div>
            <div style={{
              background: colors.surface,
              borderRadius: '16px',
              padding: '1.5rem',
              border: `1px solid ${colors.border}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-6px)';
              e.target.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${colors.warning}, ${colors.error})`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
              }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
                  ⚡
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.5rem' }}>
                {prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
              </h3>
              <p style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
                Total Usage
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.text.primary, marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <button
                onClick={() => setCurrentPage('prompts')}
                style={{
                  padding: '1rem',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = colors.accent;
                  e.target.style.borderColor = colors.accent;
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = colors.surface;
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.text.primary;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                Manage Prompts
              </button>
              <button
                onClick={() => setCurrentPage('create-prompt')}
                style={{
                  padding: '1rem',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = colors.success;
                  e.target.style.borderColor = colors.success;
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = colors.surface;
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.text.primary;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>➕</span>
                Create Prompt
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                style={{
                  padding: '1rem',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = colors.warning;
                  e.target.style.borderColor = colors.warning;
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = colors.surface;
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.text.primary;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📈</span>
                Analytics
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '1.5rem',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.text.primary }}>
                Recent Activity
              </h3>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: colors.accent,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = colors.surface;
                  e.target.style.borderColor = colors.accent;
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.accent;
                }}
              >
                View All
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {prompts.slice(0, 4).map((prompt, index) => (
                <div
                  key={prompt._id}
                  style={{
                    background: colors.surface,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 12px 24px rgba(236, 72, 153, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.15)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text.primary, marginBottom: '0.5rem' }}>
                        {prompt.title}
                      </h4>
                      <p style={{ color: colors.text.secondary, fontSize: '0.875rem', marginBottom: '1rem' }}>
                        {prompt.description}
                      </p>
                      
                      {prompt.promptText && (
                        <div style={{
                          backgroundColor: 'rgba(236, 72, 153, 0.05)',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                          border: `1px solid ${colors.border}`,
                          fontSize: '0.875rem',
                          color: colors.text.secondary,
                          lineHeight: '1.5',
                          fontFamily: 'Monaco, Consolas, monospace'
                        }}>
                          {prompt.promptText.length > 100 ? prompt.promptText.substring(0, 100) + '...' : prompt.promptText}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          background: colors.accent,
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {prompt.category}
                        </span>
                        <span style={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                          • {prompt.usageCount || 0} uses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </main>
      </div>
    );
  }

  return null;
};

export default AppBeautifulColors;
