import React, { useState, useEffect } from 'react';

// Minimal inline styles to avoid CSS issues
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#1f2937'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  buttonHover: {
    backgroundColor: '#2563eb'
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    color: '#dc2626',
    marginBottom: '1rem'
  },
  text: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem'
  }
};

const AppMinimal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

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
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/prompts');
      const data = await response.json();
      return data.success ? (data.data.prompts || []) : [];
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      return [];
    }
  };

  if (user) {
    return (
      <div style={{...styles.container, alignItems: 'flex-start', paddingTop: '2rem'}}>
        <div style={{maxWidth: '1200px', width: '100%', padding: '0 1rem'}}>
          {/* Header */}
          <div style={{backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'}}>AI Prompt Manager</h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <span style={{color: '#6b7280'}}>Welcome, {user.name}</span>
              <button onClick={handleLogout} style={styles.button}>Logout</button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem'}}>Dashboard</h2>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
              <div style={styles.card}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>Total Prompts</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6'}}>15</div>
              </div>
              <div style={styles.card}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>Categories</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#10b981'}}>5</div>
              </div>
              <div style={styles.card}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>Total Usage</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6'}}>2,156</div>
              </div>
            </div>

            <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem'}}>Recent Prompts</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem'}}>
              {[
                {title: "Build a Responsive React Dashboard", category: "coding", usage: 156},
                {title: "Write Viral LinkedIn Post Template", category: "marketing", usage: 203},
                {title: "Create Business Startup Idea Generator", category: "business", usage: 234},
                {title: "Explain DSA Concepts Simply", category: "education", usage: 267},
                {title: "Write Compelling Product Description", category: "writing", usage: 167},
                {title: "Create Email Marketing Campaign", category: "marketing", usage: 178}
              ].map((prompt, index) => (
                <div key={index} style={styles.card}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>{prompt.title}</h4>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '0.75rem', backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase'}}>{prompt.category}</span>
                    <span style={{fontSize: '0.75rem', color: '#6b7280'}}>Used {prompt.usage} times</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>AI Prompt Manager</h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.text}>
          Demo credentials: demo@example.com / demo123456
        </p>
      </div>
    </div>
  );
};

export default AppMinimal;
