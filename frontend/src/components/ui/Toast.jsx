import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification System
 * Production-grade toast notifications with multiple types and auto-dismiss
 */

const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast component
const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration = 5000, action } = toast;
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss timer
  React.useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const decrement = 100 / (duration / 100);
        const newProgress = prev - decrement;
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [id, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case TOAST_TYPES.ERROR:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case TOAST_TYPES.WARNING:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case TOAST_TYPES.INFO:
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200';
      case TOAST_TYPES.ERROR:
        return 'bg-red-50 border-red-200';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case TOAST_TYPES.INFO:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'text-green-800';
      case TOAST_TYPES.ERROR:
        return 'text-red-800';
      case TOAST_TYPES.WARNING:
        return 'text-yellow-800';
      case TOAST_TYPES.INFO:
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full
      `}
    >
      <div className={`
        ${getBgColor()}
        border rounded-lg shadow-lg p-4
        relative overflow-hidden
      `}>
        {/* Progress bar */}
        {duration > 0 && (
          <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                opacity: 0.3
              }}
            />
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${getTextColor()}`}>
                {title}
              </h3>
            )}
            {message && (
              <p className={`text-sm ${getTextColor()} ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`
                    text-sm font-medium underline
                    ${getTextColor()}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex text-gray-400 hover:text-gray-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                transition-colors
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast container component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove if duration is set
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 5000);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook for using toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for different toast types
export const useToastFunctions = () => {
  const { addToast } = useToast();

  const success = (message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.SUCCESS,
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.ERROR,
      message,
      duration: 0, // Don't auto-dismiss errors
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.WARNING,
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addToast({
      type: TOAST_TYPES.INFO,
      message,
      ...options
    });
  };

  const promise = async (promise, options = {}) => {
    const { loading, success: successMessage, error: errorMessage } = options;
    
    // Show loading toast if provided
    let loadingToastId;
    if (loading) {
      loadingToastId = info(loading, { duration: 0 });
    }

    try {
      const result = await promise;
      
      // Remove loading toast
      if (loadingToastId) {
        removeToast(loadingToastId);
      }
      
      // Show success toast
      if (successMessage) {
        success(successMessage);
      }
      
      return result;
    } catch (error) {
      // Remove loading toast
      if (loadingToastId) {
        removeToast(loadingToastId);
      }
      
      // Show error toast
      if (errorMessage) {
        error(errorMessage);
      } else {
        error(error.message || 'An error occurred');
      }
      
      throw error;
    }
  };

  return {
    success,
    error,
    warning,
    info,
    promise,
    addToast
  };
};

// HOC for adding toast functionality to components
export const withToast = (Component) => {
  return function WrappedComponent(props) {
    const toastFunctions = useToastFunctions();
    
    return <Component {...props} toast={toastFunctions} />;
  };
};

export default ToastContext;
