# GitHub Secrets Setup - Simple Guide

## 📝 Required Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets (one by one):

### 🖥️ Server Connection
```
EC2_HOST = your-server-ip-address
EC2_USER = ubuntu
EC2_SSH_KEY = <paste your private SSH key>
EC2_PORT = 22
APP_DIRECTORY = /home/ubuntu/cleanekiti-mvp
APP_PORT = 3000
APP_URL = http://your-domain.com (or http://your-ip:3000)
```

### 🗄️ Database (Supabase)
```
SUPABASE_URL = https://xoptyjfkxicciunkpriv.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 📁 File Storage (Cloudinary)
```
CLOUDINARY_CLOUD_NAME = dxtzyipor
CLOUDINARY_API_KEY = 663891567155665
CLOUDINARY_API_SECRET = gAWnIM2Y4_sx6J60WDqwReWMxOs
```

### 🔐 Authentication
```
JWT_SECRET = e2e563bea8d87855ac1c7b3945de685aa5aa6f556b8010de04a50f91f18228d63a74926333da16716f88e99dd643f8093a36a5f375bfed8fe38dcbbbc4b06539
```

### 📧 Optional
```
ADMIN_EMAIL = bankolejohn@gmail.com
RESEND_API_KEY = demo_resend_key
MAPBOX_TOKEN = (leave empty for now, uses demo token)
```

---

## 🚀 How It Works

1. **Push code** to `main` or `develop` branch
2. **GitHub Actions** automatically runs
3. **Connects to your EC2** server via SSH
4. **Pulls latest code** from GitHub
5. **Creates .env.local** from secrets
6. **Builds the app**
7. **Restarts with PM2**
8. **Runs health check**
9. **Rolls back if fails**

---

## ✅ Quick Test

After adding secrets:

```bash
# Commit and push
git add .
git commit -m "test deployment"
git push origin develop
```

Then:
1. Go to GitHub → **Actions** tab
2. Watch the deployment run
3. Check for green checkmark ✅

---

## 🔍 Troubleshooting

### Deployment fails at "Deploy to EC2 Server"
- Check `EC2_HOST`, `EC2_USER`, and `EC2_SSH_KEY` are correct
- Make sure SSH key has no passphrase
- Verify EC2 security group allows SSH (port 22)

### Deployment fails at "Build application"
- Check all Supabase and Cloudinary secrets are correct
- Verify no typos in secret names

### Health check fails
- SSH into server: `ssh ubuntu@your-server`
- Check PM2 logs: `pm2 logs cleanekiti`
- Check if .env.local was created: `cat .env.local`

---

## 📋 Checklist

Before pushing:
- [ ] All secrets added to GitHub
- [ ] EC2 server is running
- [ ] App directory exists on server
- [ ] PM2 is installed on server
- [ ] Node.js 18+ installed on server
- [ ] Git repository cloned on server

---

## 🎯 Current Setup

Based on your `.env.local`, here are your actual values:

**Server:** (You need to add these)
- EC2_HOST = `your-ec2-ip`
- EC2_USER = `ubuntu`
- EC2_SSH_KEY = `your-private-key`
- APP_DIRECTORY = `/home/ubuntu/cleanekiti-mvp`
- APP_PORT = `3000`
- APP_URL = `http://your-domain-or-ip`

**Already have these from .env.local:**
- SUPABASE_URL = `https://xoptyjfkxicciunkpriv.supabase.co`
- SUPABASE_ANON_KEY = ✅ (from your .env.local)
- SUPABASE_SERVICE_ROLE_KEY = ✅ (from your .env.local)
- CLOUDINARY_CLOUD_NAME = `dxtzyipor`
- CLOUDINARY_API_KEY = ✅ (from your .env.local)
- CLOUDINARY_API_SECRET = ✅ (from your .env.local)
- JWT_SECRET = ✅ (from your .env.local)
- ADMIN_EMAIL = `bankolejohn@gmail.com`

Just copy these values to GitHub Secrets!
