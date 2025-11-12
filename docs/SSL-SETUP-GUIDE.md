# SSL/HTTPS Setup Guide for CleanEkiti

This guide will help you set up HTTPS for your CleanEkiti application using Let's Encrypt SSL certificates.

## Prerequisites

- EC2 instance running with CleanEkiti deployed
- Domain: `cleanekiti.johndesiventures.website`
- Access to Namecheap DNS settings

## Step 1: Configure DNS on Namecheap

1. Log in to your Namecheap account
2. Go to Domain List and select `johndesiventures.website`
3. Click "Advanced DNS" or "Manage"
4. Add a new A Record:
   - **Type**: A Record
   - **Host**: `cleanekiti`
   - **Value**: Your EC2 server IP address (get it from AWS console or run `curl http://checkip.amazonaws.com` on your server)
   - **TTL**: Automatic (or 300 seconds)

5. Save the changes
6. Wait 5-10 minutes for DNS propagation

### Verify DNS Configuration

From your local machine, run:
```bash
dig cleanekiti.johndesiventures.website
# or
nslookup cleanekiti.johndesiventures.website
```

The IP address should match your EC2 server IP.

## Step 2: Run the SSL Setup Script

SSH into your EC2 server:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Navigate to the project directory:
```bash
cd /home/ubuntu/clean-ekiti
```

Make the script executable and run it:
```bash
chmod +x scripts/setup-ssl.sh
sudo bash scripts/setup-ssl.sh
```

The script will:
- Check DNS configuration
- Install Certbot
- Update Nginx configuration with your domain
- Obtain SSL certificate from Let's Encrypt
- Configure automatic certificate renewal
- Set up HTTPS redirect

## Step 3: Verify HTTPS is Working

1. Open your browser and go to: `https://cleanekiti.johndesiventures.website`
2. You should see a padlock icon in the address bar
3. Test the admin login: `https://cleanekiti.johndesiventures.website/admin/login`

## Step 4: Update Environment Variables (if needed)

If you have any hardcoded URLs in your environment variables, update them to use HTTPS:

```bash
cd /home/ubuntu/clean-ekiti
nano .env.local
```

Update any URLs from `http://` to `https://` if applicable.

Then restart the application:
```bash
pm2 restart cleanekiti
```

## Troubleshooting

### DNS Not Propagating
If DNS is not resolving after 10 minutes:
- Clear your DNS cache: `sudo systemd-resolve --flush-caches` (on Ubuntu)
- Try a different DNS server: `dig @8.8.8.8 cleanekiti.johndesiventures.website`
- Check Namecheap DNS settings are correct

### Certbot Fails to Obtain Certificate
1. Ensure port 80 is open in your EC2 security group
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Ensure the domain is pointing to your server

### Certificate Renewal Issues
Check auto-renewal status:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Certificate Management

### View Certificate Information
```bash
sudo certbot certificates
```

### Manually Renew Certificate
```bash
sudo certbot renew
```

### Revoke Certificate (if needed)
```bash
sudo certbot revoke --cert-path /etc/letsencrypt/live/cleanekiti.johndesiventures.website/cert.pem
```

## Automatic Renewal

Let's Encrypt certificates are valid for 90 days. The setup script configures automatic renewal:
- Certbot timer runs twice daily
- Certificates are automatically renewed when they have 30 days or less remaining
- Nginx is automatically reloaded after renewal

Check renewal timer status:
```bash
sudo systemctl status certbot.timer
```

## Security Best Practices

After SSL is set up:

1. **Force HTTPS**: The script automatically redirects HTTP to HTTPS
2. **Update Security Headers**: Already configured in the application
3. **Test SSL Configuration**: Use [SSL Labs](https://www.ssllabs.com/ssltest/) to test your SSL setup
4. **Monitor Certificate Expiry**: Set up monitoring to alert you if auto-renewal fails

## Additional Configuration

### Custom Nginx Settings

If you need to customize Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/cleanekiti
sudo nginx -t  # Test configuration
sudo systemctl reload nginx  # Apply changes
```

### Firewall Rules

Ensure your firewall allows HTTPS:
```bash
sudo ufw allow 443/tcp
sudo ufw status
```

## Support

If you encounter issues:
1. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Check Certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
3. Check application logs: `pm2 logs cleanekiti`
4. Verify DNS: `dig cleanekiti.johndesiventures.website`

## Summary

Once complete, your application will be:
- ✅ Accessible via HTTPS
- ✅ Automatically redirecting HTTP to HTTPS
- ✅ Using secure cookies for admin authentication
- ✅ Auto-renewing SSL certificates every 60 days
- ✅ Protected with modern security headers
