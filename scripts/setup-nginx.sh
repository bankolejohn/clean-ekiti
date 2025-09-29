#!/bin/bash

# Setup Nginx reverse proxy
echo "🔧 Setting up Nginx reverse proxy..."

# Copy nginx config
sudo cp scripts/nginx-config /etc/nginx/sites-available/cleanekiti

# Enable the site
sudo ln -s /etc/nginx/sites-available/cleanekiti /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured successfully"
echo "🌐 Your app should be accessible via your EC2 public IP"