#!/bin/bash

# Test script for CleanEkiti API endpoints
# Usage: ./scripts/test-api.sh [base_url]

BASE_URL="${1:-http://localhost:3000}"

echo "Testing CleanEkiti API at $BASE_URL"
echo "======================================"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq '.' || echo "Health check failed"
echo ""

# Test 2: Get reports
echo "2. Testing GET /api/reports..."
curl -s "$BASE_URL/api/reports" | jq '.reports | length' || echo "Failed to fetch reports"
echo ""

# Test 3: Create report (with validation error)
echo "3. Testing POST /api/reports (should fail validation)..."
curl -s -X POST "$BASE_URL/api/reports" \
  -H "Content-Type: application/json" \
  -d '{"category":"invalid"}' | jq '.' || echo "Request failed"
echo ""

# Test 4: Admin login (should fail without credentials)
echo "4. Testing POST /api/admin/login (should fail)..."
curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"short"}' | jq '.' || echo "Request failed"
echo ""

echo "======================================"
echo "API tests completed!"
echo ""
echo "To test report creation with valid data, use:"
echo "curl -X POST $BASE_URL/api/reports \\"
echo "  -F 'category=dumping' \\"
echo "  -F 'latitude=7.6219' \\"
echo "  -F 'longitude=5.2206' \\"
echo "  -F 'description=Test report' \\"
echo "  -F 'reporter_email=test@example.com'"
