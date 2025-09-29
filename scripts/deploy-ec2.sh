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
git clone https://github.com/bankolejohn/clean-ekiti.git
cd clean-ekiti

# Add swap space for small instances
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Install dependencies with memory optimization
npm install --production --no-optional

# Check if .env.local exists, if not create template
if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local template - PLEASE UPDATE WITH YOUR CREDENTIALS!"
    cat > .env.local << EOF
# Production Environment Variables
# IMPORTANT: Replace all values below with your actual credentials

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (Optional - for notifications)
RESEND_API_KEY=your_resend_api_key_here

# JWT (Required for admin authentication)
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long

# Admin Email
ADMIN_EMAIL=admin@yourdomain.com
EOF
    
    echo "❌ DEPLOYMENT PAUSED!"
    echo "📝 Please edit .env.local with your actual credentials, then run this script again."
    echo "💡 You can also upload your .env.local file directly to the server."
    exit 1
else
    echo "✅ Found existing .env.local file"
fi

# Install dev dependencies for build
npm install

# Build the application
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Start with PM2
pm2 start npm --name "cleanekiti" -- start
pm2 save
pm2 startup

# Configure Nginx
sudo cp nginx-config.conf /etc/nginx/sites-available/cleanekiti
sudo ln -sf /etc/nginx/sites-available/cleanekiti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Application deployed and running!"
echo "🌐 Access your app at: http://your-server-ip"
echo ""
echo "🔧 Next Steps:"
echo "   1. Update domain in /etc/nginx/sites-available/cleanekiti"
echo "   2. Set up SSL certificates for HTTPS"
echo "   3. Change default admin password (admin/admin123)"
echo "   4. Test all functionality (reports, images, admin panel)"
echo ""
echo "📋 Admin Access:"
echo "   URL: http://your-server-ip/admin/login"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"