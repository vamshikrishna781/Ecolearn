const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const School = require('../models/School');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalSchools = await School.countDocuments({ isActive: true });
    
    const totalEcoPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$ecoPoints' } } }
    ]);
    
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .populate('school', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalSchools,
        totalEcoPoints: totalEcoPoints[0]?.total || 0
      },
      recentUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with filters
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const { role, school, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (school) filter.school = school;
    
    const users = await User.find(filter)
      .select('-password')
      .populate('school', 'name type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create teacher account
router.post('/create-teacher', [auth, adminAuth], [
  body('email').isEmail().normalizeEmail(),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('school').notEmpty().withMessage('School is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, school } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const teacher = new User({
      email,
      password: tempPassword,
      firstName,
      lastName,
      role: 'teacher',
      school,
      isVerified: true, // Auto-verify admin-created accounts
      createdBy: req.user._id
    });

    await teacher.save();

    res.status(201).json({
      message: 'Teacher account created successfully',
      teacher: {
        id: teacher._id,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        tempPassword
      }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign user to school
router.post('/assign-school', [auth, adminAuth], [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('schoolId').notEmpty().withMessage('School ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, schoolId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { school: schoolId },
      { new: true }
    ).populate('school');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update school statistics
    const school = await School.findById(schoolId);
    if (school) {
      await school.updateStats();
    }

    res.json({
      message: 'User assigned to school successfully',
      user
    });
  } catch (error) {
    console.error('Assign school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;