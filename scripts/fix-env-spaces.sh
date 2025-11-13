#!/bin/bash

# Script to fix .env.local file by removing leading/trailing spaces
# Run this on your EC2 server if you're getting Cloudinary errors

echo "🔧 Fixing .env.local file..."
echo "=============================="
echo ""

cd /home/ubuntu/clean-ekiti

if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  exit 1
fi

echo "📄 Current .env.local (first 3 lines, values hidden):"
head -n 3 .env.local | sed 's/=.*/=***/'
echo ""

# Create backup
echo "💾 Creating backup..."
cp .env.local .env.local.backup
echo "✅ Backup created: .env.local.backup"
echo ""

# Fix the file by removing leading/trailing spaces from each line
echo "🔧 Removing spaces..."
sed -i 's/^[[:space:]]*//g' .env.local  # Remove leading spaces
sed -i 's/[[:space:]]*$//g' .env.local  # Remove trailing spaces
echo "✅ Spaces removed"
echo ""

echo "📄 Fixed .env.local (first 3 lines, values hidden):"
head -n 3 .env.local | sed 's/=.*/=***/'
echo ""

# Verify the fix
echo "🔍 Verifying variables..."
echo ""

check_var() {
  local var_name=$1
  local value=$(grep "^${var_name}=" .env.local | cut -d= -f2)
  
  if [ -n "$value" ]; then
    # Check for leading/trailing spaces
    local trimmed=$(echo "$value" | xargs)
    if [ "$value" = "$trimmed" ]; then
      echo "✅ $var_name: OK (no spaces)"
    else
      echo "⚠️  $var_name: Still has spaces!"
    fi
  else
    echo "❌ $var_name: Missing or empty"
  fi
}

check_var "CLOUDINARY_CLOUD_NAME"
check_var "CLOUDINARY_API_KEY"
check_var "CLOUDINARY_API_SECRET"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "JWT_SECRET"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test Cloudinary: cd /home/ubuntu/clean-ekiti && node scripts/test-cloudinary.js"
echo "   2. Restart app: pm2 restart cleanekiti"
echo "   3. Check logs: pm2 logs cleanekiti"
echo ""
