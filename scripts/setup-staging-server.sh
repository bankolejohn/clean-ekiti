#!/bin/bash

# Setup script for staging server
# Run this on your new EC2 instance

echo "🚀 Setting up CleanEkiti Staging Server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Create staging user directory
sudo mkdir -p /home/ubuntu/clean-ekiti-staging
cd /home/ubuntu

# Clone repository to staging directory
git clone https://github.com/bankolejohn/clean-ekiti.git clean-ekiti-staging
cd clean-ekiti-staging

# Switch to develop/staging branch
git checkout -b staging || git checkout staging

# Add swap space for small instances
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Create staging environment file
cat > .env.local << EOF
# Staging Environment Variables
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
RESEND_API_KEY=${RESEND_API_KEY}
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
NODE_ENV=staging
EOF

echo "⚠️  Please update .env.local with your actual credentials!"

# Install dependencies
npm install

# Build application
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Create Nginx config for staging (port 3001)
sudo tee /etc/nginx/sites-available/cleanekiti-staging << EOF
server {
    listen 81;
    server_name $(curl -s http://checkip.amazonaws.com);

    # API routes - NO CACHING
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /_next/ {
        proxy_pass http://localhost:3001;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # All other routes
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    client_max_body_size 10M;
}
EOF

# Enable staging site
sudo ln -sf /etc/nginx/sites-available/cleanekiti-staging /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Start application on port 3001 for staging
PORT=3001 pm2 start npm --name "cleanekiti-staging" -- start
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 81
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Staging server setup complete!"
echo "🌐 Staging URL: http://$(curl -s http://checkip.amazonaws.com):81"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your actual credentials"
echo "2. Set up GitHub secrets for CI/CD"
echo "3. Push to staging branch to trigger deployment"
echo ""
echo "🔧 GitHub Secrets needed:"
echo "   STAGING_HOST=your-staging-server-ip"
echo "   STAGING_USER=ubuntu"
echo "   STAGING_SSH_KEY=your-private-ssh-key"