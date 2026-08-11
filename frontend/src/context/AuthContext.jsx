import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../api';
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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data;
      // Ensure is_admin is properly set
      const isAdmin = userData.is_admin === true;
      localStorage.setItem('is_admin', JSON.stringify(isAdmin));
      setUser({ ...userData, is_admin: isAdmin });
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('is_admin');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      const isAdmin = user.is_admin === true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('is_admin', JSON.stringify(isAdmin));
      setToken(token);
      setUser({ ...user, is_admin: isAdmin });
      
      return { success: true, user: { ...user, is_admin: isAdmin } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      
      const { token, user } = response.data;
      const isAdmin = user.is_admin === true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('is_admin', JSON.stringify(isAdmin));
      setToken(token);
      setUser({ ...user, is_admin: isAdmin });
      
      return { success: true, user: { ...user, is_admin: isAdmin } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    setToken(null);
    setUser(null);
  };

  // Get isAdmin from localStorage if user is null
  const getIsAdmin = () => {
    if (user) return user.is_admin === true;
    try {
      return JSON.parse(localStorage.getItem('is_admin') || 'false');
    } catch {
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user || !!localStorage.getItem('token'),
    isAdmin: getIsAdmin(),
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
