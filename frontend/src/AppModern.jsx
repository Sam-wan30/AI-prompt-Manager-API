import React, { useState, useEffect } from 'react';
import './modern-design.css';

// Import modern components
import LoginModern from './components/LoginModern';
import RegisterModern from './components/RegisterModern';
import SidebarModern from './components/SidebarModern';
import NavbarModern from './components/NavbarModern';
import DashboardModern from './components/DashboardModern';
import PromptLibraryModern from './components/PromptLibraryModern';

// Import simple components for other pages
import CreatePromptPage from './components/CreatePromptPage';
import AIGeneratorPage from './components/AIGeneratorPage';

const AppModern = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('dashboard');
      setIsAnimating(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
    setIsAnimating(true);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
    setIsAnimating(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
    setSidebarOpen(false);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderCurrentPage = () => {
    const commonProps = {
      user,
      onNavigate: handleNavigate
    };

    switch (currentPage) {
      case 'login':
        return (
          <LoginModern
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        );
      case 'register':
        return (
          <RegisterModern
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        );
      case 'dashboard':
        return (
          <DashboardModern
            {...commonProps}
            onCreatePrompt={() => setCurrentPage('create')}
          />
        );
      case 'prompts':
        return (
          <PromptLibraryModern
            {...commonProps}
            onCreatePrompt={() => setCurrentPage('create')}
          />
        );
      case 'create':
        return (
          <CreatePromptPage
            {...commonProps}
            onNavigate={handleNavigate}
          />
        );
      case 'ai':
        return (
          <AIGeneratorPage
            {...commonProps}
            onNavigate={handleNavigate}
          />
        );
      case 'analytics':
        return (
          <div className="main-content">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600 mb-6">Analytics dashboard coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="btn btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="main-content">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  // Auth pages (login/register) don't have sidebar/navbar
  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <div className={`min-h-screen ${isAnimating ? 'fade-in' : ''}`}>
        {renderCurrentPage()}
      </div>
    );
  }

  // Protected pages have sidebar/navbar
  return (
    <div className={`min-h-screen bg-gray-50 ${isAnimating ? 'fade-in' : ''}`}>
      <SidebarModern
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <NavbarModern
        user={user}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />
      
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default AppModern;
