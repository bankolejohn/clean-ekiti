# CleanEkiti - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication (minimum 32 characters)
JWT_SECRET=your_very_long_and_secure_jwt_secret_here_min_32_chars
```

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
cleanekiti-mvp/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── reports/       # Public report endpoints
│   │   └── admin/         # Admin endpoints
│   ├── admin/             # Admin pages
│   ├── map/               # Map view page
│   └── report/            # Report submission page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── constants.ts       # App constants
│   ├── validation.ts      # Input validation
│   ├── errors.ts          # Error classes
│   ├── middleware.ts      # API middleware
│   ├── auth.ts           # Authentication
│   ├── supabase.ts       # Database client
│   ├── cloudinary.ts     # File upload
│   └── hooks/            # Custom React hooks
├── types/                # TypeScript definitions
└── __tests__/            # Test files
```

## 🔑 Key Features

### Security
- ✅ Input validation and sanitization
- ✅ Rate limiting (10 reports/hour, 5 login attempts/hour)
- ✅ JWT authentication with HTTP-only cookies
- ✅ Password hashing with bcrypt
- ✅ File upload validation (10MB max, images only)
- ✅ CORS and security headers

### API Endpoints

#### Public
- `GET /api/reports` - Fetch all reports
- `POST /api/reports` - Create new report

#### Admin (requires authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/reports` - Get all reports with stats
- `PUT /api/admin/reports` - Update report status
- `DELETE /api/admin/reports?id={id}` - Delete report

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Test API Endpoints
```bash
./scripts/test-api.sh
```

## 🛠️ Common Tasks

### Create Admin User
```sql
-- Run in Supabase SQL editor
INSERT INTO admin_users (username, email, password_hash, is_active)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$12$your_bcrypt_hash_here',
  true
);
```

Generate password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 12));"
```

### View Logs
```bash
# Development
npm run dev

# Production
pm2 logs cleanekiti
```

### Database Migrations
```bash
# Run migrations in Supabase dashboard
# Or use Supabase CLI
supabase db push
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Check Build
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### JWT Errors
```bash
# Ensure JWT_SECRET is at least 32 characters
echo $JWT_SECRET | wc -c
```

### Image Upload Failures
```bash
# Verify Cloudinary credentials
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

## 📚 Documentation

- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Detailed changes
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Implementation status

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker
```bash
# Build image
docker build -t cleanekiti .

# Run container
docker run -p 3000:3000 --env-file .env.local cleanekiti
```

### Traditional Server
```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "cleanekiti" -- start

# Or use systemd service
sudo systemctl start cleanekiti
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] JWT_SECRET is 32+ characters
- [ ] HTTPS enabled
- [ ] CORS origins configured
- [ ] Rate limiting active
- [ ] Admin password is strong
- [ ] Database backups configured
- [ ] Error monitoring set up
- [ ] Security headers verified
- [ ] File upload limits tested

## 📞 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review error logs
3. Check GitHub issues
4. Contact development team

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run lint            # Lint code
npm run build           # Build for production

# Production
npm start               # Start production server
npm run build && npm start  # Build and start

# Testing
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage
./scripts/test-api.sh   # Test API endpoints

# Maintenance
npm run clean           # Clean build artifacts
npm audit               # Check for vulnerabilities
npm update              # Update dependencies
```

## 🌟 Best Practices

1. **Always validate input** - Use validation utilities in `lib/validation.ts`
2. **Handle errors properly** - Use custom error classes from `lib/errors.ts`
3. **Log important events** - Use middleware logging
4. **Test before deploying** - Run full test suite
5. **Monitor in production** - Set up error tracking
6. **Keep dependencies updated** - Regular security updates
7. **Follow TypeScript** - Maintain type safety
8. **Document changes** - Update relevant docs

---

**Ready to go!** 🎉

For detailed information, see [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)