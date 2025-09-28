import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizSystem = ({ quizId, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Sample quiz data - would come from backend in production
  const sampleQuizData = {
    id: quizId,
    title: 'Environmental Awareness Quiz',
    description: 'Test your knowledge about environmental conservation',
    timeLimit: 300,
    questions: [
      {
        id: 1,
        question: 'Which action helps reduce carbon footprint the most?',
        options: [
          'Using public transport',
          'Leaving lights on all day',
          'Burning plastic waste',
          'Using single-use items'
        ],
        correctAnswer: 0,
        explanation: 'Public transport significantly reduces individual carbon emissions compared to private vehicles.'
      },
      {
        id: 2,
        question: 'What percentage of Earth\'s water is freshwater?',
        options: ['50%', '25%', '3%', '10%'],
        correctAnswer: 2,
        explanation: 'Only about 3% of Earth\'s water is freshwater, making water conservation crucial.'
      },
      {
        id: 3,
        question: 'Which renewable energy source is most abundant?',
        options: ['Wind', 'Solar', 'Hydroelectric', 'Geothermal'],
        correctAnswer: 1,
        explanation: 'Solar energy is the most abundant renewable energy source available on Earth.'
      },
      {
        id: 4,
        question: 'How long does it take for plastic bags to decompose?',
        options: ['1-5 years', '10-20 years', '50-100 years', '500-1000 years'],
        correctAnswer: 3,
        explanation: 'Plastic bags can take 500-1000 years to decompose, highlighting the importance of reusable alternatives.'
      },
      {
        id: 5,
        question: 'Which gas is the primary contributor to greenhouse effect?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 1,
        explanation: 'Carbon dioxide is the primary greenhouse gas contributing to global warming.'
      }
    ]
  };

  useEffect(() => {
    // Simulate loading quiz data
    setTimeout(() => {
      setQuizData(sampleQuizData);
      setLoading(false);
    }, 1000);
  }, [quizId]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      handleSubmitQuiz();
    }
  }, [timeLeft, loading, isComplete]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setAnswers({
      ...answers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === '') {
      toast.error('Please select an answer before continuing');
      return;
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / quizData.questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsComplete(true);
    
    // Calculate points based on score
    const pointsEarned = finalScore >= 80 ? 150 : finalScore >= 60 ? 100 : 50;
    
    onComplete({
      score: finalScore,
      points: pointsEarned,
      timeUsed: 300 - timeLeft,
      totalQuestions: quizData.questions.length,
      correctAnswers: Object.keys(answers).filter(key => 
        answers[key] === quizData.questions[key].correctAnswer
      ).length
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Trophy className={`${
              score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`} size={32} />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-4xl font-bold text-green-600 mb-4">{score}%</p>
          
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>Correct Answers: {Object.keys(answers).filter(key => 
              answers[key] === quizData.questions[key].correctAnswer
            ).length}/{quizData.questions.length}</p>
            <p>Time Used: {formatTime(300 - timeLeft)}</p>
            <p>Points Earned: {score >= 80 ? 150 : score >= 60 ? 100 : 50}</p>
          </div>
          
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{quizData.title}</h2>
              <p className="opacity-90">Question {currentQuestion + 1} of {quizData.questions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-green-700 p-2 rounded"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-green-500 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {quizData.questions[currentQuestion].question}
            </h3>
            
            <div className="space-y-3">
              {quizData.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selectedAnswer === index
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedAnswer === index
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <CheckCircle className="text-white" size={16} />
                      )}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              className="btn-primary flex items-center"
            >
              {currentQuestion === quizData.questions.length - 1 ? 'Submit Quiz' : 'Next'}
              <ArrowRight className="ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSystem;