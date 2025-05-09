// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
   
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkUserSession();
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserSession = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Session expired or invalid', err);
      logout();
      setLoading(false);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      const response = await api.post('/auth/login', { email, password });
  
      
      if (!response.data.token) {
        throw new Error('No token received from server');
      }
      
      const token = response.data.token.trim();
      localStorage.setItem('token', token);
      
      // Explicitly set the Authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const userResponse = await api.get('/auth/me');
        
        setCurrentUser(userResponse.data);
      } catch (testError) {
        console.error('Test request failed:', testError);
        // Don't throw here, continue with login even if test fails
      }
      
      return response.data;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError('');
      const response = await api.post('/auth/register', { name, email, password });
    
      
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data after registration
        const userResponse = await api.get('/auth/me');
        setCurrentUser(userResponse.data);
        return userResponse.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };


  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return token;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      logout();
      throw err;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
    refreshToken,
    loading,
    checkUserSession // Export this so we can use it in AuthCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}