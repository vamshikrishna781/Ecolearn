const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: false  // Allow users to register without selecting school initially
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // Game-related fields
  ecoPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gameProgress: {
    currentChapter: {
      type: Number,
      default: 1
    },
    completedChallenges: [{
      challengeId: String,
      completedAt: Date,
      pointsEarned: Number
    }],
    storylineProgress: {
      type: Number,
      default: 0
    }
  },
  // Profile fields
  dateOfBirth: Date,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add eco points
userSchema.methods.addEcoPoints = function(points) {
  this.ecoPoints += points;
  
  // Level up logic (every 1000 points = 1 level)
  const newLevel = Math.floor(this.ecoPoints / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);