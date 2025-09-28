import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  Trophy, 
  GamepadIcon, 
  Settings, 
  LogOut,
  Users,
  Target,
  Building,
  Leaf
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug user data in Navbar
  console.log('Navbar - User data:', user);
  console.log('Navbar - User avatar:', user?.avatar);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/game', icon: GamepadIcon, label: 'Game' },
    { path: '/challenges', icon: Target, label: 'Challenges' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/sponsors', icon: Building, label: 'Sponsors' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
  }

  return (
    <nav className="bg-white shadow-lg border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center">
                <Leaf className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold eco-text-gradient">
                Ecolearn
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Points (if student) */}
            {user?.role === 'student' && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <span className="text-green-700 font-medium">
                  {user.ecoPoints || 0} points
                </span>
                <div className="w-1 h-1 bg-green-400 rounded-full" />
                <span className="text-green-600 text-sm">
                  Level {user.level || 1}
                </span>
              </div>
            )}

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              {user?.avatar && user.avatar.trim() ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  onLoad={() => console.log('Navbar avatar loaded:', user.avatar)}
                  onError={(e) => {
                    console.error('Navbar avatar failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
              ) : null}
              {(!user?.avatar || !user.avatar.trim()) && <User size={18} />}
              <span className="hidden sm:inline">
                {user?.firstName}
              </span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 text-xs ${
                  isActive(item.path)
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;