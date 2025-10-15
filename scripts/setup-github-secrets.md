# GitHub Secrets Setup Guide

## Required Secrets for CI/CD

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Staging Server Secrets

```
STAGING_HOST=your-staging-server-ip
STAGING_USER=ubuntu
STAGING_SSH_KEY=your-private-ssh-key-content
```

### Production Server Secrets

```
PRODUCTION_HOST=54.243.21.121
PRODUCTION_USER=ubuntu
PRODUCTION_SSH_KEY=your-private-ssh-key-content
```

## How to Get SSH Key Content

### Option 1: Use existing key
```bash
# Display your private key (copy the entire output)
cat ~/.ssh/id_rsa
```

### Option 2: Create new deployment key
```bash
# Generate new key pair for deployments
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# Copy public key to servers
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@your-staging-ip
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@54.243.21.121

# Use private key content for GitHub secret
cat ~/.ssh/deploy_key
```

## Environment Variables for Staging

Create these as GitHub secrets (optional - or use .env.local on server):

```
STAGING_SUPABASE_URL=your-staging-supabase-url
STAGING_SUPABASE_ANON_KEY=your-staging-anon-key
STAGING_SUPABASE_SERVICE_KEY=your-staging-service-key
STAGING_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
STAGING_CLOUDINARY_API_KEY=your-cloudinary-key
STAGING_CLOUDINARY_API_SECRET=your-cloudinary-secret
STAGING_JWT_SECRET=your-staging-jwt-secret
STAGING_ADMIN_EMAIL=admin@yourdomain.com
```

## Branch Strategy

- `main` → Production deployments
- `develop/staging` → Staging deployments
- `feature/*` → No auto-deployment (manual testing)

## Deployment Triggers

### Staging
- Push to `develop` or `staging` branch
- Pull requests to `main`

### Production
- Push to `main` branch
- Manual workflow dispatch (with confirmation)

## Testing the Setup

1. **Create staging branch:**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Make a test change:**
   ```bash
   echo "// Test deployment" >> README.md
   git add README.md
   git commit -m "Test staging deployment"
   git push origin staging
   ```

3. **Check GitHub Actions tab** for deployment status

4. **Verify staging deployment** at your staging URL

## Security Best Practices

- Use separate SSH keys for deployments
- Limit SSH key permissions on servers
- Use different environment variables for staging/production
- Enable branch protection rules on `main`
- Require PR reviews before merging to `main`

## Rollback Strategy

### Automatic Rollback
- Production deployments auto-rollback on failure
- Staging deployments stop on failure (no rollback needed)

### Manual Rollback
```bash
# SSH into server
ssh ubuntu@your-server-ip

# Restore from backup
cd /home/ubuntu/clean-ekiti
rm -rf .next
mv .next.backup .next
pm2 restart cleanekiti
```