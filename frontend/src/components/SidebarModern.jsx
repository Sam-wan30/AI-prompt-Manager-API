import React from 'react';
import { 
  Home, 
  FileText, 
  Plus, 
  Zap, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Brain,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const SidebarModern = ({ currentPage, onNavigate, user, onLogout, isOpen, onToggle }) => {
  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      id: 'prompts',
      name: 'Prompt Library',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'create',
      name: 'Create Prompt',
      icon: Plus,
      color: 'text-green-600'
    },
    {
      id: 'ai',
      name: 'AI Generator',
      icon: Zap,
      color: 'text-orange-600'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      color: 'text-pink-600'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar fixed lg:static lg:translate-x-0 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Prompt Manager</h2>
                <p className="text-xs text-gray-500">AI Workspace</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onToggle(); // Close mobile menu
                  }}
                  className={`nav-item w-full group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`nav-icon ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button className="nav-item w-full group hover:bg-gray-50">
              <Sparkles className="nav-icon text-gray-400 group-hover:text-gray-600" />
              <span className="font-medium">Templates</span>
            </button>
            <button className="nav-item w-full group hover:bg-gray-50">
              <Settings className="nav-icon text-gray-400 group-hover:text-gray-600" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn btn-ghost btn-full text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default SidebarModern;
