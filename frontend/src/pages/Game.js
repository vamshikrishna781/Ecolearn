import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Play, CheckCircle, Lock, Trophy, Star } from 'lucide-react';
import axios from 'axios';

const Game = () => {
  const { user } = useAuth();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [storyline, setStoryline] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [gameProgress, setGameProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    fetchGameData();
  }, [currentChapter]);

  const fetchGameData = async () => {
    try {
      const [storylineRes, challengesRes, progressRes] = await Promise.all([
        axios.get(`/api/game/storyline/${currentChapter}`),
        axios.get('/api/game/challenges'),
        axios.get('/api/game/progress')
      ]);

      setStoryline(storylineRes.data);
      setChallenges(challengesRes.data.filter(c => c.chapter === currentChapter));
      setGameProgress(progressRes.data.gameProgress);
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId, pointsEarned) => {
    try {
      const response = await axios.post('/api/game/progress', {
        challengeId,
        pointsEarned
      });

      // Update local progress
      setGameProgress(response.data.gameProgress);
      
      // Award badge if it's a special challenge
      if (challengeId === 'chapter2_treeplant') {
        await axios.post('/api/game/badge', {
          name: 'Tree Planter',
          description: 'Planted your first tree for the environment!'
        });
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  const handleChapterComplete = async () => {
    try {
      await axios.post('/api/game/progress', {
        newChapter: currentChapter + 1,
        pointsEarned: 200
      });

      if (storyline?.nextChapter) {
        setCurrentChapter(storyline.nextChapter);
      }
    } catch (error) {
      console.error('Error completing chapter:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎮 Environmental Adventure Game
        </h1>
        <p className="text-gray-600">
          Journey through the post-asteroid world and learn to rebuild sustainably
        </p>
      </div>

      {/* Chapter Navigation */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        {[1, 2, 3].map((chapter) => {
          const isUnlocked = chapter <= (gameProgress?.currentChapter || 1);
          const isCompleted = chapter < (gameProgress?.currentChapter || 1);
          const isCurrent = chapter === currentChapter;
          
          return (
            <button
              key={chapter}
              onClick={() => isUnlocked && setCurrentChapter(chapter)}
              disabled={!isUnlocked}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg min-w-max transition-colors ${
                isCurrent
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : isCompleted
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : isUnlocked
                  ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : isUnlocked ? (
                <BookOpen size={20} />
              ) : (
                <Lock size={20} />
              )}
              <span>Chapter {chapter}</span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Story Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storyline */}
          {storyline && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">{storyline.title}</h2>
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {storyline.content}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">📚 Learning Objectives:</h3>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  {storyline.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              {storyline.nextChapter && (
                <button
                  onClick={handleChapterComplete}
                  className="btn-primary"
                >
                  Complete Chapter (+200 points)
                </button>
              )}
            </div>
          )}

          {/* Challenges */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 Chapter Challenges</h3>
            
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const isCompleted = gameProgress?.completedChallenges?.some(
                  c => c.challengeId === challenge.id
                );
                
                return (
                  <div
                    key={challenge.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{challenge.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            challenge.type === 'story' ? 'bg-blue-100 text-blue-700' :
                            challenge.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                            challenge.type === 'real-world' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {challenge.type}
                          </span>
                          {isCompleted && (
                            <CheckCircle className="text-green-500" size={16} />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                        <div className="flex items-center text-sm text-green-600">
                          <Trophy size={14} className="mr-1" />
                          {challenge.points} points
                        </div>
                      </div>
                      
                      {!isCompleted && (
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="btn-primary text-sm ml-4"
                        >
                          <Play size={14} className="mr-1" />
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">📊 Your Progress</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Chapter:</span>
                <span className="font-semibold">{gameProgress?.currentChapter || 1}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Challenges:</span>
                <span className="font-semibold">
                  {gameProgress?.completedChallenges?.length || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Points:</span>
                <span className="font-semibold text-green-600">
                  {user?.ecoPoints || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Badges */}
          {user?.badges && user.badges.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">🏆 Recent Badges</h3>
              
              <div className="space-y-2">
                {user.badges.slice(-3).map((badge, index) => (
                  <div key={index} className="flex items-center p-2 bg-yellow-50 rounded">
                    <Star className="text-yellow-600 mr-2" size={16} />
                    <div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environmental Tip */}
          <div className="card p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <h3 className="font-semibold mb-2">💡 Eco-Tip</h3>
            <p className="text-sm opacity-90">
              {currentChapter === 1 && "Every species plays a crucial role in maintaining ecosystem balance."}
              {currentChapter === 2 && "Small daily actions can create significant environmental impact over time."}
              {currentChapter === 3 && "Sustainable development means meeting our needs while preserving resources for future generations."}
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{selectedChallenge.title}</h3>
            <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
            
            {selectedChallenge.type === 'quiz' && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Sample Question:</p>
                <p className="font-medium mb-2">Which action helps reduce carbon footprint?</p>
                <div className="space-y-2">
                  {['Using public transport', 'Leaving lights on', 'Wasting water', 'Littering'].map((option, i) => (
                    <button key={i} className="block w-full text-left p-2 border rounded hover:bg-gray-50">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedChallenge.type === 'real-world' && (
              <div className="mb-4">
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  📸 This challenge requires you to take real-world action and upload photo evidence.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  handleCompleteChallenge(selectedChallenge.id, selectedChallenge.points);
                  setSelectedChallenge(null);
                }}
                className="btn-primary flex-1"
              >
                Complete (+{selectedChallenge.points} pts)
              </button>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;