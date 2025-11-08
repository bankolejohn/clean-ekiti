# CleanEkiti Testing Guide

## Overview
This guide provides instructions for testing the refactored CleanEkiti application, including unit tests, integration tests, and manual testing procedures.

## Prerequisites

```bash
# Install dependencies
npm install

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Ensure environment variables are set
cp .env.example .env.local
# Edit .env.local with your actual values
```

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- validation.test.ts
```

### Build Verification

```bash
# Build the application
npm run build

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## Manual Testing

### 1. API Endpoint Testing

#### Test Reports API

```bash
# Get all reports
curl http://localhost:3000/api/reports

# Create a new report
curl -X POST http://localhost:3000/api/reports \
  -F 'category=dumping' \
  -F 'latitude=7.6219' \
  -F 'longitude=5.2206' \
  -F 'description=Test illegal dumping report' \
  -F 'reporter_email=test@example.com' \
  -F 'image=@/path/to/test-image.jpg'
```

#### Test Admin Authentication

```bash
# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  -c cookies.txt

# Get admin reports (requires authentication)
curl http://localhost:3000/api/admin/reports \
  -b cookies.txt

# Update report status
curl -X PUT http://localhost:3000/api/admin/reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"id":"report-uuid","status":"investigating"}'

# Delete report
curl -X DELETE "http://localhost:3000/api/admin/reports?id=report-uuid" \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt
```

### 2. Security Testing

#### Input Validation

```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/reports \
  -F 'category=dumping' \
  -F 'latitude=7.6219' \
  -F 'longitude=5.2206' \
  -F 'description=<script>alert("xss")</script>'

# Test invalid coordinates
curl -X POST http://localhost:3000/api/reports \
  -F 'category=dumping' \
  -F 'latitude=999' \
  -F 'longitude=999'

# Test invalid email
curl -X POST http://localhost:3000/api/reports \
  -F 'category=dumping' \
  -F 'latitude=7.6219' \
  -F 'longitude=5.2206' \
  -F 'reporter_email=invalid-email'
```

#### Rate Limiting

```bash
# Test rate limiting (run multiple times quickly)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/reports \
    -F 'category=dumping' \
    -F 'latitude=7.6219' \
    -F 'longitude=5.2206'
  echo "Request $i"
done
```

#### Authentication

```bash
# Test unauthorized access
curl http://localhost:3000/api/admin/reports

# Test invalid credentials
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"wrong"}'

# Test expired token (wait 24 hours or modify JWT_SECRET)
curl http://localhost:3000/api/admin/reports \
  -b old_cookies.txt
```

### 3. Frontend Testing

#### Report Submission Flow

1. Navigate to http://localhost:3000/report
2. Fill out the form:
   - Select a category
   - Add a description
   - Upload an image (test with valid and invalid file types)
   - Select location on map or use "Use My Location"
   - Add email (optional)
3. Click "Review & Submit Report"
4. Verify confirmation modal appears
5. Click "Confirm & Submit"
6. Verify success message and redirect

#### Admin Dashboard Flow

1. Navigate to http://localhost:3000/admin/login
2. Enter credentials
3. Verify redirect to dashboard
4. Check statistics display correctly
5. Test report status updates
6. Test report deletion
7. Test logout

#### Map View

1. Navigate to http://localhost:3000/map
2. Verify reports display on map
3. Test category filter
4. Test status filter
5. Click on markers to view report details

### 4. Accessibility Testing

```bash
# Install axe-core for accessibility testing
npm install --save-dev @axe-core/react

# Run accessibility audit in browser DevTools
# 1. Open Chrome DevTools
# 2. Go to Lighthouse tab
# 3. Select "Accessibility" category
# 4. Run audit
```

#### Manual Accessibility Checks

- [ ] Keyboard navigation works throughout the app
- [ ] All form inputs have proper labels
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have alt text
- [ ] Modals trap focus properly

### 5. Performance Testing

#### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

#### Load Testing

```bash
# Install Apache Bench
brew install httpd  # macOS
sudo apt-get install apache2-utils  # Linux

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/api/reports

# Test with POST requests
ab -n 100 -c 5 -p report.json -T application/json http://localhost:3000/api/reports
```

### 6. Database Testing

```sql
-- Verify report creation
SELECT * FROM reports ORDER BY created_at DESC LIMIT 10;

-- Check admin users
SELECT id, username, email, is_active, last_login FROM admin_users;

-- Verify data integrity
SELECT 
  category,
  COUNT(*) as count,
  AVG(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolution_rate
FROM reports
GROUP BY category;
```

## Test Scenarios

### Critical Path Testing

1. **User Report Submission**
   - [ ] User can access report form
   - [ ] User can select location
   - [ ] User can upload image
   - [ ] User receives confirmation
   - [ ] Report appears in database

2. **Admin Management**
   - [ ] Admin can login
   - [ ] Admin can view all reports
   - [ ] Admin can update report status
   - [ ] Admin can delete reports
   - [ ] Admin can logout

3. **Public Map View**
   - [ ] Public can view reports on map
   - [ ] Filters work correctly
   - [ ] Report details display properly

### Edge Cases

1. **Large File Upload**
   - [ ] Files over 10MB are rejected
   - [ ] Invalid file types are rejected
   - [ ] Upload timeout is handled

2. **Invalid Data**
   - [ ] XSS attempts are sanitized
   - [ ] SQL injection is prevented
   - [ ] Invalid coordinates are rejected
   - [ ] Missing required fields show errors

3. **Network Issues**
   - [ ] Timeout errors are handled
   - [ ] Retry logic works
   - [ ] Error messages are user-friendly

4. **Concurrent Operations**
   - [ ] Multiple users can submit reports
   - [ ] Admin updates don't conflict
   - [ ] Rate limiting works per IP

## Automated Testing

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run build
      - run: npm run lint
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm test && npm run lint"
```

## Test Coverage Goals

- **Unit Tests**: 85% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: Critical paths covered

### Current Coverage

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Troubleshooting

### Common Issues

1. **Tests failing due to environment variables**
   ```bash
   # Create test environment file
   cp .env.example .env.test
   # Run tests with test environment
   NODE_ENV=test npm test
   ```

2. **Database connection errors**
   ```bash
   # Verify Supabase credentials
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Image upload failures**
   ```bash
   # Verify Cloudinary credentials
   echo $CLOUDINARY_CLOUD_NAME
   echo $CLOUDINARY_API_KEY
   ```

4. **JWT errors**
   ```bash
   # Ensure JWT_SECRET is at least 32 characters
   echo $JWT_SECRET | wc -c
   ```

## Continuous Monitoring

### Production Testing

```bash
# Health check
curl https://your-domain.com/api/health

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/reports
```

### Error Tracking

- Set up Sentry or similar error tracking
- Monitor API response times
- Track user error rates
- Set up alerts for critical failures

## Security Audit Checklist

- [ ] All inputs are validated and sanitized
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled
- [ ] Rate limiting functional
- [ ] Authentication secure (JWT, bcrypt)
- [ ] File upload restrictions enforced
- [ ] Environment variables secured
- [ ] HTTPS enforced in production
- [ ] Security headers configured

## Performance Benchmarks

### Target Metrics

- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 2s (p95)
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

### Monitoring

```bash
# API response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/api/reports

# Database query performance
# Check Supabase dashboard for slow queries
```

## Conclusion

Regular testing ensures the CleanEkiti application remains secure, performant, and reliable. Follow this guide for comprehensive testing coverage and maintain high code quality standards.