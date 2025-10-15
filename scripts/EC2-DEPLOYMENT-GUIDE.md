# EC2 Ubuntu Deployment Guide

## Quick Deployment Steps

### 1. Prepare Your Environment File

**Option A: Create .env.local locally and upload**
```bash
# Copy the template
cp scripts/.env.production.template .env.local

# Edit with your actual credentials
nano .env.local

# Upload to your EC2 instance
scp .env.local ubuntu@your-ec2-ip:~/clean-ekiti/
```

**Option B: Create directly on EC2**
```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Clone the repository
git clone https://github.com/your-username/clean-ekiti.git
cd clean-ekiti

# Create environment file
cp scripts/.env.production.template .env.local
nano .env.local  # Edit with your credentials
```

### 2. Run Deployment Script
```bash
# Make script executable
chmod +x scripts/deploy-ec2.sh

# Run deployment
./scripts/deploy-ec2.sh
```

### 3. Required Credentials

You need accounts and API keys from:

- **Supabase**: Database and authentication
- **Cloudinary**: Image storage and optimization  
- **Resend**: Email notifications (optional)

### 4. EC2 Instance Requirements

- **Instance Type**: t3.small or larger (2GB+ RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 20GB+ SSD
- **Security Groups**: 
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

### 5. Post-Deployment

1. **Test the application**: Visit `http://your-ec2-ip`
2. **Change admin password**: Login at `/admin/login` (admin/admin123)
3. **Configure domain**: Update Nginx config with your domain
4. **Set up SSL**: Use Let's Encrypt or upload certificates
5. **Test functionality**: Submit reports, upload images, check admin panel

### 6. Domain & SSL Setup (Optional)

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update Nginx config
sudo nano /etc/nginx/sites-available/cleanekiti
# Replace 'your-domain.com' with your actual domain

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Monitoring & Maintenance

```bash
# Check application status
pm2 status

# View logs
pm2 logs cleanekiti

# Restart application
pm2 restart cleanekiti

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module 'tailwindcss'":**
```bash
# Install missing dependencies
npm install tailwindcss autoprefixer postcss --save-dev
npm run build
```

**Build fails with missing components:**
```bash
# Verify all files were cloned
ls -la components/
ls -la app/

# If missing, re-clone repository
rm -rf clean-ekiti
git clone https://github.com/your-username/clean-ekiti.git
cd clean-ekiti
```

**App won't start:**
- Check `.env.local` has correct credentials
- Verify Supabase database is set up
- Check PM2 logs: `pm2 logs cleanekiti`

**Images not uploading:**
- Verify Cloudinary credentials in `.env.local`
- Check file size limits in Nginx config

**Database errors:**
- Ensure Supabase database tables are created
- Run the SQL script from `scripts/setup-database.sql`
- Check RLS policies are enabled

**Nginx errors:**
- Test config: `sudo nginx -t`
- Check logs: `sudo tail -f /var/log/nginx/error.log`
- Verify domain configuration

**Memory issues during build:**
```bash
# Increase swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Build with more memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Performance Tips

- Use t3.medium or larger for production
- Enable Nginx caching for static files
- Monitor memory usage with `htop`
- Set up automated backups for Supabase

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable UFW firewall
- [ ] Set up SSL certificates
- [ ] Restrict SSH access to your IP
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs regularly

---

**Need help?** Check the main README.md or create an issue on GitHub.