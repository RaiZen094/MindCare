import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const COLD_START_TIMEOUT = 60000; // 60 seconds for cold starts
const NORMAL_TIMEOUT = 10000; // 10 seconds for normal requests

// Enhanced retry function for cold start handling
async function apiWithRetry(requestFn, retries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await requestFn();
      const duration = Date.now() - startTime;
      
      // Log if it was a cold start (took more than 10 seconds)
      if (duration > 10000) {
        console.log(`🔄 Cold start detected: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry for authentication errors or client errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }
      
      // Log retry attempt
      console.log(`🔄 API request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${RETRY_DELAY}ms...`);
      console.log(`Error: ${error.message}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw lastError;
}

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: COLD_START_TIMEOUT, // Allow for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle timeouts
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('mindcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Use shorter timeout for health checks, longer for other requests
    if (config.url?.includes('/health')) {
      config.timeout = NORMAL_TIMEOUT;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('mindcare_token');
      Cookies.remove('mindcare_user');
      
      // Redirect to login if not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Enhanced API methods with retry logic
export const apiService = {
  // Authentication methods with retry
  async login(credentials) {
    return apiWithRetry(async () => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    });
  },

  async register(userData) {
    return apiWithRetry(async () => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    });
  },

  async adminCheck() {
    return apiWithRetry(async () => {
      const response = await api.get('/auth/admin-check');
      return response.data;
    });
  },

  // Health check with normal timeout (no retry needed)
  async healthCheck() {
    const response = await api.get('/auth/health');
    return response.data;
  },

  // Wake up service (for cold start mitigation)
  async wakeUp() {
    try {
      await this.healthCheck();
      console.log('✅ Backend is awake');
      return true;
    } catch (error) {
      console.log('🔄 Backend is starting up...');
      return false;
    }
  }
};

// Keep-alive service to prevent cold starts
export const keepAliveService = {
  interval: null,
  PING_INTERVAL: 10 * 60 * 1000, // 10 minutes

  start() {
    if (this.interval) return;

    console.log('🚀 Starting keep-alive service');
    this.interval = setInterval(async () => {
      try {
        await apiService.healthCheck();
        console.log('💓 Keep-alive ping successful');
      } catch (error) {
        console.log('⚠️ Keep-alive ping failed:', error.message);
      }
    }, this.PING_INTERVAL);
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🛑 Keep-alive service stopped');
    }
  }
};

// Auto-start keep-alive in browser
if (typeof window !== 'undefined') {
  // Wake up service on app load
  apiService.wakeUp();
  
  // Start keep-alive service
  keepAliveService.start();
  
  // Stop keep-alive when page unloads
  window.addEventListener('beforeunload', () => {
    keepAliveService.stop();
  });
}

export default api;
