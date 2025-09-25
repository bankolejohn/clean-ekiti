# CleanEkiti MVP - Deployment Guide

## 🚀 Quick Deployment Checklist

### 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Cloudinary account created
- [ ] Resend account created (optional)
- [ ] Vercel account created (for deployment)

### 2. Environment Setup
1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@cleanekiti.com

# JWT (Required for admin auth)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Run the script to create tables and default admin user

### 4. Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app running.

### 5. Production Deployment (Vercel)

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other env vars

# Redeploy with env vars
vercel --prod
```

### 6. Post-Deployment Checklist
- [ ] Test report submission
- [ ] Test image upload
- [ ] Test admin login (admin/admin123)
- [ ] Test map functionality
- [ ] Change default admin password
- [ ] Test email notifications (if configured)

## 🔧 Service Configuration

### Supabase Setup
1. Create new project at supabase.com
2. Go to Settings > API to get your keys
3. Run the SQL script in SQL Editor
4. Enable Row Level Security (RLS) is already configured

### Cloudinary Setup
1. Create account at cloudinary.com
2. Go to Dashboard to get your credentials
3. No additional configuration needed

### Resend Setup (Optional)
1. Create account at resend.com
2. Get API key from dashboard
3. Verify your sending domain (optional for testing)

## 🛠️ Troubleshooting

### Common Issues

**Maps not loading:**
- Check if Leaflet CSS is imported in globals.css
- Ensure dynamic imports are used for map components

**Images not uploading:**
- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure proper CORS settings

**Admin login failing:**
- Verify JWT_SECRET is set
- Check if admin user exists in database
- Ensure bcrypt hash is correct

**Database connection issues:**
- Verify Supabase URL and keys
- Check RLS policies are correctly set
- Ensure service role key has proper permissions

### Performance Optimization
- Images are automatically optimized by Cloudinary
- Maps use dynamic imports for better loading
- Database queries are indexed for performance

## 📱 Mobile Considerations
- App is fully responsive
- Touch-friendly interface
- Optimized for mobile data usage
- Progressive Web App ready (can be enhanced)

## 🔒 Security Features
- Row Level Security (RLS) enabled
- Admin authentication with JWT
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment variable protection

## 📊 Monitoring & Analytics
Consider adding:
- Vercel Analytics
- Supabase Analytics
- Error tracking (Sentry)
- Performance monitoring

## 🚀 Going Live
1. Purchase domain name
2. Configure custom domain in Vercel
3. Set up SSL (automatic with Vercel)
4. Configure email domain for notifications
5. Set up monitoring and backups
6. Create admin documentation
7. Train local administrators

---

**Support**: For issues, check the README.md or create a GitHub issue.