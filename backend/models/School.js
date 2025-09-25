const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['school', 'college', 'university'],
    required: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  principal: {
    name: String,
    email: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: Number,
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'State Board', 'IB', 'Other']
  },
  // Statistics
  totalStudents: {
    type: Number,
    default: 0
  },
  totalTeachers: {
    type: Number,
    default: 0
  },
  totalEcoPoints: {
    type: Number,
    default: 0
  },
  ranking: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update statistics when users are added/removed
schoolSchema.methods.updateStats = async function() {
  const User = require('./User');
  
  const stats = await User.aggregate([
    { $match: { school: this._id } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        totalPoints: { $sum: '$ecoPoints' }
      }
    }
  ]);
  
  this.totalStudents = 0;
  this.totalTeachers = 0;
  this.totalEcoPoints = 0;
  
  stats.forEach(stat => {
    if (stat._id === 'student') {
      this.totalStudents = stat.count;
    } else if (stat._id === 'teacher') {
      this.totalTeachers = stat.count;
    }
    this.totalEcoPoints += stat.totalPoints || 0;
  });
  
  return this.save();
};

module.exports = mongoose.model('School', schoolSchema);