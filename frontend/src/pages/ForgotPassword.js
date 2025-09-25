import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, ArrowLeft } from 'lucide-react';
import CustomRecaptcha from '../utils/CustomRecaptcha';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('newPassword', '');

  const handleEmailSubmit = async (data) => {
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(data.email, recaptchaToken);
    
    if (result.success) {
      setEmail(data.email);
      setStep(2);
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (data) => {
    setIsLoading(true);
    const result = await resetPassword({
      email,
      otp: data.otp,
      newPassword: data.newPassword
    });
    
    if (result.success) {
      setStep(3); // Success step
    }
    setIsLoading(false);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link
            to="/login"
            className="btn-primary w-full"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center">
              <Leaf className="text-white" size={32} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold eco-text-gradient">
            {step === 1 ? 'Reset Your Password' : 'Enter Reset Code'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? 'Enter your email address and we\'ll send you a reset code'
              : `We've sent a 6-digit code to ${email}`
            }
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleEmailSubmit)}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <CustomRecaptcha onVerify={setRecaptchaToken} />

            <div>
              <button
                type="submit"
                disabled={isLoading || !recaptchaToken}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-green-600 hover:text-green-500"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: OTP & New Password */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(handlePasswordReset)}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                {...register('otp', {
                  required: 'Verification code is required',
                  minLength: {
                    value: 6,
                    message: 'Code must be 6 digits'
                  },
                  maxLength: {
                    value: 6,
                    message: 'Code must be 6 digits'
                  }
                })}
                type="text"
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type="password"
                  className="input pl-10"
                  placeholder="New password"
                />
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: value =>
                      value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="input pl-10"
                  placeholder="Confirm new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center text-green-600 hover:text-green-500 mx-auto"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;