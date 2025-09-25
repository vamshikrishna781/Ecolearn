import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  School,
  UserPlus,
  Settings,
  BarChart3,
  Shield,
  Mail,
  User,
  Building,
  MapPin
} from 'lucide-react';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showCreateSchool, setShowCreateSchool] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, schoolsRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/users?limit=10'),
        axios.get('/api/schools')
      ]);

      setDashboardStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teacherData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      school: formData.get('school')
    };

    try {
      await axios.post('/api/admin/create-teacher', teacherData);
      setShowCreateTeacher(false);
      fetchDashboardData();
      alert('Teacher account created successfully!');
    } catch (error) {
      alert('Error creating teacher: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const schoolData = {
      name: formData.get('name'),
      type: formData.get('type'),
      address: {
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode')
      },
      contact: {
        email: formData.get('contactEmail'),
        phone: formData.get('contactPhone')
      }
    };

    try {
      await axios.post('/api/schools', schoolData);
      setShowCreateSchool(false);
      fetchDashboardData();
      alert('School created successfully!');
    } catch (error) {
      alert('Error creating school: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="text-red-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-gray-600">Manage the Ecolearn platform and users</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-red-700'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardStats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardStats?.totalStudents || 0}
                  </p>
                </div>
                <User className="text-green-600" size={32} />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {dashboardStats?.totalTeachers || 0}
                  </p>
                </div>
                <Shield className="text-purple-600" size={32} />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Schools</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {dashboardStats?.totalSchools || 0}
                  </p>
                </div>
                <School className="text-orange-600" size={32} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateTeacher(true)}
                  className="btn-primary w-full"
                >
                  <UserPlus size={16} className="mr-2" />
                  Create Teacher Account
                </button>
                <button
                  onClick={() => setShowCreateSchool(true)}
                  className="btn-secondary w-full"
                >
                  <Building size={16} className="mr-2" />
                  Add New School
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Eco-Points:</span>
                  <span className="font-semibold">
                    {dashboardStats?.totalEcoPoints?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users (Last 7 days):</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span>Challenges Completed:</span>
                  <span className="font-semibold">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.school?.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.ecoPoints || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schools Tab */}
      {activeTab === 'schools' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">School Management</h2>
            <button
              onClick={() => setShowCreateSchool(true)}
              className="btn-primary"
            >
              <Building size={16} className="mr-2" />
              Add School
            </button>
          </div>
          <div className="grid gap-6 p-6">
            {schools.map((school) => (
              <div key={school._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{school.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{school.type}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {school.address?.city}, {school.address?.state}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Students: <span className="font-semibold">{school.totalStudents}</span></div>
                    <div className="text-gray-600">Teachers: <span className="font-semibold">{school.totalTeachers}</span></div>
                    <div className="text-green-600">Points: <span className="font-semibold">{school.totalEcoPoints}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create Teacher Account</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input name="firstName" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input name="lastName" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <select name="school" className="input" required>
                  <option value="">Select School</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeacher(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create School Modal */}
      {showCreateSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New School</h3>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input name="name" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" className="input" required>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input name="city" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input name="state" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zip Code</label>
                <input name="zipCode" type="text" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input name="contactEmail" type="email" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input name="contactPhone" type="tel" className="input" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create School
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSchool(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;