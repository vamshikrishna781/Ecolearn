import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, School, Calendar, Save, X, Camera, Edit3, Award, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Refresh profile data when component mounts (only if user exists)
  React.useEffect(() => {
    if (user && !user.avatar) {
      console.log('Profile component mounted, refreshing profile data...');
      refreshProfile().catch(error => {
        console.error('Error refreshing profile:', error);
        // Don't logout on profile refresh errors
      });
    }
  }, [refreshProfile, user]);

  // Debug avatar information
  console.log('Profile Component - User data:', user);
  console.log('User avatar field:', user?.avatar);
  console.log('Avatar URL would be:', user?.avatar ? `http://localhost:5000${user.avatar}` : 'No avatar');
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
  });

  const handleSave = async () => {
    const result = await updateProfile(editForm);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update user context with new avatar
        updateProfile({ avatar: result.avatarUrl });
        alert('Profile picture updated successfully!');
      } else {
        alert(result.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return;
    
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsDeletingAvatar(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update user context to remove avatar
        updateProfile({ avatar: '' });
        alert('Profile picture deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete profile picture');
      }
    } catch (error) {
      console.error('Avatar delete error:', error);
      alert('Failed to delete profile picture');
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = `DELETE_${user?.firstName}_ACCOUNT`;
    const userInput = window.prompt(
      `⚠️ WARNING: This action is irreversible!\n\n` +
      `This will permanently delete your account and all associated data including:\n` +
      `• Profile information\n` +
      `• Game progress and achievements\n` +
      `• Eco-points and badges\n` +
      `• All uploaded content\n\n` +
      `To confirm deletion, type: ${confirmText}`
    );

    if (userInput !== confirmText) {
      if (userInput !== null) {
        alert('Account deletion cancelled - confirmation text did not match.');
      }
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Your account has been permanently deleted. You will now be logged out.');
        logout();
        navigate('/');
      } else {
        alert(result.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user?.avatar && user.avatar.trim() ? (
                <>
                  <img
                    src={`http://localhost:5000${user.avatar}`}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                    onLoad={() => console.log('Avatar loaded successfully:', `http://localhost:5000${user.avatar}`)}
                    onError={(e) => {
                      console.error('Avatar image failed to load:', e.target.src);
                      console.error('User avatar path:', user.avatar);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                    <User className="text-green-600" size={48} />
                  </div>
                </>
              ) : (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="text-green-600" size={48} />
                </div>
              )}
              
              {/* Upload button */}
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors shadow-md"
                title="Change profile picture"
              >
                {isUploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="text-white" size={16} />
                )}
              </label>
              
              {/* Delete button - only show if user has avatar */}
              {user?.avatar && user.avatar.trim() && (
                <button
                  onClick={handleAvatarDelete}
                  disabled={isDeletingAvatar || isUploadingAvatar}
                  className="absolute -bottom-1 -left-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                  title="Delete profile picture"
                >
                  {isDeletingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <X className="text-white" size={16} />
                  )}
                </button>
              )}
              
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar || isDeletingAvatar}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              {user?.role === 'student' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Level {user?.level || 1}
                </span>
              )}
            </div>
          </div>

          {/* Stats Card for Students */}
          {user?.role === 'student' && (
            <div className="card p-6 mt-6">
              <h4 className="font-semibold mb-4">🎮 Game Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Eco-Points:</span>
                  <span className="font-semibold text-green-600">{user?.ecoPoints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-semibold">{user?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Badges:</span>
                  <span className="font-semibold text-yellow-600">{user?.badges?.length || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary text-sm"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary text-sm"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-outline text-sm"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-900">{user?.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-900">{user?.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    className="input"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>

              {user?.school && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <School size={16} className="inline mr-2" />
                    School/College
                  </label>
                  <p className="text-gray-900">{user.school.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.school.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          {user?.badges && user.badges.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">🏆 Achievements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {user.badges.map((badge, index) => (
                  <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Award className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dangerous Actions Section */}
          <div className="card p-6 border-red-200">
            <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Dangerous Actions</h3>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeletingAccount ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;