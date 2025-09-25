import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, Users, School, Globe, Crown } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = {
        type: activeTab,
        limit: 50
      };
      
      if (activeTab === 'school' && user?.school) {
        params.schoolId = user.school._id;
      }

      const response = await axios.get('/api/users/leaderboard', { params });
      setLeaderboardData(response.data);
      
      // Find current user's rank
      const currentUserIndex = response.data.findIndex(u => u._id === user?._id);
      setUserRank(currentUserIndex >= 0 ? currentUserIndex + 1 : null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-600" size={24} />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: Globe },
    ...(user?.school ? [{ id: 'school', label: user.school.name, icon: School }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Eco Champions Leaderboard
        </h1>
        <p className="text-gray-600">
          See how you rank among environmental champions worldwide
        </p>
      </div>

      {/* User's Current Rank */}
      {userRank && (
        <div className="card p-6 mb-8 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trophy className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Current Rank</h3>
                <p className="opacity-90">
                  {activeTab === 'global' ? 'Global Ranking' : `${user?.school?.name} Ranking`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">#{userRank}</div>
              <div className="opacity-90">{user?.ecoPoints || 0} points</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {activeTab === 'global' ? '🌍 Global Rankings' : `🏠 ${user?.school?.name} Rankings`}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <Users size={16} className="mr-1" />
              {leaderboardData.length} participants
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((participant, index) => {
              const rank = index + 1;
              const isCurrentUser = participant._id === user?._id;
              
              return (
                <div
                  key={participant._id}
                  className={`p-6 flex items-center space-x-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-green-50 border-l-4 border-l-green-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>

                  {/* Rank Badge for top 3 */}
                  {rank <= 3 && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      getRankBadgeColor(rank)
                    }`}>
                      {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {participant.firstName} {participant.lastName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Level {participant.level}
                      </span>
                    </div>
                    
                    {participant.school && (
                      <p className="text-sm text-gray-500 truncate">
                        {participant.school.name}
                      </p>
                    )}
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-green-600">
                      {participant.ecoPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              );
            })}

            {leaderboardData.length === 0 && (
              <div className="p-12 text-center">
                <Trophy className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No participants yet
                </h3>
                <p className="text-gray-500">
                  Be the first to earn eco-points and climb the leaderboard!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Achievement Insights */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown className="text-yellow-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Top Performer</h3>
          <p className="text-sm text-gray-600">
            {leaderboardData[0] ? (
              `${leaderboardData[0].firstName} leads with ${leaderboardData[0].ecoPoints.toLocaleString()} points`
            ) : (
              'No data available'
            )}
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Average Score</h3>
          <p className="text-sm text-gray-600">
            {leaderboardData.length > 0 ? (
              `${Math.round(
                leaderboardData.reduce((sum, p) => sum + p.ecoPoints, 0) / leaderboardData.length
              ).toLocaleString()} points`
            ) : (
              'No data available'
            )}
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Total Participants</h3>
          <p className="text-sm text-gray-600">
            {leaderboardData.length} eco-champions
          </p>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="mt-8 card p-6 bg-gradient-to-r from-green-500 to-primary-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🌟 Climb the Rankings!</h3>
            <p className="opacity-90 mb-4">
              Complete challenges, plant trees, and take eco-friendly actions to earn points.
            </p>
            <a href="/game" className="btn bg-white text-green-700 hover:bg-gray-100">
              Start New Challenge
            </a>
          </div>
          <div className="hidden md:block">
            <Trophy size={80} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;