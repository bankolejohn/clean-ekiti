#!/bin/bash

echo "🔍 Debugging server issues..."

# Check if app is running
echo "=== PM2 Status ==="
pm2 status

# Check app logs
echo "=== Application Logs ==="
pm2 logs cleanekiti --lines 20

# Check if port 3000 is listening
echo "=== Port 3000 Status ==="
sudo netstat -tlnp | grep :3000

# Test API endpoints locally
echo "=== Testing API Endpoints ==="
echo "Testing /api/reports:"
curl -s http://localhost:3000/api/reports | head -100

echo -e "\n\nTesting health check:"
curl -s http://localhost:3000/api/health || echo "Health endpoint not found"

# Check nginx status
echo -e "\n=== Nginx Status ==="
sudo systemctl status nginx

# Check nginx error logs
echo "=== Nginx Error Logs ==="
sudo tail -20 /var/log/nginx/error.log