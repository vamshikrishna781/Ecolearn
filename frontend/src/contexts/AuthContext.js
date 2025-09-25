import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.timeout = 10000; // 10 second timeout

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add axios response interceptor to handle errors globally
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't auto-logout on network errors
        if (!error.response) {
          console.error('Network error:', error.message);
          return Promise.reject(error);
        }
        
        // Only auto-logout on 401 Unauthorized errors
        if (error.response.status === 401) {
          console.log('Authentication error detected, token may be invalid');
          // Don't automatically logout here - let individual components handle it
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Only logout on authentication errors (401), not on network or server errors
      if (error.response && error.response.status === 401) {
        console.log('Token expired or invalid, logging out');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.log('Network or server error, not logging out:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${user.firstName}! 🌱`);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        // Handle validation errors
        message = error.response.data.errors[0].msg;
      } else if (error.response?.status === 400) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 401) {
        message = 'Invalid credentials';
      } else if (error.response?.status === 403) {
        message = 'Account access denied';
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        message = 'Network error. Please check your connection.';
      }
      
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      toast.success('Registration successful! Please verify your email.');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyOTP = async (otpData) => {
    try {
      console.log('Sending OTP verification request:', otpData);
      const response = await axios.post('/api/auth/verify-otp', otpData);
      console.log('OTP verification response:', response.data);
      toast.success('Email verified successfully! You can now login.');
      return { success: true, message: response.data.message, data: response.data };
    } catch (error) {
      console.error('OTP verification error:', error);
      const message = error.response?.data?.message || 'OTP verification failed';
      console.error('Error details:', error.response?.data);
      toast.error(message);
      return { success: false, message, error: error.response?.data };
    }
  };

  const forgotPassword = async (email, recaptchaToken) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { 
        email, 
        recaptchaToken 
      });
      toast.success('Password reset OTP sent to your email!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await axios.post('/api/auth/reset-password', resetData);
      toast.success('Password reset successfully! You can now login.');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resendOTP = async (email, type = 'verification') => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { email, type });
      toast.success('New OTP sent to your email!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // If it's just an avatar update (upload or delete), update user state directly
      if (profileData.avatar !== undefined && Object.keys(profileData).length === 1) {
        console.log('AuthContext: Updating user avatar to:', profileData.avatar);
        const newUser = { ...user, avatar: profileData.avatar };
        setUser(newUser);
        console.log('AuthContext: User state updated:', newUser);
        return { success: true, user: newUser };
      }
      
      // For other profile updates, make API call
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully! 🌱');
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  const refreshProfile = async () => {
    try {
      return await fetchUserProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Don't throw the error to prevent components from breaking
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    resendOTP,
    updateProfile,
    refreshProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}