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

# Clean up any existing installation
rm -rf clean-ekiti

# Clone your repository (replace with your repo URL)
echo "📥 Cloning repository..."
git clone https://github.com/bankolejohn/clean-ekiti.git
cd clean-ekiti

# Verify git clone was successful
if [ ! -f "package.json" ]; then
    echo "❌ Git clone failed or incomplete!"
    exit 1
fi

echo "✅ Repository cloned successfully"

# Add swap space for small instances
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Clean npm cache and install dependencies
echo "📦 Installing dependencies..."
npm cache clean --force
npm install --no-optional

# Verify critical dependencies
echo "🔍 Verifying dependencies..."
if [ ! -d "node_modules/tailwindcss" ]; then
    echo "❌ TailwindCSS not installed properly!"
    npm install tailwindcss --save-dev
fi

if [ ! -d "node_modules/next" ]; then
    echo "❌ Next.js not installed properly!"
    exit 1
fi

echo "✅ Dependencies verified"

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

# Verify all required files exist
echo "🔍 Verifying project structure..."
if [ ! -d "components" ]; then
    echo "❌ Missing components directory!"
    exit 1
fi

if [ ! -d "app" ]; then
    echo "❌ Missing app directory!"
    exit 1
fi

if [ ! -f "tailwind.config.js" ]; then
    echo "❌ Missing tailwind.config.js!"
    exit 1
fi

echo "✅ Project structure verified"

# Build the application with increased memory
echo "🏗️ Building application..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Start with PM2
pm2 start npm --name "cleanekiti" -- start
pm2 save
pm2 startup

# Configure Nginx
sudo cp scripts/nginx-config.conf /etc/nginx/sites-available/cleanekiti
sudo ln -sf /etc/nginx/sites-available/cleanekiti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Update the config with your server IP
sudo sed -i 's/your-domain.com/'"$(curl -s http://checkip.amazonaws.com)"'/g' /etc/nginx/sites-available/cleanekiti

# Test and reload Nginx
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