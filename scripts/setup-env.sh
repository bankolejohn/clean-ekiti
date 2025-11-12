#!/bin/bash

# ==============================================
# Environment Setup Script for EC2 Deployment
# ==============================================
# This script creates .env.local from GitHub Secrets
# Usage: ./scripts/setup-env.sh

set -e

echo "🔧 Setting up environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Auto-generated environment file
# Generated at: $(date)

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

# Authentication
JWT_SECRET=${JWT_SECRET}

# Email (Optional)
RESEND_API_KEY=${RESEND_API_KEY}

# Admin
ADMIN_EMAIL=${ADMIN_EMAIL}

# Map (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_TOKEN}

# Application
NODE_ENV=${NODE_ENV:-production}
NEXT_PUBLIC_APP_URL=${APP_URL}
EOF

echo "✅ Environment file created successfully!"
echo "📝 File location: .env.local"

# Verify required variables
REQUIRED_VARS=(
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "CLOUDINARY_CLOUD_NAME"
  "CLOUDINARY_API_KEY"
  "CLOUDINARY_API_SECRET"
  "JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "⚠️  Warning: Missing required environment variables:"
  printf '   - %s\n' "${MISSING_VARS[@]}"
  exit 1
fi

echo "✅ All required environment variables are set!"
