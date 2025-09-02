import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    });
  },

  async register(userData) {
    return apiWithRetry(async () => {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    });
  },

  async adminCheck() {
    return apiWithRetry(async () => {
      const response = await api.get('/api/auth/admin-check');
      return response.data;
    });
  },

  // Health check with normal timeout (no retry needed)
  async healthCheck() {
    const response = await api.get('/api/auth/health');
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
  },

  // Professional Verification API methods
  async submitProfessionalApplication(applicationData) {
    return apiWithRetry(async () => {
      const response = await api.post('/api/professional/verification/apply', applicationData);
      return response.data;
    });
  },

  async getProfessionalVerificationStatus() {
    return apiWithRetry(async () => {
      const response = await api.get('/api/professional/verification/status');
      return response.data;
    });
  },

  async getMyVerificationStatus() {
    return apiWithRetry(async () => {
      console.log('🔧 API: Calling /api/professional/verification/status');
      const response = await api.get('/api/professional/verification/status');
      console.log('🔧 API Response:', response.status, response.data);
      return response.data;
    });
  },

  async trackProfessionalApplication(correlationId) {
    return apiWithRetry(async () => {
      const response = await api.get(`/api/professional/verification/track/${correlationId}`);
      return response.data;
    });
  },

  // Document upload API
  async uploadDocument(file, documentType) {
    return apiWithRetry(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      const response = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  // Admin Professional Verification API methods
  async getPendingVerifications(page = 0, size = 10) {
    return apiWithRetry(async () => {
      const response = await api.get(`/api/admin/verifications/pending?page=${page}&size=${size}`);
      return response.data;
    });
  },

  async getAllVerifications(status = null, page = 0, size = 10) {
    return apiWithRetry(async () => {
      const params = new URLSearchParams({ page, size });
      if (status) params.append('status', status);
      const response = await api.get(`/api/admin/verifications?${params}`);
      return response.data;
    });
  },

  async approveVerification(verificationId, notes = '') {
    return apiWithRetry(async () => {
      const response = await api.post(`/api/admin/verifications/${verificationId}/approve`, { notes });
      return response.data;
    });
  },

  async rejectVerification(verificationId, reason, notes = '') {
    return apiWithRetry(async () => {
      const response = await api.post(`/api/admin/verifications/${verificationId}/reject`, { reason, notes });
      return response.data;
    });
  },

  async getVerificationStatistics() {
    return apiWithRetry(async () => {
      const response = await api.get('/api/admin/verifications/statistics');
      return response.data;
    });
  },

  async uploadPreVerifiedCSV(file) {
    return apiWithRetry(async () => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/admin/verifications/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  // Get all verified professionals directory
  async getAllProfessionals(page = 0, size = 20, search = '', professionalType = '') {
    return apiWithRetry(async () => {
      const params = new URLSearchParams({ page, size });
      if (search) params.append('search', search);
      if (professionalType) params.append('professionalType', professionalType);
      const response = await api.get(`/api/admin/professionals?${params}`);
      return response.data;
    });
  },

  // Get pre-approved professionals reference list
  async getPreApprovedProfessionals(email = '', name = '', type = '', specialization = '') {
    return apiWithRetry(async () => {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (name) params.append('name', name);
      if (type) params.append('type', type);
      if (specialization) params.append('specialization', specialization);
      
      const url = '/api/admin/pre-approved-professionals' + 
                 (params.toString() ? '?' + params.toString() : '');
      const response = await api.get(url);
      return response.data;
    });
  },

  // Generic get method for backward compatibility
  async get(endpoint) {
    return apiWithRetry(async () => {
      const response = await api.get(`/api${endpoint}`);
      return response;
    });
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
