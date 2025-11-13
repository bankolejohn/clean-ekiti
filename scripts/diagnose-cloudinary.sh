#!/bin/bash

# Quick diagnostic script for Cloudinary issues
# Run this on your EC2 server

echo "🔍 Cloudinary Diagnostics"
echo "========================="
echo ""

cd /home/ubuntu/clean-ekiti

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  echo "Run the deployment workflow first."
  exit 1
fi

echo "✅ .env.local file exists"
echo ""

# Check each Cloudinary variable
echo "📋 Cloudinary Variables:"
echo "------------------------"

CLOUD_NAME=$(grep "^CLOUDINARY_CLOUD_NAME=" .env.local | cut -d= -f2)
API_KEY=$(grep "^CLOUDINARY_API_KEY=" .env.local | cut -d= -f2)
API_SECRET=$(grep "^CLOUDINARY_API_SECRET=" .env.local | cut -d= -f2)

if [ -z "$CLOUD_NAME" ]; then
  echo "❌ CLOUDINARY_CLOUD_NAME is missing or empty"
else
  echo "✅ CLOUDINARY_CLOUD_NAME: ${CLOUD_NAME:0:10}... (length: ${#CLOUD_NAME})"
  
  # Check for spaces
  if [[ "$CLOUD_NAME" =~ [[:space:]] ]]; then
    echo "   ⚠️  WARNING: Contains spaces!"
  fi
  
  # Check for special characters that might cause issues
  if [[ "$CLOUD_NAME" =~ [\$\{\}] ]]; then
    echo "   ⚠️  WARNING: Contains special characters like $ { }"
  fi
fi

if [ -z "$API_KEY" ]; then
  echo "❌ CLOUDINARY_API_KEY is missing or empty"
else
  echo "✅ CLOUDINARY_API_KEY: ${API_KEY:0:10}... (length: ${#API_KEY})"
  
  if [[ "$API_KEY" =~ [[:space:]] ]]; then
    echo "   ⚠️  WARNING: Contains spaces!"
  fi
  
  if [[ "$API_KEY" =~ [\$\{\}] ]]; then
    echo "   ⚠️  WARNING: Contains special characters like $ { }"
  fi
fi

if [ -z "$API_SECRET" ]; then
  echo "❌ CLOUDINARY_API_SECRET is missing or empty"
else
  echo "✅ CLOUDINARY_API_SECRET: ${API_SECRET:0:10}... (length: ${#API_SECRET})"
  
  if [[ "$API_SECRET" =~ [[:space:]] ]]; then
    echo "   ⚠️  WARNING: Contains spaces!"
  fi
  
  if [[ "$API_SECRET" =~ [\$\{\}] ]]; then
    echo "   ⚠️  WARNING: Contains special characters like $ { }"
  fi
fi

echo ""
echo "📄 Raw .env.local content (first 3 Cloudinary lines):"
echo "-----------------------------------------------------"
grep "^CLOUDINARY" .env.local | head -n 3 | while read line; do
  # Show the line with value partially hidden
  var_name=$(echo "$line" | cut -d= -f1)
  var_value=$(echo "$line" | cut -d= -f2)
  echo "$var_name=${var_value:0:10}...${var_value: -3}"
done

echo ""
echo "🧪 Testing Cloudinary Connection:"
echo "----------------------------------"

if [ -n "$CLOUD_NAME" ] && [ -n "$API_KEY" ] && [ -n "$API_SECRET" ]; then
  echo "Running Node.js test..."
  node scripts/test-cloudinary.js
else
  echo "❌ Cannot test - missing credentials"
fi

echo ""
echo "💡 If credentials look wrong:"
echo "   1. Check GitHub Secrets in your repository settings"
echo "   2. Ensure no extra spaces or special characters"
echo "   3. Re-run the deployment workflow"
echo "   4. Or manually edit .env.local: nano .env.local"
echo ""
