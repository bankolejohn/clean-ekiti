#!/usr/bin/env python3
"""
CleanEkiti Test Runner
Runs comprehensive tests for the CleanEkiti platform
"""

import os
import sys
import subprocess
import time

# Check for required packages
try:
    import requests
except ImportError:
    print("❌ Missing required package: requests")
    print("💡 Install with: pip install requests")
    sys.exit(1)

# Selenium is optional for basic API testing
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except ImportError:
    print("⚠️ Selenium not available - Selenium tests will be skipped")
    print("💡 Install with: pip install selenium webdriver-manager")
    SELENIUM_AVAILABLE = False

class TestRunner:
    def __init__(self):
        self.base_url = os.getenv('TEST_URL', 'http://localhost:3000')
        self.test_results = []
    
    def check_server_availability(self):
        """Check if the server is running"""
        print(f"🔍 Checking server availability at {self.base_url}...")
        
        try:
            response = requests.get(self.base_url, timeout=10)
            if response.status_code == 200:
                print("✅ Server is running and accessible")
                return True
            else:
                print(f"❌ Server returned status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Server is not accessible: {e}")
            print("💡 Make sure to start the application with 'npm run dev' first")
            return False
    
    def setup_chrome_driver(self):
        """Set up Chrome WebDriver"""
        if not SELENIUM_AVAILABLE:
            print("⚠️ Selenium not available - skipping Chrome setup")
            return False
            
        print("🔧 Setting up Chrome WebDriver...")
        
        try:
            # Install ChromeDriver automatically
            service = Service(ChromeDriverManager().install())
            
            # Configure Chrome options
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            # Remove --headless to see the browser in action
            # chrome_options.add_argument("--headless")
            
            driver = webdriver.Chrome(service=service, options=chrome_options)
            print("✅ Chrome WebDriver setup successful")
            driver.quit()  # Just testing setup
            return True
            
        except Exception as e:
            print(f"❌ Chrome WebDriver setup failed: {e}")
            print("💡 Make sure Chrome browser is installed")
            return False
    
    def run_selenium_tests(self):
        """Run Selenium end-to-end tests"""
        print("\n🧪 Running Selenium Tests...")
        print("=" * 50)
        
        try:
            # Set environment variables for tests
            env = os.environ.copy()
            env['TEST_URL'] = self.base_url
            
            # Run the test file
            result = subprocess.run([
                sys.executable, 
                'tests/selenium/test_cleanekiti.py'
            ], capture_output=True, text=True, env=env)
            
            print(result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
            
            if result.returncode == 0:
                print("✅ All Selenium tests passed!")
                self.test_results.append(("Selenium Tests", "PASSED"))
                return True
            else:
                print("❌ Some Selenium tests failed")
                self.test_results.append(("Selenium Tests", "FAILED"))
                return False
                
        except Exception as e:
            print(f"❌ Error running Selenium tests: {e}")
            self.test_results.append(("Selenium Tests", "ERROR"))
            return False
    
    def run_api_tests(self):
        """Run API tests using requests library"""
        print("\n🔌 Running API Tests...")
        print("=" * 50)
        
        try:
            # Test public API endpoints
            print("Testing public endpoints...")
            
            # Test GET /api/reports
            response = requests.get(f"{self.base_url}/api/reports")
            if response.status_code == 200:
                print("✅ GET /api/reports - OK")
                data = response.json()
                if 'reports' in data:
                    print(f"   Found {len(data['reports'])} reports")
            else:
                print(f"❌ GET /api/reports - Failed ({response.status_code})")
            
            # Test POST /api/reports (report submission)
            test_report = {
                'category': 'dumping',
                'description': 'Test report from automated testing',
                'latitude': '7.6219',
                'longitude': '5.2206',
                'location_name': 'Test Location, Ado-Ekiti',
                'reporter_email': 'test@automation.com'
            }
            
            response = requests.post(f"{self.base_url}/api/reports", data=test_report)
            if response.status_code == 200:
                print("✅ POST /api/reports - OK")
                report_data = response.json()
                if 'report' in report_data:
                    print(f"   Created report with ID: {report_data['report']['id']}")
            else:
                print(f"❌ POST /api/reports - Failed ({response.status_code})")
            
            # Test admin login
            print("Testing admin endpoints...")
            
            login_data = {
                'username': 'bankolejohn@gmail.com',
                'password': 'admin123'
            }
            
            session = requests.Session()
            response = session.post(f"{self.base_url}/api/admin/login", json=login_data)
            
            if response.status_code == 200:
                print("✅ POST /api/admin/login - OK")
                
                # Test admin reports endpoint
                response = session.get(f"{self.base_url}/api/admin/reports")
                if response.status_code == 200:
                    print("✅ GET /api/admin/reports - OK")
                    data = response.json()
                    if 'reports' in data and 'stats' in data:
                        print(f"   Found {len(data['reports'])} reports with statistics")
                else:
                    print(f"❌ GET /api/admin/reports - Failed ({response.status_code})")
            else:
                print(f"❌ POST /api/admin/login - Failed ({response.status_code})")
            
            print("✅ API tests completed")
            self.test_results.append(("API Tests", "PASSED"))
            return True
            
        except Exception as e:
            print(f"❌ Error running API tests: {e}")
            self.test_results.append(("API Tests", "ERROR"))
            return False
    
    def run_performance_tests(self):
        """Run basic performance tests"""
        print("\n⚡ Running Performance Tests...")
        print("=" * 50)
        
        try:
            # Test page load times
            pages_to_test = [
                ('Homepage', '/'),
                ('Report Page', '/report'),
                ('Map Page', '/map'),
                ('Admin Login', '/admin/login')
            ]
            
            all_passed = True
            
            for page_name, path in pages_to_test:
                start_time = time.time()
                response = requests.get(f"{self.base_url}{path}")
                load_time = time.time() - start_time
                
                if response.status_code == 200 and load_time < 3.0:
                    print(f"✅ {page_name}: {load_time:.2f}s")
                else:
                    print(f"❌ {page_name}: {load_time:.2f}s (Status: {response.status_code})")
                    all_passed = False
            
            # Test API response times
            start_time = time.time()
            response = requests.get(f"{self.base_url}/api/reports")
            api_time = time.time() - start_time
            
            if response.status_code == 200 and api_time < 2.0:
                print(f"✅ API Response Time: {api_time:.2f}s")
            else:
                print(f"❌ API Response Time: {api_time:.2f}s")
                all_passed = False
            
            if all_passed:
                print("✅ All performance tests passed")
                self.test_results.append(("Performance Tests", "PASSED"))
            else:
                print("⚠️ Some performance tests failed")
                self.test_results.append(("Performance Tests", "WARNING"))
            
            return all_passed
            
        except Exception as e:
            print(f"❌ Error running performance tests: {e}")
            self.test_results.append(("Performance Tests", "ERROR"))
            return False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        for test_name, result in self.test_results:
            status_icon = {
                "PASSED": "✅",
                "FAILED": "❌", 
                "WARNING": "⚠️",
                "ERROR": "💥"
            }.get(result, "❓")
            
            print(f"{status_icon} {test_name}: {result}")
        
        passed_tests = sum(1 for _, result in self.test_results if result == "PASSED")
        total_tests = len(self.test_results)
        
        print(f"\nResults: {passed_tests}/{total_tests} test suites passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! CleanEkiti is working perfectly!")
        else:
            print("🔧 Some tests failed. Please check the issues above.")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 CleanEkiti Comprehensive Test Suite")
        print("=" * 60)
        
        # Check prerequisites
        if not self.check_server_availability():
            print("\n❌ Cannot run tests - server is not available")
            return False
        
        if not self.setup_chrome_driver():
            print("\n❌ Cannot run Selenium tests - Chrome setup failed")
            print("📝 API and Performance tests will still run...")
        
        # Run test suites
        self.run_api_tests()
        self.run_performance_tests()
        
        # Only run Selenium if available and Chrome is set up
        if SELENIUM_AVAILABLE:
            try:
                self.run_selenium_tests()
            except Exception as e:
                print(f"⚠️ Selenium tests failed: {e}")
                self.test_results.append(("Selenium Tests", "FAILED"))
        else:
            print("⚠️ Skipping Selenium tests - Selenium not installed")
            self.test_results.append(("Selenium Tests", "SKIPPED"))
        
        # Print summary
        self.print_summary()
        
        return True

if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all_tests()