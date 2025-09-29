#!/bin/bash

# Fix memory issues on small EC2 instances
echo "🔧 Setting up swap space to handle npm install..."

# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h

echo "✅ Swap space configured"
echo "💡 Now try: npm install --production"