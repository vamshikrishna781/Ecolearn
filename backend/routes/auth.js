const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');
const { verifyRecaptcha, generateRecaptchaChallenge } = require('../utils/recaptcha');

const router = express.Router();

// Helper function for logging auth events
const logAuthEvent = (event, email, success, error = null, additionalData = {}) => {
  const logData = {
    event,
    email,
    success,
    error: error ? error.message : null,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
  
  if (success) {
    global.logToFile('INFO', `Auth ${event} successful for ${email}`, logData);
  } else {
    global.logToFile('ERROR', `Auth ${event} failed for ${email}`, logData);
  }
};

// Generate reCAPTCHA challenge
router.get('/recaptcha', async (req, res) => {
  try {
    const challenge = generateRecaptchaChallenge();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate reCAPTCHA challenge' });
  }
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
], async (req, res) => {
  const { email, password, firstName, lastName, role, school, recaptchaToken } = req.body;
  
  try {
    logAuthEvent('REGISTRATION_ATTEMPT', email, null, null, { role, hasSchool: !!school });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuthEvent('REGISTRATION', email, false, new Error('Validation failed'), { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      logAuthEvent('REGISTRATION', email, false, new Error('reCAPTCHA verification failed'));
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logAuthEvent('REGISTRATION', email, false, new Error('User already exists'));
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
      school: school || null
    });

    await user.save();
    logAuthEvent('USER_CREATED', email, true, null, { userId: user._id, role: user.role });

    // Generate and send OTP
    const otpCode = OTP.generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      type: 'verification'
    });
    await otp.save();
    
    logAuthEvent('OTP_GENERATED', email, true, null, { otpId: otp._id, type: 'verification' });

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 DEV MODE: OTP for ${email} is: ${otpCode}`);
        logAuthEvent('OTP_DEV_MODE', email, true, null, { otp: otpCode });
      } else {
        await sendOTPEmail(email, otpCode, 'verify');
      }
      logAuthEvent('OTP_EMAIL_SENT', email, true, null);
    } catch (emailError) {
      logAuthEvent('OTP_EMAIL_FAILED', email, false, emailError);
      // Don't fail registration if email fails, user can resend OTP
    }

    logAuthEvent('REGISTRATION', email, true, null, { userId: user._id });
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    logAuthEvent('REGISTRATION', email, false, error);
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  const { email, otp, type } = req.body;
  
  try {
    logAuthEvent('OTP_VERIFICATION_ATTEMPT', email, null, null, { type: type || 'verification' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuthEvent('OTP_VERIFICATION', email, false, new Error('Validation failed'), { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    // Find OTP with detailed logging
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: type || 'verification',
      used: false 
    });

    if (!otpRecord) {
      // Check if OTP exists but is used or expired
      const anyOtpRecord = await OTP.findOne({ email, otp });
      if (anyOtpRecord) {
        if (anyOtpRecord.used) {
          logAuthEvent('OTP_VERIFICATION', email, false, new Error('OTP already used'));
          return res.status(400).json({ message: 'OTP has already been used' });
        } else {
          logAuthEvent('OTP_VERIFICATION', email, false, new Error('OTP expired'));
          return res.status(400).json({ message: 'OTP has expired' });
        }
      } else {
        logAuthEvent('OTP_VERIFICATION', email, false, new Error('Invalid OTP'));
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      logAuthEvent('OTP_VERIFICATION', email, false, new Error('Too many attempts'));
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    // Increment attempts first
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();
    
    logAuthEvent('OTP_VERIFIED', email, true, null, { otpId: otpRecord._id });

    // Update user verification status
    const updatedUser = await User.findOneAndUpdate(
      { email }, 
      { isVerified: true },
      { new: true }
    );
    
    if (!updatedUser) {
      logAuthEvent('OTP_VERIFICATION', email, false, new Error('User not found'));
      return res.status(400).json({ message: 'User not found' });
    }
    
    logAuthEvent('OTP_VERIFICATION', email, true, null, { userId: updatedUser._id });

    res.json({ 
      message: 'Email verified successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    logAuthEvent('OTP_VERIFICATION', email, false, error);
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      message: 'Server error during OTP verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
], async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  
  try {
    logAuthEvent('LOGIN_ATTEMPT', email, null);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuthEvent('LOGIN', email, false, new Error('Validation failed'), { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      logAuthEvent('LOGIN', email, false, new Error('reCAPTCHA verification failed'));
      return res.status(400).json({ message: 'Security verification failed. Please complete the reCAPTCHA challenge correctly.' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('school');
    if (!user) {
      logAuthEvent('LOGIN', email, false, new Error('User not found'));
      return res.status(401).json({ message: 'No account found with this email address. Please check your email or create a new account.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logAuthEvent('LOGIN', email, false, new Error('Invalid password'), { userId: user._id });
      return res.status(401).json({ message: 'Incorrect password. Please check your password and try again.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      logAuthEvent('LOGIN', email, false, new Error('Email not verified'), { userId: user._id });
      return res.status(400).json({ 
        message: 'Your email address is not verified. Please check your email and click the verification link.',
        needsVerification: true,
        email: user.email
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logAuthEvent('LOGIN', email, false, new Error('Account deactivated'), { userId: user._id });
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support for assistance.' });
    }

    // Generate JWT
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    logAuthEvent('LOGIN', email, true, null, { userId: user._id, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school: user.school,
        ecoPoints: user.ecoPoints,
        level: user.level,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    logAuthEvent('LOGIN', email, false, error);
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found with this email' });
    }

    // Generate and send OTP
    const otpCode = OTP.generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      type: 'password-reset'
    });
    await otp.save();

    await sendOTPEmail(email, otpCode, 'reset');

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'password-reset',
      used: false 
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Update password
    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otpCode = OTP.generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      type: type || 'verification'
    });
    await otp.save();

    await sendOTPEmail(email, otpCode, type === 'password-reset' ? 'reset' : 'verify');

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;