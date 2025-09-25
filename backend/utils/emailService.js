const nodemailer = require('nodemailer');

// Create transporter with better error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // Skip email verification in development
  console.log('📧 Email service configured for development');
  global.logToFile && global.logToFile('INFO', 'Email service configured for development');
} catch (error) {
  console.error('Failed to create email transporter:', error);
  global.logToFile && global.logToFile('ERROR', 'Email transporter creation failed', { error: error.message });
}

const sendOTPEmail = async (email, otp, type = 'verify') => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured');
    }
    
    global.logToFile && global.logToFile('INFO', `Attempting to send OTP email`, { 
      email, 
      type, 
      hasOtp: !!otp,
      emailUser: process.env.EMAIL_USER 
    });
    
    const subject = type === 'verify' ? 
      '🌱 Ecolearn - Email Verification OTP' : 
      '🌱 Ecolearn - Password Reset OTP';

    const html = type === 'verify' ? 
      getVerificationEmailTemplate(otp) : 
      getResetEmailTemplate(otp);

    const mailOptions = {
      from: `"Ecolearn 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
      text: `Your Ecolearn ${type === 'verify' ? 'verification' : 'password reset'} OTP is: ${otp}. This code will expire in 10 minutes.`
    };

    const result = await transporter.sendMail(mailOptions);
    
    global.logToFile && global.logToFile('INFO', `OTP email sent successfully`, {
      email,
      type,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    });
    
    console.log(`OTP email sent to: ${email}`, {
      messageId: result.messageId,
      accepted: result.accepted
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    const errorDetails = {
      email,
      type,
      error: error.message,
      code: error.code,
      command: error.command
    };
    
    global.logToFile && global.logToFile('ERROR', 'Failed to send OTP email', errorDetails);
    console.error('Error sending email:', errorDetails);
    
    // Don't expose internal email errors to client
    throw new Error('Failed to send verification email. Please try again or contact support.');
  }
};

const getVerificationEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #2e7d32; font-size: 24px; font-weight: bold; }
        .otp-box { background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #2e7d32; letter-spacing: 5px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌱 Ecolearn</div>
          <h2>Welcome to the Environmental Learning Revolution!</h2>
        </div>
        
        <p>Thank you for joining Ecolearn! Please verify your email address to start your eco-journey.</p>
        
        <div class="otp-box">
          <p>Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p><small>This code will expire in 10 minutes</small></p>
        </div>
        
        <p>Once verified, you'll be able to:</p>
        <ul>
          <li>🎮 Play our interactive environmental game</li>
          <li>🏆 Earn eco-points and badges</li>
          <li>🌍 Learn about climate action</li>
          <li>🏫 Compete with your school</li>
        </ul>
        
        <div class="footer">
          <p>Together, we can build a sustainable future! 🌱</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getResetEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #d32f2f; font-size: 24px; font-weight: bold; }
        .otp-box { background: #ffebee; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #d32f2f; letter-spacing: 5px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌱 Ecolearn</div>
          <h2>Password Reset Request</h2>
        </div>
        
        <p>We received a request to reset your password. Use the code below to reset it:</p>
        
        <div class="otp-box">
          <p>Your password reset code is:</p>
          <div class="otp-code">${otp}</div>
          <p><small>This code will expire in 10 minutes</small></p>
        </div>
        
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        
        <div class="footer">
          <p>Stay secure, stay green! 🌱</p>
          <p>Ecolearn Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { sendOTPEmail };