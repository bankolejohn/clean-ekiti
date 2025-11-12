# Environment Variables Setup Guide

## 🔐 Security Best Practices

### Golden Rules:
1. ❌ **NEVER** commit `.env`, `.env.local`, or `.env.production` to Git
2. ✅ Use **GitHub Secrets** for CI/CD
3. ✅ Use different secrets for staging and production
4. ✅ Rotate secrets regularly (every 90 days)
5. ✅ Use strong, randomly generated secrets

---

## 📋 Required Environment Variables

### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### File Storage (Cloudinary)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```

### Authentication
```bash
# Generate with: openssl rand -hex 32
JWT_SECRET=your_64_character_hex_string_here
```

### Optional Services
```bash
RESEND_API_KEY=re_your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

## 🚀 Setup Instructions

### 1. Local Development

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local

# Never commit this file!
git status  # Should show .env.local in .gitignore
```

### 2. GitHub Secrets Setup

#### Navigate to GitHub Repository Settings:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

#### Create Environments (Recommended):
1. Go to **Settings** → **Environments**
2. Create two environments:
   - `staging`
   - `production`
3. Add secrets to each environment

#### Required Secrets for Staging:

```
STAGING_HOST=your-staging-server-ip
STAGING_USER=ubuntu
STAGING_SSH_KEY=<your-private-ssh-key>
STAGING_PORT=22
STAGING_APP_URL=http://staging.yourdomain.com

SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=<generate-with-openssl-rand-hex-32>

ADMIN_EMAIL=admin@yourdomain.com
RESEND_API_KEY=<optional>
MAPBOX_TOKEN=<optional>
```

#### Required Secrets for Production:

```
PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=ubuntu
PRODUCTION_SSH_KEY=<your-private-ssh-key>
PRODUCTION_PORT=22
PRODUCTION_APP_URL=https://yourdomain.com

SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=<different-from-staging>

ADMIN_EMAIL=admin@yourdomain.com
RESEND_API_KEY=<optional>
MAPBOX_TOKEN=<optional>
```

### 3. EC2 Server Setup

#### SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-server-ip
```

#### Clone the repository:
```bash
# Staging
cd /home/ubuntu
git clone https://github.com/yourusername/cleanekiti-mvp.git clean-ekiti-staging
cd clean-ekiti-staging
git checkout develop

# Production
cd /var/www
sudo git clone https://github.com/yourusername/cleanekiti-mvp.git cleanekiti
cd cleanekiti
git checkout main
```

#### The deployment script will automatically create `.env.local` from GitHub Secrets

---

## 🔄 How It Works

### During Deployment:

1. **GitHub Actions** runs the workflow
2. **Secrets** are passed as environment variables to the SSH session
3. **setup-env.sh** script creates `.env.local` on the server
4. **Application** reads from `.env.local`

### Environment Variable Flow:

```
GitHub Secrets 
    ↓
GitHub Actions (CI/CD)
    ↓
SSH to EC2
    ↓
setup-env.sh script
    ↓
.env.local file on server
    ↓
Next.js Application
```

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] All secrets are stored in GitHub Secrets
- [ ] Different secrets for staging and production
- [ ] JWT_SECRET is at least 32 characters
- [ ] SSH keys are properly secured
- [ ] Supabase RLS policies are enabled
- [ ] Cloudinary upload restrictions are configured
- [ ] Production uses HTTPS
- [ ] Secrets are rotated every 90 days

---

## 🛠️ Troubleshooting

### Issue: Environment variables not loading

**Solution:**
```bash
# SSH into server
ssh ubuntu@your-server

# Check if .env.local exists
cd /home/ubuntu/clean-ekiti-staging
ls -la .env.local

# Manually run setup script
export SUPABASE_URL="your_url"
export SUPABASE_ANON_KEY="your_key"
# ... export all variables
./scripts/setup-env.sh

# Restart application
pm2 restart cleanekiti-staging
```

### Issue: Build fails with missing environment variables

**Solution:**
- Check GitHub Secrets are properly set
- Verify secret names match exactly (case-sensitive)
- Check GitHub Actions logs for specific missing variables

### Issue: Application can't connect to database

**Solution:**
- Verify Supabase URL and keys are correct
- Check Supabase project is not paused
- Verify network connectivity from EC2 to Supabase

---

## 📚 Additional Resources

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

---

## 🔄 Rotating Secrets

### Every 90 Days:

1. **Generate new JWT_SECRET:**
   ```bash
   openssl rand -hex 32
   ```

2. **Update GitHub Secrets**
3. **Deploy to staging first**
4. **Test thoroughly**
5. **Deploy to production**
6. **Update documentation**

---

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs
2. SSH into server and check PM2 logs: `pm2 logs cleanekiti-staging`
3. Verify environment variables: `cat .env.local` (on server)
4. Check application logs: `pm2 logs`
