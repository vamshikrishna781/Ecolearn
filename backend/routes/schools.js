const express = require('express');
const { body, validationResult } = require('express-validator');
const School = require('../models/School');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all schools
router.get('/', auth, async (req, res) => {
  try {
    const schools = await School.find({ isActive: true })
      .select('name type address.city address.state totalStudents totalTeachers totalEcoPoints ranking')
      .sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get school by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create school (admin only)
router.post('/', [auth, adminAuth], [
  body('name').notEmpty().withMessage('School name is required'),
  body('type').isIn(['school', 'college', 'university']).withMessage('Invalid school type'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const school = new School(req.body);
    await school.save();
    res.status(201).json(school);
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update school (admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get school leaderboard
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    
    const students = await User.find({ 
      school: req.params.id, 
      role: 'student',
      isActive: true 
    })
    .select('firstName lastName ecoPoints level avatar')
    .sort({ ecoPoints: -1 })
    .limit(20);

    res.json(students);
  } catch (error) {
    console.error('School leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;