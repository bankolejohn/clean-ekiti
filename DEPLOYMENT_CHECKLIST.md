# 🚀 Deployment Checklist

## Pre-Deployment

### 1. GitHub Secrets Setup
- [ ] Create `staging` environment in GitHub
- [ ] Create `production` environment in GitHub
- [ ] Add all required secrets to each environment
- [ ] Verify secret names match workflow files

### 2. Server Preparation
- [ ] EC2 instance running Ubuntu 24.04
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx configured (if using)
- [ ] SSL certificate installed (production)
- [ ] Firewall configured (ports 80, 443, 22)

### 3. Repository Setup
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.example` committed to repo
- [ ] `scripts/setup-env.sh` is executable
- [ ] GitHub Actions workflows configured

## Deployment Steps

### Staging Deployment

1. **Push to develop branch:**
   ```bash
   git checkout develop
   git add .
   git commit -m "your message"
   git push origin develop
   ```

2. **Monitor GitHub Actions:**
   - Go to Actions tab in GitHub
   - Watch the deployment progress
   - Check for any errors

3. **Verify Deployment:**
   - Visit staging URL
   - Test all features
   - Check admin dashboard
   - Submit test report
   - Update report status

### Production Deployment

1. **Merge to main:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Monitor Deployment:**
   - Watch GitHub Actions
   - Check health checks pass

3. **Post-Deployment Verification:**
   - [ ] Homepage loads
   - [ ] Map displays correctly
   - [ ] Report submission works
   - [ ] Admin login works
   - [ ] Status updates work
   - [ ] Images upload correctly
   - [ ] No console errors

## Rollback Procedure

If deployment fails:

1. **Automatic Rollback:**
   - GitHub Actions will restore `.next.backup`
   - PM2 will restart with previous version

2. **Manual Rollback:**
   ```bash
   ssh ubuntu@your-server
   cd /var/www/cleanekiti
   git reset --hard HEAD~1
   npm run build
   pm2 restart cleanekiti
   ```

## Monitoring

### Check Application Status
```bash
# SSH into server
ssh ubuntu@your-server

# Check PM2 status
pm2 status

# View logs
pm2 logs cleanekiti

# Check disk space
df -h

# Check memory
free -h
```

### Health Checks
- [ ] API health endpoint: `/api/health`
- [ ] Reports endpoint: `/api/reports`
- [ ] Admin login: `/admin/login`
- [ ] Map page: `/map`

## Troubleshooting

### Issue: Deployment fails at build step
**Solution:** Check environment variables in GitHub Secrets

### Issue: Application won't start
**Solution:** 
```bash
pm2 logs cleanekiti
# Check for missing environment variables
cat .env.local
```

### Issue: Database connection fails
**Solution:** Verify Supabase credentials and network access

### Issue: Images won't upload
**Solution:** Check Cloudinary credentials

## Security Checklist

- [ ] All secrets in GitHub Secrets (not in code)
- [ ] HTTPS enabled in production
- [ ] Firewall configured
- [ ] SSH key-based authentication only
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

## Post-Deployment

- [ ] Update documentation
- [ ] Notify team of deployment
- [ ] Monitor error logs for 24 hours
- [ ] Schedule next deployment
- [ ] Document any issues encountered

---

**Last Updated:** $(date)
**Deployed By:** [Your Name]
**Version:** [Git commit hash]
