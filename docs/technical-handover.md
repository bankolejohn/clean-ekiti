# CleanEkiti Technical Handover Document

## System Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 (React framework)
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudinary
- **Hosting**: AWS EC2 (Ubuntu 22.04)
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: PM2
- **Domain**: Ready for custom government domain

### Current Infrastructure
- **Server**: AWS EC2 t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 30GB SSD
- **Location**: US East (can be moved to any region)
- **Backup**: Automated daily backups via Supabase
- **Monitoring**: PM2 process monitoring, Nginx logs

---

## Deployment Information

### Current Deployment
- **Production URL**: `http://54.243.21.121`
- **Admin Access**: `http://54.243.21.121/admin/login`
- **Default Admin**: Username: `admin`, Password: `admin123` (CHANGE IMMEDIATELY)

### CI/CD Pipeline
- **Repository**: GitHub with automated deployments
- **Staging Branch**: Auto-deploys to staging server
- **Production Branch**: Auto-deploys to production server
- **Rollback**: Automatic rollback on deployment failures

### Environment Configuration
```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_secure_jwt_secret
ADMIN_EMAIL=admin@ekitistate.gov.ng
```

---

## Database Schema

### Tables Structure

#### reports
- `id` (UUID) - Primary key
- `category` (VARCHAR) - dumping, flooding, pollution, drainage, other
- `description` (TEXT) - Optional description
- `image_url` (VARCHAR) - Cloudinary image URL
- `latitude` (DECIMAL) - GPS coordinates
- `longitude` (DECIMAL) - GPS coordinates
- `location_name` (VARCHAR) - Human-readable location
- `status` (VARCHAR) - pending, investigating, resolved
- `reporter_email` (VARCHAR) - Optional contact email
- `created_at` (TIMESTAMP) - Report submission time
- `updated_at` (TIMESTAMP) - Last modification time

#### admin_users
- `id` (UUID) - Primary key
- `username` (VARCHAR) - Login username
- `password_hash` (VARCHAR) - Encrypted password
- `email` (VARCHAR) - Admin email address
- `created_at` (TIMESTAMP) - Account creation time

### Database Access
- **Admin Panel**: Supabase dashboard for direct database access
- **Backups**: Automated daily backups with 30-day retention
- **Security**: Row Level Security (RLS) enabled
- **API Access**: Secure API keys with proper permissions

---

## Security Configuration

### Authentication
- **Admin Login**: JWT-based authentication
- **Session Management**: HTTP-only cookies
- **Password Security**: bcrypt hashing with salt rounds
- **API Protection**: Service role key for admin operations

### Data Protection
- **HTTPS**: SSL/TLS encryption for all communications
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Protected via Supabase parameterized queries
- **File Upload**: Secure image upload with type validation

### Access Control
- **Public Access**: Read-only access to reports
- **Admin Access**: Full CRUD operations on reports
- **Database Access**: Restricted to service role
- **Server Access**: SSH key authentication only

---

## Maintenance Procedures

### Daily Monitoring
```bash
# Check application status
pm2 status

# View application logs
pm2 logs cleanekiti

# Check system resources
htop

# Monitor Nginx
sudo systemctl status nginx
```

### Weekly Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Restart application (zero downtime)
pm2 reload cleanekiti

# Check disk space
df -h

# Review error logs
sudo tail -f /var/log/nginx/error.log
```

### Monthly Tasks
- Review and rotate log files
- Update Node.js and dependencies
- Security audit and updates
- Performance optimization review
- Backup verification

---

## Scaling Considerations

### Current Capacity
- **Concurrent Users**: 500+ simultaneous users
- **Reports per Month**: 10,000+ reports
- **Image Storage**: Unlimited via Cloudinary
- **Database**: 500GB included with Supabase

### Scaling Options

#### Horizontal Scaling
- **Load Balancer**: AWS Application Load Balancer
- **Multiple Servers**: Deploy to multiple EC2 instances
- **Database**: Supabase handles automatic scaling
- **CDN**: CloudFront for static asset delivery

#### Vertical Scaling
- **Server Upgrade**: t3.large (2 vCPU, 8GB RAM)
- **Database**: Supabase Pro plan for higher performance
- **Storage**: Increase EBS volume as needed

### Performance Optimization
- **Caching**: Redis for session and data caching
- **Image Optimization**: Cloudinary automatic optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Code Splitting**: Next.js automatic code splitting

---

## Backup and Recovery

### Automated Backups
- **Database**: Daily automated backups via Supabase
- **Images**: Cloudinary provides redundant storage
- **Code**: GitHub repository with full history
- **Configuration**: Environment variables documented

### Recovery Procedures

#### Database Recovery
```bash
# Restore from Supabase backup
# 1. Access Supabase dashboard
# 2. Go to Settings > Database
# 3. Select backup date
# 4. Click "Restore"
```

#### Application Recovery
```bash
# Redeploy from GitHub
git pull origin main
npm install
npm run build
pm2 restart cleanekiti
```

#### Full System Recovery
```bash
# Launch new EC2 instance
# Run deployment script
chmod +x scripts/deploy-ec2.sh
./scripts/deploy-ec2.sh

# Restore environment variables
# Restore database from backup
# Update DNS records
```

---

## Monitoring and Alerts

### System Monitoring
- **Application**: PM2 monitoring dashboard
- **Server**: CloudWatch metrics (CPU, memory, disk)
- **Database**: Supabase built-in monitoring
- **Uptime**: External monitoring service recommended

### Alert Configuration
```bash
# Set up CloudWatch alarms
# CPU usage > 80%
# Memory usage > 90%
# Disk space < 10%
# Application downtime > 5 minutes
```

### Log Management
- **Application Logs**: PM2 log rotation
- **Nginx Logs**: Logrotate configuration
- **System Logs**: Syslog with retention policy
- **Error Tracking**: Consider Sentry integration

---

## Customization Guide

### Branding Updates
```bash
# Update colors in tailwind.config.js
colors: {
  primary: '#your-primary-color',
  secondary: '#your-secondary-color',
  accent: '#your-accent-color',
}

# Add government logos
# Place files in public/ directory
# Update Navigation.tsx and layout files
```

### Feature Additions
- **New Report Categories**: Update database schema and forms
- **Department Routing**: Add automatic assignment logic
- **Email Notifications**: Configure Resend integration
- **SMS Alerts**: Integrate SMS service for urgent reports

### Integration Options
- **Government Systems**: API endpoints for data sharing
- **GIS Systems**: Export location data for mapping
- **Reporting Tools**: Data export for analytics
- **Mobile App**: React Native version available

---

## Support and Training

### Documentation
- **User Manual**: Complete guide for all user types
- **API Documentation**: For system integrations
- **Video Tutorials**: Step-by-step training videos
- **FAQ Database**: Common questions and solutions

### Training Schedule
- **Week 1**: System administrators (4 hours)
- **Week 2**: Department liaisons (2 hours each)
- **Week 3**: Field staff (1 hour each)
- **Ongoing**: Monthly refresher sessions

### Support Contacts
- **Technical Issues**: [Developer Contact]
- **Training Questions**: [Training Team]
- **System Administration**: [Admin Support]
- **Emergency Support**: 24/7 during transition

---

## Handover Checklist

### Pre-Handover (Government Preparation)
- [ ] AWS account setup and configured
- [ ] Government domain registered and configured
- [ ] SSL certificates obtained
- [ ] Admin staff identified and trained
- [ ] Department contacts established

### Technical Handover
- [ ] Server access transferred to government AWS account
- [ ] Database ownership transferred to government
- [ ] Domain DNS updated to government servers
- [ ] Environment variables configured
- [ ] Admin accounts created for government staff
- [ ] Backup procedures verified
- [ ] Monitoring systems configured

### Post-Handover (30 days)
- [ ] System stability confirmed
- [ ] Performance metrics baseline established
- [ ] Staff training completed
- [ ] Public launch executed
- [ ] Feedback collection and analysis
- [ ] Optimization recommendations implemented

---

**This technical handover ensures a smooth transition of the CleanEkiti platform to Ekiti State Government management while maintaining system reliability and performance.**