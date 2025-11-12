#!/bin/bash

# SSL/HTTPS Setup Script for CleanEkiti with Let's Encrypt
# Domain: cleanekiti.johndesiventures.website
# Run this on your EC2 instance AFTER pointing your domain to the server IP

set -e

DOMAIN="cleanekiti.johndesiventures.website"
EMAIL="bankolejohn@gmail.com"  # Change this to your email

echo "🔒 Setting up SSL/HTTPS for CleanEkiti"
echo "Domain: $DOMAIN"
echo "========================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run with sudo: sudo bash scripts/setup-ssl.sh"
  exit 1
fi

# Verify domain is pointing to this server
echo "📡 Checking DNS configuration..."
SERVER_IP=$(curl -s http://checkip.amazonaws.com)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
  echo ""
  echo "⚠️  WARNING: Domain is not pointing to this server!"
  echo ""
  echo "Please configure your DNS settings:"
  echo "1. Go to Namecheap DNS settings"
  echo "2. Add an A record:"
  echo "   Type: A Record"
  echo "   Host: cleanekiti"
  echo "   Value: $SERVER_IP"
  echo "   TTL: Automatic"
  echo ""
  echo "3. Wait 5-10 minutes for DNS propagation"
  echo "4. Run this script again"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Install Certbot
echo "📦 Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Update Nginx configuration for the domain
echo "⚙️  Updating Nginx configuration..."
cat > /etc/nginx/sites-available/cleanekiti << EOF
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 10M;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Verify SSL certificate
echo "✅ Verifying SSL certificate..."
if certbot certificates | grep -q "$DOMAIN"; then
  echo "✅ SSL certificate installed successfully!"
else
  echo "❌ SSL certificate installation failed"
  exit 1
fi

# Setup auto-renewal
echo "⏰ Setting up automatic certificate renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Test auto-renewal
echo "🧪 Testing auto-renewal..."
certbot renew --dry-run

echo ""
echo "✅ SSL/HTTPS Setup Complete!"
echo "========================================"
echo ""
echo "🌐 Your site is now accessible at:"
echo "   https://$DOMAIN"
echo ""
echo "🔒 SSL Certificate Details:"
certbot certificates
echo ""
echo "📋 Next Steps:"
echo "   1. Test your site: https://$DOMAIN"
echo "   2. Test admin login: https://$DOMAIN/admin/login"
echo "   3. Certificates will auto-renew every 60 days"
echo ""
echo "🔧 Useful Commands:"
echo "   certbot certificates          - View certificate info"
echo "   certbot renew                 - Manually renew certificates"
echo "   systemctl status certbot.timer - Check auto-renewal status"
echo ""
