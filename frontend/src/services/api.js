import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and logging
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Response Error:', error.response?.data || error.message);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Utility function to handle API errors
const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Utility function to create API wrapper with loading state
const createApiWrapper = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: handleApiError(error) };
    }
  };
};

// Auth API calls
export const authAPI = {
  login: createApiWrapper(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  }),
  
  register: createApiWrapper(async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response;
  }),
  
  getProfile: createApiWrapper(async () => {
    const response = await api.get('/auth/me');
    return response;
  }),
  
  logout: createApiWrapper(async () => {
    const response = await api.post('/auth/logout');
    return response;
  }),
  
  updateProfile: createApiWrapper(async (profileData) => {
    const response = await api.put('/auth/me', profileData);
    return response;
  }),
  
  changePassword: createApiWrapper(async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response;
  }),
};

// Prompts API calls
export const promptsAPI = {
  getAll: createApiWrapper(async (params = {}) => {
    const response = await api.get('/prompts', { params });
    return response;
  }),
  
  getById: createApiWrapper(async (id) => {
    const response = await api.get(`/prompts/${id}`);
    return response;
  }),
  
  create: createApiWrapper(async (promptData) => {
    const response = await api.post('/prompts', promptData);
    return response;
  }),
  
  update: createApiWrapper(async (id, promptData) => {
    const response = await api.put(`/prompts/${id}`, promptData);
    return response;
  }),
  
  delete: createApiWrapper(async (id) => {
    const response = await api.delete(`/prompts/${id}`);
    return response;
  }),
  
  search: createApiWrapper(async (params) => {
    const response = await api.get('/prompts/search', { params });
    return response;
  }),
  
  getTopUsed: createApiWrapper(async () => {
    const response = await api.get('/prompts/top-used');
    return response;
  }),
  
  getPopular: createApiWrapper(async () => {
    const response = await api.get('/prompts/popular');
    return response;
  }),
  
  getStats: createApiWrapper(async () => {
    const response = await api.get('/prompts/stats');
    return response;
  }),
  
  incrementUsage: createApiWrapper(async (id) => {
    const response = await api.post(`/prompts/${id}/use`);
    return response;
  }),
  
  bulkInsert: createApiWrapper(async (prompts) => {
    const response = await api.post('/prompts/bulk', { prompts });
    return response;
  }),
};

// AI API calls
export const aiAPI = {
  generate: createApiWrapper(async (topic, category, tone = 'professional') => {
    const response = await api.post('/ai/generate', { topic, category, tone });
    return response;
  }),
  
  improve: createApiWrapper(async (prompt) => {
    const response = await api.post('/ai/improve', { prompt });
    return response;
  }),
  
  getVariations: createApiWrapper(async (topic, category, tone = 'professional', variations = 3) => {
    const response = await api.post('/ai/variations', { topic, category, tone, variations });
    return response;
  }),
  
  analyze: createApiWrapper(async (prompt) => {
    const response = await api.post('/ai/analyze', { prompt });
    return response;
  }),
  
  getStatus: createApiWrapper(async () => {
    const response = await api.get('/ai/status');
    return response;
  }),
  
  getAnalytics: createApiWrapper(async () => {
    const response = await api.get('/ai/analytics');
    return response;
  }),
};

// Analytics API calls
export const analyticsAPI = {
  getPromptAnalytics: createApiWrapper(async () => {
    const response = await api.get('/analytics/prompts');
    return response;
  }),
  
  getUserAnalytics: createApiWrapper(async () => {
    const response = await api.get('/analytics/users');
    return response;
  }),
  
  getTimeRangeAnalytics: createApiWrapper(async (timeRange = 'all') => {
    const response = await api.get('/analytics/prompts/timerange', { params: { timeRange } });
    return response;
  }),
};

// Health check API
export const healthAPI = {
  check: createApiWrapper(async () => {
    const response = await api.get('/health');
    return response;
  }),
};

// Export utilities
export { handleApiError };
export default api;
