import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const CustomRecaptcha = ({ onVerify, className = '' }) => {
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  const generateChallenge = async () => {
    setIsLoading(true);
    setVerificationStatus('Loading challenge...');
    setError('');
    setChallenge(null);
    
    try {
      console.log('Fetching reCAPTCHA challenge from backend...');
      // Fetch challenge from backend to ensure server knows the token
      // Use proxy configuration from package.json
      const response = await fetch(`/api/auth/recaptcha?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const challengeData = await response.json();
      console.log('reCAPTCHA challenge received:', challengeData);
      
      // Validate the challenge data
      if (!challengeData.displayText || !challengeData.token || !challengeData.answer) {
        console.error('Invalid challenge data:', challengeData);
        throw new Error('Invalid challenge data received from server');
      }
      
      console.log('Setting challenge state...');
      setChallenge({
        question: challengeData.challenge,
        answer: challengeData.answer,
        token: challengeData.token,
        displayText: challengeData.displayText
      });
      
      console.log('Challenge state set successfully');
      
      setUserAnswer('');
      setIsVerified(false);
      setVerificationStatus('');
      // Clear previous token when generating new question
      onVerify('');
    } catch (error) {
      console.error('Failed to generate reCAPTCHA challenge:', error);
      setError(`Failed to load challenge: ${error.message}`);
      setVerificationStatus('');
      setChallenge(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challenge) return;
    
    // Validate answer on frontend first
    if (userAnswer.trim() !== challenge.answer) {
      setError('Incorrect answer. Please try again.');
      setIsVerified(false);
      onVerify('');
      // Generate new challenge after wrong answer
      setTimeout(generateChallenge, 1000);
      return;
    }
    
    // If frontend validation passes, validate with backend
    setVerificationStatus('Verifying with server...');
    try {
      // Use proxy configuration from package.json
      const response = await fetch('/api/auth/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: challenge.token,
          answer: userAnswer.trim()
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.valid) {
        setIsVerified(true);
        setError('');
        setVerificationStatus('✅ Verified successfully!');
        onVerify(challenge.token);
      } else {
        setError(result.message || 'Verification failed. Please try again.');
        setIsVerified(false);
        setVerificationStatus('❌ Verification failed');
        onVerify('');
        setTimeout(generateChallenge, 1000);
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      // Fallback to frontend-only validation if backend is not available
      console.warn('Backend verification failed, using frontend-only validation');
      setIsVerified(true);
      setError('');
      setVerificationStatus('✅ Verified (offline mode)');
      onVerify(challenge.token);
    }
  };

  useEffect(() => {
    generateChallenge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 recaptcha-container ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-medium text-gray-700">
          🔒 Security Check {challenge ? '✓' : '⏳'}
        </span>
        <button
          type="button"
          onClick={generateChallenge}
          className="text-gray-500 hover:text-gray-700 p-1 transition-colors touch-manipulation"
          title="Generate new challenge"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Always show the challenge area, even if loading */}
      <div className="space-y-3">
        {!challenge && isLoading && (
          <div className="text-center py-4">
            <div className="text-blue-600 flex items-center justify-center">
              <span className="mr-2">⏳</span>
              Loading challenge...
            </div>
          </div>
        )}
        
        {!challenge && !isLoading && (
          <div className="text-center py-4">
            <div className="text-red-600 flex items-center justify-center mb-2">
              <span className="mr-2">❌</span>
              Failed to load challenge
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Please try refreshing or check your internet connection
            </p>
            <button 
              onClick={generateChallenge}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 touch-manipulation"
            >
              Retry Loading
            </button>
          </div>
        )}
        
        {challenge && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">
              Enter the code:
            </div>
            <div className="text-xl sm:text-2xl font-bold bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded border-2 border-dashed border-gray-300 text-center tracking-widest font-mono text-green-700 min-h-[50px] flex items-center justify-center">
              {challenge.displayText}
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userAnswer.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono text-base sm:text-lg tracking-widest min-h-[48px] touch-manipulation"
              placeholder="Enter 6-character code"
              maxLength="6"
              disabled={isVerified}
            />
            <div className="flex justify-center mt-3">
              {!isVerified && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-3 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-base sm:text-sm font-medium transition-colors min-h-[44px] touch-manipulation"
                >
                  Verify Text
                </button>
              )}
              {isVerified && (
                <span className="px-6 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                  ✓ Text Verified
                </span>
              )}
            </div>
          </div>
          
          {isLoading && (
            <p className="text-blue-600 text-sm flex items-center">
              <span className="mr-2">⏳</span>
              Loading...
            </p>
          )}
          
          {verificationStatus && !isLoading && (
            <p className="text-gray-600 text-sm">
              {verificationStatus}
            </p>
          )}
          
          {error && (
            <p className="text-red-600 text-sm flex items-center">
              <span className="mr-1">❌</span>
              {error}
            </p>
          )}
          
          {isVerified && (
            <div className="flex items-center text-green-600 text-sm">
              <span className="mr-2">✅</span>
              Security check passed
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            Enter the 6-character code exactly as shown
          </p>
        </div>
        )}
      </div>
    </div>
  );
};

export default CustomRecaptcha;