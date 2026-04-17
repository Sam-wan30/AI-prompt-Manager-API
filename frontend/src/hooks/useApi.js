import { useState, useCallback } from 'react';

// Custom hook for managing API loading states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeApiCall,
    clearError
  };
};

// Custom hook for managing multiple API calls
export const useMultiApi = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});

  const executeApiCall = useCallback(async (key, apiCall, ...args) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));
    
    try {
      const result = await apiCall(...args);
      
      if (result.success) {
        return result.data;
      } else {
        setErrors(prev => ({ ...prev, [key]: result.error }));
        throw new Error(result.error);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: error.message || 'An error occurred' }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const clearError = useCallback((key) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key) => {
    return errors[key] || null;
  }, [errors]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const hasAnyError = useCallback(() => {
    return Object.values(errors).some(Boolean);
  }, [errors]);

  return {
    executeApiCall,
    clearError,
    clearAllErrors,
    isLoading,
    getError,
    isAnyLoading,
    hasAnyError,
    loadingStates,
    errors
  };
};

export default useApi;
