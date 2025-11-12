#!/bin/bash

# Initial EC2 Setup Script for CleanEkiti
# Run this ONCE on your EC2 instance before the first deployment

set -e

echo "🚀 Setting up EC2 instance for CleanEkiti..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Add swap space for small instances (optional but recommended)
if [ ! -f /swapfile ]; then
  echo "💾 Adding swap space..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure Nginx for Next.js
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/cleanekiti > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/cleanekiti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "✅ EC2 instance setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Your GitHub Actions workflow can now deploy automatically"
echo "   2. Push to the 'develop' branch to trigger deployment"
echo "   3. Access your app at: http://$(curl -s http://checkip.amazonaws.com)"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 list              - View running processes"
echo "   pm2 logs cleanekiti   - View application logs"
echo "   pm2 restart cleanekiti - Restart the application"
echo "   sudo systemctl status nginx - Check Nginx status"
