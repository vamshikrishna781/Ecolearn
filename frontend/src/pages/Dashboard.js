import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  Leaf
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's game progress and stats
      const [progressRes, leaderboardRes] = await Promise.all([
        axios.get('/api/game/progress'),
        axios.get('/api/users/leaderboard?type=school&limit=5')
      ]);

      setStats(progressRes.data);
      setRecentActivity([
        { 
          id: 1, 
          action: 'Completed Chapter 1: The Asteroid Strike', 
          points: 100, 
          date: new Date().toISOString() 
        },
        { 
          id: 2, 
          action: 'Earned Tree Planter Badge', 
          points: 50, 
          date: new Date(Date.now() - 86400000).toISOString() 
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getNextLevel = () => {
    const currentLevel = user?.level || 1;
    const currentPoints = user?.ecoPoints || 0;
    const pointsNeeded = (currentLevel * 1000) - currentPoints;
    return pointsNeeded > 0 ? pointsNeeded : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {user?.firstName}! 🌱
        </h1>
        <p className="text-gray-600">
          Ready to continue your environmental learning journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eco-Points</p>
              <p className="text-3xl font-bold text-green-600">
                {user?.ecoPoints || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {getNextLevel() > 0 
                ? `${getNextLevel()} points to level ${(user?.level || 1) + 1}`
                : 'Max level reached!'
              }
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Level</p>
              <p className="text-3xl font-bold text-primary-600">
                {user?.level || 1}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-3xl font-bold text-yellow-600">
                {user?.badges?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Chapter</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.gameProgress?.currentChapter || 1}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Game Progress */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">🎮 Game Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">The Asteroid Strike</h4>
                    <p className="text-sm text-gray-600">Learn about the catastrophe</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Human Response</h4>
                    <p className="text-sm text-gray-600">Sustainable rebuilding</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  In Progress
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Rebuilding Together</h4>
                    <p className="text-sm text-gray-600">Ecosystem restoration</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Locked
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href="/game" 
                className="btn-primary inline-flex items-center"
              >
                Continue Game
                <BookOpen className="ml-2" size={16} />
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Recent Activity</h3>
            
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Leaf className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">
                    +{activity.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
            
            <div className="space-y-3">
              <a 
                href="/game"
                className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen className="text-blue-600 mr-3" size={20} />
                  <span className="font-medium">Continue Story</span>
                </div>
              </a>
              
              <a 
                href="/leaderboard"
                className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Trophy className="text-yellow-600 mr-3" size={20} />
                  <span className="font-medium">View Leaderboard</span>
                </div>
              </a>
              
              <button className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Target className="text-green-600 mr-3" size={20} />
                  <span className="font-medium">Take Challenge</span>
                </div>
              </button>
            </div>
          </div>

          {/* Badges */}
          {user?.badges && user.badges.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">🏆 Latest Badges</h3>
              
              <div className="space-y-3">
                {user.badges.slice(-3).map((badge, index) => (
                  <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Award className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environmental Tip */}
          <div className="card p-6 bg-gradient-to-r from-green-500 to-primary-500 text-white">
            <h3 className="text-lg font-semibold mb-2">💡 Daily Eco-Tip</h3>
            <p className="text-sm opacity-90">
              Did you know? Planting just one tree can absorb up to 48 pounds of CO2 per year! 
              Start your tree planting challenge today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;