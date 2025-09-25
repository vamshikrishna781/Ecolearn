import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Leaf, Mail, Lock, User } from 'lucide-react';
import CustomRecaptcha from '../utils/CustomRecaptcha';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(() => {
    // Persist step state to prevent accidental resets
    const savedStep = sessionStorage.getItem('ecolearn_reg_step');
    return savedStep ? parseInt(savedStep) : 1;
  }); // 1: Register, 2: Verify OTP
  const [userEmail, setUserEmail] = useState(() => {
    return sessionStorage.getItem('ecolearn_reg_email') || '';
  });
  const [debugInfo, setDebugInfo] = useState('');
  const { register: authRegister, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    console.log('=== REGISTRATION STARTED ===');
    console.log('Step:', step, 'Data:', data);
    
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    setIsLoading(true);
    setDebugInfo('Sending registration request...');
    
    try {
      const result = await authRegister({
        ...data,
        recaptchaToken
      });
      
      console.log('Registration result:', result);
      setDebugInfo(`Registration result: ${JSON.stringify(result)}`);
      
      if (result && result.success) {
        console.log('Registration successful, setting step to 2');
        setUserEmail(data.email);
        sessionStorage.setItem('ecolearn_reg_email', data.email);
        setStep(2);
        sessionStorage.setItem('ecolearn_reg_step', '2');
        setDebugInfo('Registration successful! Check your email for OTP.');
      } else {
        console.log('Registration failed:', result);
        setDebugInfo(`Registration failed: ${result?.message || 'Unknown error'}`);
        alert(`Registration failed: ${result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setDebugInfo(`Registration error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    console.log('=== OTP VERIFICATION STARTED ===');
    console.log('Current step:', step, 'User email:', userEmail);
    
    const formData = new FormData(e.target);
    const otp = formData.get('otp');
    
    console.log('OTP entered:', otp);

    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      setDebugInfo('Invalid OTP format');
      return;
    }

    setIsLoading(true);
    setDebugInfo(`Verifying OTP ${otp} for ${userEmail}...`);
    console.log('Verifying OTP for email:', userEmail, 'OTP:', otp);
    
    try {
      const result = await verifyOTP({
        email: userEmail,
        otp: otp.trim()
      });
      
      console.log('OTP verification result:', result);
      setDebugInfo(`OTP verification result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        console.log('OTP verification successful, navigating to login...');
        setDebugInfo('✅ Email verified successfully! Redirecting to login...');
        
        // Show success message and redirect
        alert('🎉 Email verified successfully! Redirecting to login...');
        
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          console.log('Executing navigation to login...');
          // Clear session storage
          sessionStorage.removeItem('ecolearn_reg_step');
          sessionStorage.removeItem('ecolearn_reg_email');
          navigate('/login', { 
            replace: true, 
            state: { 
              message: 'Registration complete! Please login with your credentials.',
              email: userEmail 
            } 
          });
        }, 1000);
      } else {
        console.error('OTP verification failed:', result.message);
        setDebugInfo(`❌ OTP verification failed: ${result.message}`);
        alert(`OTP verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setDebugInfo(`❌ Error: ${error.message}`);
      alert('An error occurred during OTP verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await resendOTP(userEmail);
    setIsLoading(false);
  };

  const resetRegistration = () => {
    sessionStorage.removeItem('ecolearn_reg_step');
    sessionStorage.removeItem('ecolearn_reg_email');
    setStep(1);
    setUserEmail('');
    setDebugInfo('Registration reset');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center">
                <Mail className="text-white" size={32} />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold eco-text-gradient">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to {userEmail}
            </p>
            {debugInfo && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">Debug: {debugInfo}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleOTPVerification} className="mt-8 space-y-6">
            <div>
              <input
                name="otp"
                type="text"
                maxLength="6"
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="font-medium text-green-600 hover:text-green-500 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </span>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={resetRegistration}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                🔄 Start Over
              </button>
            </div>
          </form>
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
            Join Ecolearn
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your environmental learning journey today
          </p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">Debug: {debugInfo}</p>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('firstName', {
                    required: 'First name is required'
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="First Name"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('lastName', {
                    required: 'Last name is required'
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Last Name"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
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

            {/* Password */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="input pl-10"
                  placeholder="Confirm Password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* reCAPTCHA */}
          <CustomRecaptcha onVerify={setRecaptchaToken} />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !recaptchaToken}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;