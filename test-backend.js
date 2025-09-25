// Simple backend test without email verification
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecolearn')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ecolearn API is running' });
});

// Simple registration test (no email)
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request:', req.body);
  
  // Just return success for testing
  res.json({
    success: true,
    message: 'Registration successful! Check email for OTP.',
    user: { email: req.body.email }
  });
});

// Simple OTP verification test
app.post('/api/auth/verify-otp', async (req, res) => {
  console.log('OTP verification request:', req.body);
  
  // Just return success for testing
  res.json({
    success: true,
    message: 'Email verified successfully!',
    user: { email: req.body.email, isVerified: true }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌱 Test Ecolearn server running on port ${PORT}`);
});