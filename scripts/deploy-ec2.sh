#!/bin/bash

# EC2 Ubuntu 22.04 Deployment Script for CleanEkiti MVP
# Run this on your EC2 instance

echo "🚀 Deploying CleanEkiti MVP on EC2 Ubuntu 22.04..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/cleanekiti-mvp.git
cd cleanekiti-mvp

# Install dependencies
npm install

# Create production environment file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xoptyjfkxicciunkpriv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcHR5amZreGljY2l1bmtwcml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODg4NDYsImV4cCI6MjA3NDY2NDg0Nn0.9NrgKsfxketZSEHvbdqtAAyxYVwcJ3Fmqdu8J5hcow0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcHR5amZreGljY2l1bmtwcml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA4ODg0NiwiZXhwIjoyMDc0NjY0ODQ2fQ.AsC2VyicisJAIWQbQ8p3U2gmYPUajq__YS6zJZ3-KyI
CLOUDINARY_CLOUD_NAME=dxtzyipor
CLOUDINARY_API_KEY=663891567155665
CLOUDINARY_API_SECRET=gAWnIM2Y4_sx6J60WDqwReWMxOs
RESEND_API_KEY=demo_resend_key
JWT_SECRET=your_production_jwt_secret_here_change_this
ADMIN_EMAIL=bankolejohn@gmail.com
EOF

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "cleanekiti" -- start
pm2 save
pm2 startup

echo "✅ Application deployed and running on port 3000"
echo "🔧 Configure Nginx reverse proxy next..."