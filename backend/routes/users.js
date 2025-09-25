const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth, teacherAuth } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('school');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    delete updates.password; // Don't allow password updates here
    delete updates.email; // Don't allow email updates here
    delete updates.role; // Don't allow role updates here

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password').populate('school');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'global', schoolId } = req.query;
    let filter = { isActive: true };

    if (type === 'school' && schoolId) {
      filter.school = schoolId;
    } else if (type === 'school' && req.user.school) {
      filter.school = req.user.school;
    }

    const users = await User.find(filter)
      .select('firstName lastName ecoPoints level school avatar')
      .populate('school', 'name')
      .sort({ ecoPoints: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create student account (teacher/admin only)
router.post('/create-student', [auth, teacherAuth], [
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

    const student = new User({
      email,
      password: tempPassword,
      firstName,
      lastName,
      role: 'student',
      school,
      isVerified: true, // Auto-verify teacher-created accounts
      createdBy: req.user._id
    });

    await student.save();

    res.status(201).json({
      message: 'Student account created successfully',
      student: {
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        tempPassword
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;