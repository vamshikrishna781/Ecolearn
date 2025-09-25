#!/bin/bash

echo "🧪 Ecolearn System Health Check"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check MongoDB
echo "1. Checking MongoDB service..."
if systemctl is-active --quiet mongod; then
    echo -e "   ${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "   ${RED}❌ MongoDB is not running${NC}"
    echo -e "   ${YELLOW}💡 Run: sudo systemctl start mongod${NC}"
fi

# Check MongoDB connection
echo ""
echo "2. Testing MongoDB connection..."
if mongosh --eval "db.runCommand('ping')" --quiet ecolearn > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ MongoDB connection successful${NC}"
else
    echo -e "   ${RED}❌ Cannot connect to MongoDB${NC}"
    echo -e "   ${YELLOW}💡 Ensure MongoDB is running and accessible${NC}"
fi

# Check backend health endpoint
echo ""
echo "3. Checking backend server..."
if curl -s -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend server is responding${NC}"
    # Get actual health response
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "   ${RED}❌ Backend server not responding on port 5000${NC}"
    echo -e "   ${YELLOW}💡 Run: cd backend && npm run dev${NC}"
fi

# Check frontend
echo ""
echo "4. Checking frontend server..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "   ${RED}❌ Frontend not accessible on port 3000${NC}"
    echo -e "   ${YELLOW}💡 Run: cd frontend && npm start${NC}"
fi

# Check environment file
echo ""
echo "5. Checking backend configuration..."
if [ -f "/home/krishna/Documents/Sih24/backend/.env" ]; then
    echo -e "   ${GREEN}✅ Environment file exists${NC}"
    
    # Check required variables
    source /home/krishna/Documents/Sih24/backend/.env 2>/dev/null
    
    if [ -n "$MONGODB_URI" ]; then
        echo -e "   ${GREEN}✅ MONGODB_URI configured${NC}"
    else
        echo -e "   ${RED}❌ MONGODB_URI missing${NC}"
    fi
    
    if [ -n "$JWT_SECRET" ]; then
        echo -e "   ${GREEN}✅ JWT_SECRET configured${NC}"
    else
        echo -e "   ${RED}❌ JWT_SECRET missing${NC}"
    fi
    
    if [ -n "$EMAIL_USER" ] && [ -n "$EMAIL_PASS" ]; then
        echo -e "   ${GREEN}✅ Email credentials configured${NC}"
        echo "   Email: $EMAIL_USER"
    else
        echo -e "   ${RED}❌ Email credentials missing${NC}"
        echo -e "   ${YELLOW}💡 Configure EMAIL_USER and EMAIL_PASS${NC}"
    fi
    
else
    echo -e "   ${RED}❌ Environment file missing${NC}"
    echo -e "   ${YELLOW}💡 Copy .env.example to .env and configure${NC}"
fi

# Check logs directory
echo ""
echo "6. Checking logs directory..."
if [ -d "/home/krishna/Documents/Sih24/backend/logs" ]; then
    echo -e "   ${GREEN}✅ Logs directory exists${NC}"
    
    # Check recent logs
    if [ -f "/home/krishna/Documents/Sih24/backend/logs/auth.log" ]; then
        LOG_COUNT=$(wc -l < "/home/krishna/Documents/Sih24/backend/logs/auth.log" 2>/dev/null || echo 0)
        echo "   Auth log entries: $LOG_COUNT"
    fi
    
    if [ -f "/home/krishna/Documents/Sih24/backend/logs/error.log" ]; then
        ERROR_COUNT=$(wc -l < "/home/krishna/Documents/Sih24/backend/logs/error.log" 2>/dev/null || echo 0)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo -e "   ${YELLOW}⚠️  Error log has $ERROR_COUNT entries${NC}"
            echo "   Recent errors:"
            tail -n 3 "/home/krishna/Documents/Sih24/backend/logs/error.log" 2>/dev/null | sed 's/^/   /'
        fi
    fi
else
    echo -e "   ${YELLOW}⚠️  Logs directory will be created on server start${NC}"
fi

# Check Node.js and npm versions
echo ""
echo "7. Checking Node.js environment..."
NODE_VERSION=$(node --version 2>/dev/null)
NPM_VERSION=$(npm --version 2>/dev/null)

if [ -n "$NODE_VERSION" ]; then
    echo -e "   ${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "   ${RED}❌ Node.js not installed${NC}"
fi

if [ -n "$NPM_VERSION" ]; then
    echo -e "   ${GREEN}✅ NPM: $NPM_VERSION${NC}"
else
    echo -e "   ${RED}❌ NPM not installed${NC}"
fi

# Check database collections
echo ""
echo "8. Checking database collections..."
if mongosh --eval "print('Users:', db.users.countDocuments()); print('Schools:', db.schools.countDocuments()); print('OTPs:', db.otps.countDocuments());" --quiet ecolearn 2>/dev/null; then
    echo -e "   ${GREEN}✅ Database collections accessible${NC}"
else
    echo -e "   ${YELLOW}⚠️  Database collections not accessible (normal for first run)${NC}"
fi

echo ""
echo "==============================="
echo "🎯 Next Steps:"
echo ""

# Provide specific next steps based on what's missing
if ! systemctl is-active --quiet mongod; then
    echo -e "${YELLOW}1. Start MongoDB: sudo systemctl start mongod${NC}"
fi

if ! curl -s -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${YELLOW}2. Start backend: cd /home/krishna/Documents/Sih24/backend && npm run dev${NC}"
fi

if ! curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}3. Start frontend: cd /home/krishna/Documents/Sih24/frontend && npm start${NC}"
fi

echo -e "${GREEN}4. Test registration at: http://localhost:3000${NC}"
echo -e "${GREEN}5. Monitor logs: tail -f /home/krishna/Documents/Sih24/backend/logs/auth.log${NC}"

echo ""
echo "📧 If email issues persist, verify:"
echo "   - Gmail account has 2FA enabled"
echo "   - Using Gmail app password (not regular password)"
echo "   - EMAIL_USER and EMAIL_PASS are correct in .env"

echo ""
echo "🔍 For detailed troubleshooting, see TROUBLESHOOTING.md"