#!/bin/bash

echo "🧪 Testing Ecolearn Authentication System"
echo "========================================"

# Test 1: Health check
echo ""
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo "✅ Health check passed: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: Test registration endpoint
echo ""
echo "2. Testing user registration..."

# Generate unique test email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"

# Generate a proper reCAPTCHA token with millisecond timestamp
TIMESTAMP_MS=$(node -e "console.log(Date.now())")
RECAPTCHA_TOKEN="custom_${TIMESTAMP_MS}_testtoken123"

REGISTER_PAYLOAD=$(cat <<EOF
{
    "firstName": "Test",
    "lastName": "User",
    "email": "$TEST_EMAIL",
    "password": "TestPassword123!",
    "role": "student",
    "schoolName": "Test School",
    "recaptchaToken": "$RECAPTCHA_TOKEN"
}
EOF
)

echo "Registering user: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$REGISTER_PAYLOAD" \
    http://localhost:5000/api/auth/register)

echo "Registration response: $REGISTER_RESPONSE"

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | grep -q "OTP sent"; then
    echo "✅ Registration appears successful"
else
    echo "❌ Registration may have failed"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 3: Check if user was created in database
echo ""
echo "3. Checking database for user creation..."
DB_CHECK=$(mongosh --eval "db.users.findOne({email: '$TEST_EMAIL'})" --quiet ecolearn 2>/dev/null)
if echo "$DB_CHECK" | grep -q "$TEST_EMAIL"; then
    echo "✅ User found in database"
else
    echo "❌ User not found in database"
fi

# Test 4: Check for OTP creation
echo ""
echo "4. Checking for OTP creation..."
OTP_CHECK=$(mongosh --eval "db.otps.findOne({email: '$TEST_EMAIL'})" --quiet ecolearn 2>/dev/null)
if echo "$OTP_CHECK" | grep -q "$TEST_EMAIL"; then
    echo "✅ OTP record found in database"
    # Extract OTP if possible
    OTP_VALUE=$(echo "$OTP_CHECK" | grep -o '"otp"[^,]*' | cut -d'"' -f4)
    echo "OTP: $OTP_VALUE"
    
    # Test 5: OTP verification
    if [ -n "$OTP_VALUE" ]; then
        echo ""
        echo "5. Testing OTP verification..."
        VERIFY_PAYLOAD=$(cat <<EOF
{
    "email": "$TEST_EMAIL",
    "otp": "$OTP_VALUE"
}
EOF
        )
        
        VERIFY_RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$VERIFY_PAYLOAD" \
            http://localhost:5000/api/auth/verify-otp)
            
        echo "OTP verification response: $VERIFY_RESPONSE"
        
        if echo "$VERIFY_RESPONSE" | grep -q "verified successfully"; then
            echo "✅ OTP verification successful"
            
            # Test 6: Login test
            echo ""
            echo "6. Testing login..."
            LOGIN_PAYLOAD=$(cat <<EOF
{
    "email": "$TEST_EMAIL",
    "password": "TestPassword123!"
}
EOF
            )
            
            LOGIN_RESPONSE=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                -d "$LOGIN_PAYLOAD" \
                http://localhost:5000/api/auth/login)
                
            echo "Login response: $LOGIN_RESPONSE"
            
            if echo "$LOGIN_RESPONSE" | grep -q "token"; then
                echo "✅ Login successful"
            else
                echo "❌ Login failed"
            fi
        else
            echo "❌ OTP verification failed"
        fi
    fi
else
    echo "❌ No OTP record found"
fi

echo ""
echo "========================================"
echo "🏁 Test Summary"
echo ""
echo "Check the auth.log for detailed logging:"
echo "tail -f /home/krishna/Documents/Sih24/backend/logs/auth.log"
echo ""
echo "If tests fail, ensure:"
echo "1. Backend server is running on port 5000"
echo "2. MongoDB is running and accessible"
echo "3. Email configuration is correct in .env"
echo ""
echo "Clean up test data:"
echo "mongosh ecolearn --eval \"db.users.deleteOne({email: '$TEST_EMAIL'}); db.otps.deleteOne({email: '$TEST_EMAIL'})\""