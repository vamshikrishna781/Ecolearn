#!/bin/bash

echo "Creating test user for login..."

# First get a reCAPTCHA challenge
echo "1. Getting reCAPTCHA challenge for registration..."
RESPONSE=$(curl -s http://localhost:5000/api/auth/recaptcha)
echo "Challenge: $RESPONSE"

# Extract token and answer
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ANSWER=$(echo $RESPONSE | grep -o '"answer":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "Answer: $ANSWER"

if [ -n "$TOKEN" ] && [ -n "$ANSWER" ]; then
  # Verify the reCAPTCHA first
  echo "2. Verifying reCAPTCHA..."
  VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/verify-recaptcha \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$TOKEN\", \"answer\":\"$ANSWER\"}")
  echo "Verify response: $VERIFY_RESPONSE"
  
  # Register the test user
  echo "3. Registering test user..."
  REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"Test\",
      \"lastName\": \"User\", 
      \"email\": \"vvasire1@student.gitam.edu\",
      \"password\": \"Test123!\",
      \"role\": \"student\",
      \"school\": \"Test School\",
      \"recaptchaToken\": \"$TOKEN\"
    }")
  echo "Register response: $REGISTER_RESPONSE"
else
  echo "Failed to get reCAPTCHA challenge"
fi