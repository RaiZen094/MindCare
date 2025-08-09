'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authUtils } from '../lib/auth';
import api from '../lib/api';

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
      setLoading(true);
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store auth data
        authUtils.setAuth(token, user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', formData);

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store auth data
        authUtils.setAuth(token, user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional, since JWT is stateless)
      await api.post('/auth/logout');
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

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
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
