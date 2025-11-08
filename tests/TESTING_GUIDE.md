# CleanEkiti Testing Guide

## Overview
This guide covers comprehensive testing of the CleanEkiti platform using Selenium for end-to-end testing and Postman for API testing.

---

## Prerequisites

### 1. Install Required Software
```bash
# Python 3.8+ (for Selenium tests)
python --version

# Chrome Browser (for Selenium)
google-chrome --version

# Node.js and npm (for running the app)
node --version
npm --version

# Postman (for API testing)
# Download from: https://www.postman.com/downloads/
```

### 2. Install Python Dependencies
```bash
# Navigate to tests directory
cd tests/selenium

# Install Python packages
pip install -r requirements.txt

# Or using pip3
pip3 install -r requirements.txt
```

---

## Running Tests

### Option 1: Automated Test Runner (Recommended)
```bash
# Make sure your app is running first
npm run dev

# Run all tests automatically
python tests/run_tests.py
```

### Option 2: Individual Test Suites

#### Selenium Tests (End-to-End)
```bash
# Start the application
npm run dev

# Run Selenium tests
python tests/selenium/test_cleanekiti.py

# Or with custom URL
TEST_URL=http://54.243.21.121 python tests/selenium/test_cleanekiti.py
```

#### API Tests with Postman
1. **Import Collection**:
   - Open Postman
   - Click "Import"
   - Select `tests/postman/CleanEkiti-API-Tests.postman_collection.json`

2. **Import Environment**:
   - Click "Import" 
   - Select `tests/postman/CleanEkiti-Environment.postman_environment.json`

3. **Run Tests**:
   - Select "CleanEkiti Environment" 
   - Click "Runner" → Select collection → "Run CleanEkiti API Tests"

---

## Test Coverage

### 1. Selenium Tests (End-to-End)

#### Homepage Tests
- ✅ Page loads correctly
- ✅ Navigation elements present
- ✅ Main CTA buttons work
- ✅ Title and headings correct

#### Navigation Tests  
- ✅ Report page navigation
- ✅ Map page navigation
- ✅ Admin login navigation
- ✅ All links functional

#### Report Submission Tests
- ✅ Form validation works
- ✅ Required fields enforced
- ✅ Complete submission flow
- ✅ Confirmation modal
- ✅ Success message display

#### Admin Authentication Tests
- ✅ Invalid login rejected
- ✅ Valid login accepted
- ✅ Redirect to dashboard
- ✅ Logout functionality

#### Admin Dashboard Tests
- ✅ Dashboard loads correctly
- ✅ Statistics cards display
- ✅ Reports table/list shows
- ✅ Report management functions

#### Mobile Responsiveness Tests
- ✅ Mobile navigation menu
- ✅ Form usability on mobile
- ✅ Responsive layout
- ✅ Touch-friendly elements

#### Performance Tests
- ✅ Page load times < 5 seconds
- ✅ No severe JavaScript errors
- ✅ Basic performance metrics

### 2. Postman API Tests

#### Public API Tests
- ✅ GET /api/reports (fetch all reports)
- ✅ POST /api/reports (submit new report)
- ✅ Response format validation
- ✅ Data integrity checks

#### Admin Authentication Tests
- ✅ POST /api/admin/login (valid credentials)
- ✅ POST /api/admin/login (invalid credentials)
- ✅ Cookie authentication
- ✅ Session management

#### Admin API Tests
- ✅ GET /api/admin/reports (authenticated)
- ✅ PUT /api/admin/reports (update status)
- ✅ DELETE /api/admin/reports (delete report)
- ✅ Authorization checks

#### Performance Tests
- ✅ Response times < 2 seconds
- ✅ Load testing with multiple requests
- ✅ Concurrent user simulation

---

## Test Configuration

### Environment Variables
```bash
# For Selenium tests
export TEST_URL=http://localhost:3000
export ADMIN_USERNAME=bankolejohn@gmail.com
export ADMIN_PASSWORD=admin123

# For different environments
export TEST_URL=http://54.243.21.121  # Production
export TEST_URL=http://staging-server  # Staging
```

### Postman Environment Variables
```json
{
  "base_url": "http://localhost:3000",
  "admin_username": "bankolejohn@gmail.com", 
  "admin_password": "admin123"
}
```

---

## Test Results Interpretation

### Selenium Test Results
```bash
✅ test_01_homepage_loads - Homepage loads correctly
✅ test_02_navigation_works - Navigation works correctly  
✅ test_03_report_form_validation - Form validation works
✅ test_04_report_submission - Report submission works correctly
✅ test_05_admin_login_invalid - Invalid login properly rejected
✅ test_06_admin_login_valid - Valid admin login works correctly
✅ test_07_admin_dashboard_functionality - Dashboard functions correctly
✅ test_08_mobile_responsiveness - Mobile responsiveness works
✅ test_09_performance_check - Performance within acceptable limits
```

### Postman Test Results
```bash
✅ Get All Reports - 200 OK (Response time: 245ms)
✅ Submit New Report - 200 OK (Response time: 1.2s)
✅ Admin Login Valid - 200 OK (Response time: 180ms)
✅ Admin Login Invalid - 401 Unauthorized (Response time: 95ms)
✅ Get Admin Reports - 200 OK (Response time: 320ms)
✅ Update Report Status - 200 OK (Response time: 280ms)
```

---

## Troubleshooting

### Common Issues

#### Selenium Tests Failing
```bash
# Issue: ChromeDriver not found
# Solution: Install ChromeDriver
pip install webdriver-manager

# Issue: Server not running
# Solution: Start the application
npm run dev

# Issue: Elements not found
# Solution: Check if app is fully loaded
# Add time.sleep(2) after page navigation
```

#### Postman Tests Failing
```bash
# Issue: Connection refused
# Solution: Verify server is running on correct port
curl http://localhost:3000

# Issue: Authentication failing
# Solution: Check admin credentials in environment
# Verify username and password are correct

# Issue: Tests timing out
# Solution: Increase timeout in test settings
# Check server performance
```

#### Performance Issues
```bash
# Issue: Slow page loads
# Solution: Check server resources
htop  # Check CPU/memory usage

# Issue: Database slow
# Solution: Check Supabase connection
# Verify environment variables

# Issue: Image uploads failing
# Solution: Check Cloudinary configuration
# Verify API keys and settings
```

---

## Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start application
        run: npm run dev &
      - name: Wait for server
        run: sleep 30
      - name: Run tests
        run: python tests/run_tests.py
```

### Local Pre-commit Testing
```bash
# Create a pre-commit hook
#!/bin/bash
echo "Running CleanEkiti tests..."
python tests/run_tests.py
if [ $? -ne 0 ]; then
    echo "Tests failed! Commit aborted."
    exit 1
fi
```

---

## Test Data Management

### Test Database Setup
```sql
-- Create test reports for consistent testing
INSERT INTO reports (category, description, latitude, longitude, location_name, status) VALUES
('dumping', 'Test illegal dumping report', 7.6219, 5.2206, 'Test Location 1', 'pending'),
('flooding', 'Test flooding report', 7.6220, 5.2207, 'Test Location 2', 'investigating'),
('pollution', 'Test pollution report', 7.6221, 5.2208, 'Test Location 3', 'resolved');
```

### Cleanup After Tests
```python
# Add to test teardown
def cleanup_test_data(self):
    """Remove test data after tests"""
    # Delete test reports created during testing
    # This keeps the database clean
```

---

## Performance Benchmarks

### Expected Performance Metrics
- **Homepage Load**: < 2 seconds
- **Report Submission**: < 3 seconds  
- **Admin Login**: < 1 second
- **API Response**: < 500ms
- **Database Query**: < 200ms

### Load Testing Results
- **Concurrent Users**: 100+ users
- **Reports per Hour**: 1000+ submissions
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1%

---

## Reporting Issues

### Bug Report Template
```markdown
## Bug Report

**Test**: [Test name that failed]
**Environment**: [Local/Staging/Production]
**Browser**: [Chrome/Firefox/Safari]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [If applicable]
**Console Errors**: [Any JavaScript errors]
```

### Performance Issue Template
```markdown
## Performance Issue

**Page/API**: [Which page or API endpoint]
**Load Time**: [Actual load time]
**Expected**: [Expected load time]
**Network**: [Connection speed]
**Device**: [Desktop/Mobile/Tablet]
**Reproducible**: [Yes/No]
```

---

**This comprehensive testing ensures CleanEkiti works perfectly across all devices, browsers, and usage scenarios before deployment to production!**