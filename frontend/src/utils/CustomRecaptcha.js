import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const CustomRecaptcha = ({ onVerify, className = '' }) => {
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const generateChallenge = () => {
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
    
    setChallenge({
      question: `Type exactly: ${challengeText}`,
      answer: challengeText,
      token: `custom_${timestamp}_${randomString}`,
      displayText: challengeText
    });
    
    setUserAnswer('');
    setIsVerified(false);
    setError('');
    // Clear previous token when generating new question
    onVerify('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!challenge) return;
    
    if (userAnswer.trim() === challenge.answer) {
      setIsVerified(true);
      setError('');
      onVerify(challenge.token);
    } else {
      setError('Incorrect answer. Please try again.');
      setIsVerified(false);
      onVerify('');
      // Generate new challenge after wrong answer
      setTimeout(generateChallenge, 1000);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateChallenge();
  }, []);

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-end mb-3">
        <button
          type="button"
          onClick={generateChallenge}
          className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
          title="Generate new challenge"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {challenge && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">
              Enter the code:
            </div>
            <div className="text-2xl font-bold bg-gray-100 px-4 py-3 rounded border-2 border-dashed border-gray-300 text-center tracking-widest font-mono text-green-700">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono text-lg tracking-widest"
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
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
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
  );
};

export default CustomRecaptcha;