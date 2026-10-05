import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mouna_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('mouna_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / verify profile if token exists
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('mouna_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();

    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('mouna_token', newToken);
        localStorage.setItem('mouna_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.'
      };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await authService.register({ name, email, password, confirmPassword });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('mouna_token', newToken);
        localStorage.setItem('mouna_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.user };
        setUser(updatedUser);
        localStorage.setItem('mouna_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('mouna_token');
    localStorage.removeItem('mouna_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token && user), loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
