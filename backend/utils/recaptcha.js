// Custom reCAPTCHA implementation with enhanced security
const crypto = require('crypto');

// Store used tokens and valid challenges temporarily (in production, use Redis)
const usedTokens = new Set();
const tokenTimestamps = new Map();
const validChallenges = new Map(); // Store token -> answer mapping

// Clean up old tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of tokenTimestamps.entries()) {
    if (now - timestamp > 600000) { // 10 minutes
      usedTokens.delete(token);
      tokenTimestamps.delete(token);
      validChallenges.delete(token);
      validChallenges.delete(token + '_verified');
    }
  }
}, 600000);

const verifyRecaptcha = async (token) => {
  try {
    global.logToFile && global.logToFile('INFO', 'reCAPTCHA verification attempt', { 
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
    
    if (!token) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: No token provided');
      return false;
    }

    // Check token format (custom_timestamp_randomstring)
    if (!token.startsWith('custom_') || token.length < 20) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Invalid token format', { token });
      return false;
    }

    // Check if token was already used
    if (usedTokens.has(token)) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Token already used', { token });
      return false;
    }

    // Check if this token was pre-verified through the verify endpoint
    const isPreVerified = validChallenges.has(token + '_verified');
    const isInValidChallenges = validChallenges.has(token);
    
    if (!isPreVerified && !isInValidChallenges) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Token not verified or invalid', { token });
      return false;
    }
    
    global.logToFile && global.logToFile('INFO', 'reCAPTCHA token validation passed', { 
      token, 
      isPreVerified,
      isInValidChallenges 
    });

    // Extract timestamp from token
    const parts = token.split('_');
    if (parts.length < 3) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Invalid token structure', { token });
      return false;
    }

    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    
    // Check if token is not too old (10 minutes max)
    if (now - timestamp > 600000) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Token expired', { 
        token,
        tokenAge: now - timestamp
      });
      return false;
    }

    // Check if token is not from the future (allow 1 minute clock skew)
    if (timestamp > now + 60000) {
      global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification failed: Token from future', { 
        token,
        timeDiff: timestamp - now
      });
      return false;
    }

    // Mark token as used and clean up
    usedTokens.add(token);
    validChallenges.delete(token); // Remove from valid challenges once used
    validChallenges.delete(token + '_verified'); // Remove verified flag
    tokenTimestamps.set(token, now);
    
    // Log successful verification
    global.logToFile && global.logToFile('INFO', 'reCAPTCHA verification completed successfully', { 
      token,
      wasPreVerified: isPreVerified,
      wasInValidChallenges: isInValidChallenges 
    });
    
    global.logToFile && global.logToFile('INFO', 'reCAPTCHA verification successful', { token });
    return true;
    
  } catch (error) {
    global.logToFile && global.logToFile('ERROR', 'reCAPTCHA verification error', { 
      error: error.message,
      token
    });
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

const generateRecaptchaChallenge = () => {
  // Generate 6-character alphanumeric challenge for custom reCAPTCHA
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let challengeText = '';
  
  // Generate exactly 6 random characters
  for (let i = 0; i < 6; i++) {
    challengeText += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generate a secure token with timestamp and random string
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const token = `custom_${timestamp}_${randomString}`;
  
  // Store the challenge for verification
  validChallenges.set(token, challengeText);
  tokenTimestamps.set(token, timestamp);
  
  return {
    challenge: `Type exactly: ${challengeText}`,
    answer: challengeText,
    token: token,
    displayText: challengeText
  };
};

module.exports = { verifyRecaptcha, generateRecaptchaChallenge, validChallenges };