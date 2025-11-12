#!/bin/bash

# Script to check environment variables on the server
# Run this to diagnose environment variable issues

echo "🔍 Checking Environment Variables"
echo "=================================="
echo ""

cd /home/ubuntu/clean-ekiti

echo "📁 Current directory: $(pwd)"
echo ""

echo "📄 .env.local file exists:"
if [ -f .env.local ]; then
  echo "✅ Yes"
  echo ""
  echo "📋 .env.local contents (values hidden):"
  cat .env.local | sed 's/=.*/=***HIDDEN***/'
  echo ""
  echo "📏 File size: $(wc -c < .env.local) bytes"
  echo "📏 Line count: $(wc -l < .env.local) lines"
else
  echo "❌ No .env.local file found!"
fi

echo ""
echo "🔍 Checking for required variables:"
echo ""

check_var() {
  local var_name=$1
  if grep -q "^${var_name}=" .env.local 2>/dev/null; then
    local value=$(grep "^${var_name}=" .env.local | cut -d= -f2)
    if [ -n "$value" ] && [ "$value" != "" ]; then
      echo "✅ $var_name is set"
    else
      echo "❌ $var_name is empty"
    fi
  else
    echo "❌ $var_name is missing"
  fi
}

check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
check_var "CLOUDINARY_CLOUD_NAME"
check_var "CLOUDINARY_API_KEY"
check_var "CLOUDINARY_API_SECRET"
check_var "JWT_SECRET"
check_var "NODE_ENV"

echo ""
echo "🔍 Testing Cloudinary configuration:"
echo ""

# Extract Cloudinary values (first 10 chars only for security)
CLOUD_NAME=$(grep "^CLOUDINARY_CLOUD_NAME=" .env.local 2>/dev/null | cut -d= -f2 | head -c 10)
API_KEY=$(grep "^CLOUDINARY_API_KEY=" .env.local 2>/dev/null | cut -d= -f2 | head -c 10)

if [ -n "$CLOUD_NAME" ]; then
  echo "Cloud Name starts with: ${CLOUD_NAME}..."
else
  echo "❌ Cloud Name not found"
fi

if [ -n "$API_KEY" ]; then
  echo "API Key starts with: ${API_KEY}..."
else
  echo "❌ API Key not found"
fi

echo ""
echo "🔍 Checking PM2 environment:"
pm2 show cleanekiti 2>/dev/null | grep -A 20 "env:" || echo "PM2 process not found"

echo ""
echo "✅ Environment check complete!"
echo ""
echo "💡 If variables are missing or empty:"
echo "   1. Check GitHub Secrets are set correctly"
echo "   2. Re-run the deployment workflow"
echo "   3. Manually create .env.local if needed"
