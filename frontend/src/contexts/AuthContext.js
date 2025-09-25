import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

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
      const message = error.response?.data?.message || 'Login failed';
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}