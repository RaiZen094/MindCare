'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authUtils } from '../lib/auth';
import { apiService } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Enhanced loading states for cold start handling
  const [authLoading, setAuthLoading] = useState(false);
  const [coldStart, setColdStart] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initAuth = () => {
      const token = authUtils.getToken();
      const userData = authUtils.getUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      setAuthLoading(true);
      setColdStart(false);
      setRetryCount(0);
      
      const startTime = Date.now();
      
      const response = await apiService.login({
        email,
        password,
        rememberMe,
      });

      const duration = Date.now() - startTime;
      
      // Detect cold start
      if (duration > 10000) {
        setColdStart(true);
        console.log(`🔄 Cold start login detected: ${duration}ms`);
      }

      if (response.success) {
        const { token, user } = response;
        
        // Store auth data
        authUtils.setAuth(token, user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      // Handle different types of errors
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setColdStart(true);
        message = 'The server is starting up. Please wait a moment and try again.';
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password.';
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again in a moment.';
      } else {
        message = error.response?.data?.message || error.message;
      }
      
      console.error('Login error:', error);
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setAuthLoading(true);
      setColdStart(false);
      
      const startTime = Date.now();
      
      const response = await apiService.register(formData);
      
      const duration = Date.now() - startTime;
      
      // Detect cold start
      if (duration > 10000) {
        setColdStart(true);
        console.log(`🔄 Cold start registration detected: ${duration}ms`);
      }

      if (response.success) {
        const { token, user } = response;
        
        // Store auth data
        authUtils.setAuth(token, user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setColdStart(true);
        message = 'The server is starting up. Please wait a moment and try again.';
      } else if (error.response?.status === 409) {
        message = 'An account with this email already exists.';
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again in a moment.';
      } else {
        message = error.response?.data?.message || error.message;
      }
      
      console.error('Registration error:', error);
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional, since JWT is stateless)
      // Don't use retry logic for logout
      // await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data
      authUtils.clearAuth();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    authUtils.setAuth(authUtils.getToken(), userData);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const isAdmin = () => hasRole('ADMIN');
  const isProfessional = () => hasRole('PROFESSIONAL');
  const isPatient = () => hasRole('PATIENT');

  // Enhanced admin check with retry logic
  const checkAdminAccess = async () => {
    try {
      setAuthLoading(true);
      const response = await apiService.adminCheck();
      return response.success;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    
    // Enhanced loading states
    authLoading,
    coldStart,
    retryCount,
    
    // Methods
    login,
    register,
    logout,
    updateUser,
    checkAdminAccess,
    
    // Role checks
    hasRole,
    isAdmin,
    isProfessional,
    isPatient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
