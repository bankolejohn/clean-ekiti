#!/bin/bash

# Increase nginx timeouts for file uploads
echo "🔧 Increasing nginx timeouts..."

# Update nginx config with larger timeouts
sudo tee -a /etc/nginx/nginx.conf > /dev/null << 'EOF'

# Increase timeouts for file uploads
client_max_body_size 10M;
client_body_timeout 60s;
client_header_timeout 60s;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
EOF

# Restart nginx
sudo systemctl restart nginx

echo "✅ Nginx timeouts increased"