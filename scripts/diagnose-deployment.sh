#!/bin/bash

# Diagnostic script to check CleanEkiti deployment status
# Run this on your EC2 server to troubleshoot issues

echo "🔍 CleanEkiti Deployment Diagnostics"
echo "===================================="
echo ""

# Check Node.js
echo "📦 Node.js & NPM:"
node -v 2>/dev/null || echo "❌ Node.js not installed"
npm -v 2>/dev/null || echo "❌ NPM not installed"
echo ""

# Check PM2
echo "📦 PM2 Status:"
pm2 -v 2>/dev/null || echo "❌ PM2 not installed"
pm2 list
echo ""

# Check application directory
echo "📁 Application Directory:"
if [ -d "/home/ubuntu/clean-ekiti" ]; then
  echo "✅ Directory exists: /home/ubuntu/clean-ekiti"
  cd /home/ubuntu/clean-ekiti
  echo "   Git branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
  echo "   Last commit: $(git log -1 --oneline 2>/dev/null || echo 'N/A')"
else
  echo "❌ Directory not found: /home/ubuntu/clean-ekiti"
fi
echo ""

# Check .env.local
echo "🔐 Environment Variables:"
if [ -f "/home/ubuntu/clean-ekiti/.env.local" ]; then
  echo "✅ .env.local exists"
  echo "   Variables found:"
  grep -E "^[A-Z_]+" /home/ubuntu/clean-ekiti/.env.local | cut -d= -f1 | sed 's/^/   - /'
else
  echo "❌ .env.local not found"
fi
echo ""

# Check build
echo "🏗️ Build Status:"
if [ -d "/home/ubuntu/clean-ekiti/.next" ]; then
  echo "✅ .next directory exists"
  ls -lh /home/ubuntu/clean-ekiti/.next/BUILD_ID 2>/dev/null || echo "   ⚠️ BUILD_ID not found"
else
  echo "❌ .next directory not found - app not built"
fi
echo ""

# Check ports
echo "🌐 Network Status:"
if netstat -tuln 2>/dev/null | grep -q ":3000"; then
  echo "✅ Port 3000 is listening"
else
  echo "❌ Port 3000 is not listening"
fi

if netstat -tuln 2>/dev/null | grep -q ":80"; then
  echo "✅ Port 80 is listening (Nginx)"
else
  echo "❌ Port 80 is not listening (Nginx not running?)"
fi
echo ""

# Check Nginx
echo "🔧 Nginx Status:"
if systemctl is-active --quiet nginx; then
  echo "✅ Nginx is running"
  if [ -f /etc/nginx/sites-enabled/cleanekiti ]; then
    echo "✅ CleanEkiti Nginx config is enabled"
  else
    echo "⚠️ CleanEkiti Nginx config not found"
  fi
else
  echo "❌ Nginx is not running"
fi
echo ""

# Test local connection
echo "🔍 Connection Tests:"
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
  echo "✅ App responds on localhost:3000"
else
  echo "❌ App not responding on localhost:3000"
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
  echo "✅ Nginx responds on localhost:80"
else
  echo "❌ Nginx not responding on localhost:80"
fi
echo ""

# Show recent logs
echo "📋 Recent PM2 Logs (last 20 lines):"
echo "===================================="
pm2 logs cleanekiti --lines 20 --nostream 2>/dev/null || echo "❌ No logs available"
echo ""

# Show Nginx error logs
echo "📋 Recent Nginx Errors (last 10 lines):"
echo "===================================="
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "❌ No Nginx error logs"
echo ""

echo "🔧 Suggested Actions:"
echo "===================="
if ! pm2 list 2>/dev/null | grep -q cleanekiti; then
  echo "- PM2 process not running. Try: cd /home/ubuntu/clean-ekiti && pm2 start npm --name cleanekiti -- start"
fi

if [ ! -d "/home/ubuntu/clean-ekiti/.next" ]; then
  echo "- App not built. Try: cd /home/ubuntu/clean-ekiti && npm run build"
fi

if ! systemctl is-active --quiet nginx; then
  echo "- Nginx not running. Try: sudo systemctl start nginx"
fi

echo ""
echo "✅ Diagnostics complete!"
