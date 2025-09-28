#!/bin/bash

echo "Testing reCAPTCHA flow..."

# Step 1: Get a challenge
echo "1. Getting reCAPTCHA challenge..."
RESPONSE=$(curl -s http://localhost:5000/api/auth/recaptcha)
echo "Challenge response: $RESPONSE"

# Extract token and answer using jq if available, or manually
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ANSWER=$(echo $RESPONSE | grep -o '"answer":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "Answer: $ANSWER"

if [ -n "$TOKEN" ] && [ -n "$ANSWER" ]; then
  # Step 2: Verify the answer
  echo "2. Verifying reCAPTCHA answer..."
  VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/verify-recaptcha \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$TOKEN\", \"answer\":\"$ANSWER\"}")
  echo "Verify response: $VERIFY_RESPONSE"
  
  # Step 3: Test login with the token (optional)
  echo "3. Testing login flow with verified token..."
  echo "You can now use token '$TOKEN' in login form"
else
  echo "Failed to extract token or answer from response"
fi