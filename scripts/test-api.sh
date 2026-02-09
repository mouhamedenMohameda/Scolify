#!/bin/bash

# Script de test API rapide
# Usage: ./scripts/test-api.sh [base_url]

BASE_URL="${1:-http://localhost:3000}"
API_URL="${BASE_URL}/api"

echo "🧪 Testing API endpoints..."
echo "Base URL: ${BASE_URL}"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Check
echo "1. Testing Health Check..."
HEALTH_RESPONSE=$(curl -s "${API_URL}/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo -e "${GREEN}✅ Health check OK${NC}"
else
  echo -e "${RED}❌ Health check failed${NC}"
  echo "Response: $HEALTH_RESPONSE"
fi
echo ""

# Test Register
echo "2. Testing Register..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success\|id"; then
  echo -e "${GREEN}✅ Register OK${NC}"
else
  echo -e "${YELLOW}⚠️  Register response: $REGISTER_RESPONSE${NC}"
fi
echo ""

# Test Login
echo "3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "success\|token"; then
  echo -e "${GREEN}✅ Login OK${NC}"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
fi
echo ""

# Test Me (requires auth)
echo "4. Testing /auth/me..."
ME_RESPONSE=$(curl -s "${API_URL}/auth/me" \
  -b /tmp/cookies.txt)

if echo "$ME_RESPONSE" | grep -q "email\|id"; then
  echo -e "${GREEN}✅ Auth check OK${NC}"
else
  echo -e "${YELLOW}⚠️  Auth check: $ME_RESPONSE${NC}"
fi
echo ""

# Test Schools (requires auth)
echo "5. Testing /schools..."
SCHOOLS_RESPONSE=$(curl -s "${API_URL}/schools" \
  -b /tmp/cookies.txt)

if echo "$SCHOOLS_RESPONSE" | grep -q "data\|schools\|id"; then
  echo -e "${GREEN}✅ Schools endpoint OK${NC}"
else
  echo -e "${YELLOW}⚠️  Schools response: $SCHOOLS_RESPONSE${NC}"
fi
echo ""

# Cleanup
rm -f /tmp/cookies.txt

echo "✅ API tests completed!"
echo ""
echo "Note: Some tests may fail if database is not set up or user already exists."
echo "For full testing, use the UI at ${BASE_URL}"
