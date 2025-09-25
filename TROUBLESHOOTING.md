# Ecolearn Authentication Troubleshooting Guide

## Current Issue: User cannot create account and email verification not working

### Step 1: Check System Requirements

1. **MongoDB Status**:
   ```bash
   sudo systemctl status mongod
   sudo systemctl start mongod  # If not running
   ```

2. **Node.js Environment**:
   ```bash
   node --version  # Should be 14+ 
   npm --version   # Should be 6+
   ```

### Step 2: Backend Configuration

1. **Check Environment Variables**:
   ```bash
   cd /home/krishna/Documents/Sih24/backend
   cat .env
   ```
   
   Required variables:
   - `MONGODB_URI=mongodb://localhost:27017/ecolearn`
   - `JWT_SECRET=(your secret)`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=t99527506@gmail.com`
   - `EMAIL_PASS=(your app password)`

2. **Gmail App Password Setup**:
   - Go to Google Account Settings
   - Security → 2-Step Verification (enable if not enabled)
   - App passwords → Generate app password for "Mail"
   - Use this password in EMAIL_PASS (not your Gmail password)

### Step 3: Start Services

1. **Start Backend**:
   ```bash
   cd /home/krishna/Documents/Sih24/backend
   npm run dev
   ```
   
   Expected output:
   ```
   🔧 Creating logs directory...
   📁 Logs directory ready at: /home/krishna/Documents/Sih24/backend/logs
   🌱 Ecolearn Backend Server running on port 5000
   📊 Connected to MongoDB
   📧 Email service initialized successfully
   ```

2. **Start Frontend**:
   ```bash
   cd /home/krishna/Documents/Sih24/frontend
   npm start
   ```

### Step 4: Test Authentication Flow

1. **Health Check**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test Registration**:
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Fill form with valid details
   - Solve math captcha
   - Submit form

3. **Check Logs**:
   ```bash
   tail -f /home/krishna/Documents/Sih24/backend/logs/auth.log
   ```

### Step 5: Common Issues and Solutions

#### Issue 1: "Email service not configured"
**Solution**: 
- Verify EMAIL_USER and EMAIL_PASS in .env
- Use Gmail app password, not regular password
- Check Gmail account has 2FA enabled

#### Issue 2: "MongoDB connection failed"
**Solution**:
```bash
sudo systemctl start mongod
mongosh  # Test connection
```

#### Issue 3: "reCAPTCHA verification failed"
**Solution**:
- Solve math problem correctly
- Don't refresh page during verification
- Try generating new challenge

#### Issue 4: "OTP not received"
**Solution**:
- Check spam folder
- Verify email address format
- Check auth.log for email sending errors
- Try different email provider

#### Issue 5: "Token expired" during verification
**Solution**:
- Complete verification within 10 minutes
- Check system time is correct
- Request new OTP

### Step 6: Debug Commands

1. **Check Database**:
   ```bash
   mongosh
   use ecolearn
   db.users.find()
   db.otps.find()
   ```

2. **Test Email Service**:
   ```bash
   cd /home/krishna/Documents/Sih24/backend
   node -e "
   require('dotenv').config();
   const emailService = require('./utils/emailService');
   emailService.sendOTPEmail('your-email@gmail.com', '123456', 'verify')
   .then(() => console.log('Email sent!'))
   .catch(err => console.error('Email error:', err));
   "
   ```

3. **View Application Logs**:
   ```bash
   # Authentication logs
   tail -f /home/krishna/Documents/Sih24/backend/logs/auth.log
   
   # Application logs
   tail -f /home/krishna/Documents/Sih24/backend/logs/app.log
   
   # Error logs
   tail -f /home/krishna/Documents/Sih24/backend/logs/error.log
   ```

### Step 7: Log Analysis

The application creates detailed logs for debugging. Check these files:

1. **auth.log** - All authentication events
2. **app.log** - General application events
3. **error.log** - Error events and stack traces

Look for these log entries:
- `User registration attempt`
- `OTP generation successful`
- `Email sent successfully` or `Failed to send OTP email`
- `OTP verification attempt`
- `User login attempt`

### Step 8: Reset and Clean Start

If issues persist:

1. **Clear Database**:
   ```bash
   mongosh
   use ecolearn
   db.dropDatabase()
   ```

2. **Clear Logs**:
   ```bash
   rm -rf /home/krishna/Documents/Sih24/backend/logs/*
   ```

3. **Restart Services**:
   ```bash
   sudo systemctl restart mongod
   # Then restart backend and frontend
   ```

### Quick Test Script

Create this test script to verify everything works:

```bash
#!/bin/bash
echo "🧪 Ecolearn System Check"
echo "========================"

echo "1. Checking MongoDB..."
systemctl is-active mongod && echo "✅ MongoDB running" || echo "❌ MongoDB not running"

echo "2. Checking backend port..."
curl -s http://localhost:5000/health > /dev/null && echo "✅ Backend responding" || echo "❌ Backend not responding"

echo "3. Checking frontend port..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"

echo "4. Checking logs directory..."
[ -d "/home/krishna/Documents/Sih24/backend/logs" ] && echo "✅ Logs directory exists" || echo "❌ Logs directory missing"

echo "5. Checking environment file..."
[ -f "/home/krishna/Documents/Sih24/backend/.env" ] && echo "✅ Environment file exists" || echo "❌ Environment file missing"

echo "========================"
echo "If all checks pass, try registering a new user."
```

Save as `system-check.sh` and run: `bash system-check.sh`

## Contact Information

If issues persist after following this guide:
1. Check the logs in `/home/krishna/Documents/Sih24/backend/logs/`
2. Verify email configuration
3. Ensure MongoDB is running and accessible
4. Try registering with a different email address

The authentication system includes comprehensive logging to help identify exactly where the process fails.