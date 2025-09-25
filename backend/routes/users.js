const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth, teacherAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

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

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old avatar if it exists
    const user = await User.findById(req.user._id);
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password').populate('school');

    global.logToFile && global.logToFile('INFO', `Avatar uploaded for user ${user.email}`, { 
      filename: req.file.filename,
      size: req.file.size 
    });

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Delete avatar
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.avatar) {
      return res.status(400).json({ message: 'No avatar to delete' });
    }

    // Delete avatar file from disk
    const avatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar));
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    // Update user to remove avatar
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: '' },
      { new: true }
    ).select('-password').populate('school');

    global.logToFile && global.logToFile('INFO', `Avatar deleted for user ${user.email}`);

    res.json({
      message: 'Avatar deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ message: 'Failed to delete avatar' });
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

// Delete user account (DELETE /api/users/delete-account)
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's avatar file if it exists
    if (user.avatar) {
      const fs = require('fs');
      const path = require('path');
      const avatarPath = path.join(__dirname, '..', user.avatar);
      
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log('Avatar file deleted:', avatarPath);
        } catch (fileError) {
          console.error('Error deleting avatar file:', fileError);
          // Continue with account deletion even if file deletion fails
        }
      }
    }

    // Delete the user account
    await User.findByIdAndDelete(userId);

    console.log(`User account deleted: ${user.email} (ID: ${userId})`);
    
    res.status(200).json({ 
      message: 'Account deleted successfully',
      deletedUser: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;