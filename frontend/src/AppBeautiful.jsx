import React, { useState, useEffect } from 'react';

// Modern design system with beautiful styling
const AppBeautiful = () => {
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

  const LoginPage = () => (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Left Panel - Branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          opacity: 0.3
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Professional Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Prompt Manager
          </h1>
          
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.1rem',
            marginBottom: '3rem',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            Enterprise-grade AI prompt management platform for teams and professionals
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Professional Templates
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Industry-standard prompt templates
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6H12.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Real-time Analytics
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Track prompt performance metrics
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Enterprise Security
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Bank-level data protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: '1',
        maxWidth: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Sign in to your account
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '0.95rem'
            }}>
              Enter your credentials to access the platform
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid '#fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  outline: 'none'
                }}
              />
            </div>
            
            <div>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" style={{ borderRadius: '4px' }} />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Remember me</span>
              </label>
              <a href="#" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.875rem 1.5rem',
                background: loading ? '#9ca3af' : '#1e293b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                marginTop: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.background = '#334155';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.background = '#1e293b';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>
              Demo Credentials:
            </p>
            <p style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
              Email: demo@example.com
            </p>
            <p style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
              Password: demo123456
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        @media (max-width: 768px) {
          div[style*="flex: 1"] {
            display: none !important;
          }
          
          div[style*="maxWidth: 500px"] {
            flex: 1;
            maxWidth: none;
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );

  const DashboardPage = () => {
    const categoryColors = {
      coding: '#3b82f6',
      marketing: '#8b5cf6',
      writing: '#10b981',
      business: '#f59e0b',
      education: '#ef4444'
    };

    const stats = [
      { label: 'Total Prompts', value: prompts.length, color: '#667eea', icon: 'AI' },
      { label: 'Categories', value: [...new Set(prompts.map(p => p.category))].length, color: '#10b981', icon: 'C' },
      { label: 'Total Usage', value: prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0), color: '#f59e0b', icon: 'U' }
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f7fafc, #edf2f7)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>AI</span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
                Prompt Manager
              </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#4a5568', fontSize: '0.9rem', fontWeight: '500' }}>
                  {user?.name}
                </p>
                <p style={{ color: '#718096', fontSize: '0.8rem' }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          {/* Welcome Section */}
          <div style={{
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome back, {user?.name}! 
            </h2>
            <p style={{ color: '#718096', fontSize: '1.1rem' }}>
              Here's what's happening with your AI prompts today
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: stat.color,
                  borderRadius: '50%',
                  opacity: '0.1'
                }} />
                
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: `0 4px 12px ${stat.color}40`
                }}>
                  <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                    {stat.icon}
                  </span>
                </div>
                
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </h3>
                <p style={{
                  color: '#718096',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Prompts */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1.5rem'
            }}>
              Recent Prompts
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {prompts.slice(0, 6).map((prompt, index) => (
                <div
                  key={prompt._id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: `linear-gradient(90deg, ${categoryColors[prompt.category] || '#667eea'}, ${categoryColors[prompt.category] || '#764ba2'})`
                  }} />
                  
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a202c',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4'
                  }}>
                    {prompt.title}
                  </h4>
                  
                  <p style={{
                    color: '#718096',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {prompt.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: `${categoryColors[prompt.category] || '#667eea'}20`,
                      color: categoryColors[prompt.category] || '#667eea',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {prompt.category}
                    </span>
                    
                    <span style={{
                      color: '#a0aec0',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>Used</span>
                      <span style={{ fontWeight: '600', color: '#4a5568' }}>
                        {prompt.usageCount || 0}
                      </span>
                      <span>times</span>
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

  return currentPage === 'login' ? <LoginPage /> : <DashboardPage />;
};

export default AppBeautiful;
