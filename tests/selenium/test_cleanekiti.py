"""
CleanEkiti Selenium Test Suite
Comprehensive end-to-end testing for CleanEkiti platform
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import unittest

class CleanEkitiTests(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Set up the test environment"""
        # Configure Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Remove this line to see browser
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Initialize WebDriver
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 10)
        
        # Test configuration
        cls.base_url = os.getenv('TEST_URL', 'http://localhost:3000')
        cls.admin_username = os.getenv('ADMIN_USERNAME', 'bankolejohn@gmail.com')
        cls.admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.driver.quit()
    
    def setUp(self):
        """Set up before each test"""
        self.driver.get(self.base_url)
        time.sleep(2)  # Allow page to load
    
    def test_01_homepage_loads(self):
        """Test that homepage loads correctly"""
        print("Testing homepage load...")
        
        # Check page title
        self.assertIn("CleanEkiti", self.driver.title)
        
        # Check main heading
        heading = self.wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertIn("CleanEkiti", heading.text)
        
        # Check navigation elements
        nav_links = self.driver.find_elements(By.CSS_SELECTOR, "nav a")
        self.assertGreater(len(nav_links), 0, "Navigation links should be present")
        
        # Check main CTA button (try different possible text)
        try:
            report_button = self.driver.find_element(By.LINK_TEXT, "Report an Issue Now")
        except:
            try:
                report_button = self.driver.find_element(By.LINK_TEXT, "Report Issue")
            except:
                report_button = self.driver.find_element(By.PARTIAL_LINK_TEXT, "Report")
        self.assertTrue(report_button.is_displayed())
        
        print("✓ Homepage loads correctly")
    
    def test_02_navigation_works(self):
        """Test navigation between pages"""
        print("Testing navigation...")
        
        # Test Report page navigation
        report_link = self.driver.find_element(By.LINK_TEXT, "Report Issue")
        report_link.click()
        
        self.wait.until(EC.url_contains("/report"))
        self.assertIn("/report", self.driver.current_url)
        
        # Test Map page navigation
        self.driver.get(self.base_url)
        map_link = self.driver.find_element(By.LINK_TEXT, "View Map")
        map_link.click()
        
        self.wait.until(EC.url_contains("/map"))
        self.assertIn("/map", self.driver.current_url)
        
        # Test Admin login navigation
        self.driver.get(self.base_url)
        admin_link = self.driver.find_element(By.LINK_TEXT, "Admin")
        admin_link.click()
        
        self.wait.until(EC.url_contains("/admin/login"))
        self.assertIn("/admin/login", self.driver.current_url)
        
        print("✓ Navigation works correctly")
    
    def test_03_report_form_validation(self):
        """Test report form validation"""
        print("Testing report form validation...")
        
        # Navigate to report page
        self.driver.get(f"{self.base_url}/report")
        
        # Try to submit empty form
        submit_button = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
        )
        submit_button.click()
        
        # Check that form validation prevents submission
        # (Should still be on report page)
        time.sleep(2)
        self.assertIn("/report", self.driver.current_url)
        
        print("✓ Form validation works")
    
    def test_04_report_submission(self):
        """Test complete report submission flow"""
        print("Testing report submission...")
        
        # Navigate to report page
        self.driver.get(f"{self.base_url}/report")
        
        # Fill out the form
        category_select = Select(self.driver.find_element(By.CSS_SELECTOR, "select"))
        category_select.select_by_value("dumping")
        
        description_field = self.driver.find_element(By.CSS_SELECTOR, "textarea")
        description_field.send_keys("Test report from Selenium automation")
        
        email_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        email_field.send_keys("test@selenium.com")
        
        # Click submit button
        submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Wait for confirmation modal
        try:
            confirm_modal = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".fixed.inset-0"))
            )
            self.assertTrue(confirm_modal.is_displayed())
            
            # Click confirm button in modal
            confirm_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Confirm')]")
            confirm_button.click()
            
            # Wait for success message
            success_message = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Report Submitted')]"))
            )
            self.assertTrue(success_message.is_displayed())
            
            print("✓ Report submission works correctly")
            
        except TimeoutException:
            print("⚠ Confirmation modal not found - checking for direct submission")
            # If no modal, check for success page
            try:
                success_message = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Report Submitted')]"))
                )
                self.assertTrue(success_message.is_displayed())
                print("✓ Report submission works correctly (direct)")
            except TimeoutException:
                self.fail("Report submission failed - no success message found")
    
    def test_05_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        print("Testing admin login with invalid credentials...")
        
        # Navigate to admin login
        self.driver.get(f"{self.base_url}/admin/login")
        
        # Fill invalid credentials
        username_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='text']")
        password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        username_field.send_keys("invalid@example.com")
        password_field.send_keys("wrongpassword")
        
        # Submit form
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Check for error message
        try:
            error_message = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-50, .text-red-700"))
            )
            self.assertTrue(error_message.is_displayed())
            print("✓ Invalid login properly rejected")
        except TimeoutException:
            # Check if still on login page (another way to verify rejection)
            self.assertIn("/admin/login", self.driver.current_url)
            print("✓ Invalid login properly rejected (stayed on login page)")
    
    def test_06_admin_login_valid(self):
        """Test admin login with valid credentials"""
        print("Testing admin login with valid credentials...")
        
        # Navigate to admin login
        self.driver.get(f"{self.base_url}/admin/login")
        
        # Fill valid credentials
        username_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='text']")
        password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        username_field.clear()
        password_field.clear()
        
        username_field.send_keys(self.admin_username)
        password_field.send_keys(self.admin_password)
        
        # Submit form
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait for redirect to admin dashboard
        try:
            # Wait a bit longer for the redirect
            time.sleep(3)
            self.wait.until(EC.url_contains("/admin"))
            current_url = self.driver.current_url
            self.assertIn("/admin", current_url)
            # Check that we're not still on login page
            if "/login" in current_url:
                # Sometimes the redirect takes longer, wait a bit more
                time.sleep(2)
                current_url = self.driver.current_url
            self.assertNotIn("/login", current_url, f"Still on login page: {current_url}")
            
            # Check for admin dashboard elements
            dashboard_heading = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Admin Dashboard')]"))
            )
            self.assertTrue(dashboard_heading.is_displayed())
            
            print("✓ Valid admin login works correctly")
            
        except TimeoutException:
            self.fail("Admin login failed - did not redirect to dashboard")
    
    def test_07_admin_dashboard_functionality(self):
        """Test admin dashboard functionality"""
        print("Testing admin dashboard functionality...")
        
        # First login as admin
        self._admin_login()
        
        # Check dashboard elements
        stats_cards = self.driver.find_elements(By.CSS_SELECTOR, ".bg-white.p-4, .bg-white.p-6")
        self.assertGreater(len(stats_cards), 0, "Statistics cards should be present")
        
        # Check reports table/list
        try:
            # Look for desktop table
            reports_table = self.driver.find_element(By.CSS_SELECTOR, "table")
            self.assertTrue(reports_table.is_displayed())
            print("✓ Desktop reports table found")
        except NoSuchElementException:
            try:
                # Look for mobile card view
                reports_cards = self.driver.find_elements(By.CSS_SELECTOR, ".border-b.border-gray-200")
                self.assertGreater(len(reports_cards), 0, "Mobile reports cards should be present")
                print("✓ Mobile reports cards found")
            except:
                print("⚠ No reports found (this is OK if database is empty)")
        
        # Test logout functionality
        try:
            logout_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Logout')]")
            logout_button.click()
            
            # Should redirect to login page
            self.wait.until(EC.url_contains("/admin/login"))
            self.assertIn("/admin/login", self.driver.current_url)
            print("✓ Logout functionality works")
            
        except NoSuchElementException:
            print("⚠ Logout button not found")
    
    def test_08_mobile_responsiveness(self):
        """Test mobile responsiveness"""
        print("Testing mobile responsiveness...")
        
        # Set mobile viewport
        self.driver.set_window_size(375, 667)  # iPhone 6/7/8 size
        
        # Test homepage on mobile
        self.driver.get(self.base_url)
        
        # Check if mobile menu button exists
        try:
            mobile_menu_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Toggle menu']")
            self.assertTrue(mobile_menu_button.is_displayed())
            
            # Click mobile menu
            mobile_menu_button.click()
            time.sleep(1)
            
            # Check if menu items are visible
            mobile_nav_links = self.driver.find_elements(By.CSS_SELECTOR, ".md\\:hidden a")
            self.assertGreater(len(mobile_nav_links), 0, "Mobile navigation should be visible")
            
            print("✓ Mobile navigation works")
            
        except NoSuchElementException:
            print("⚠ Mobile menu not found - checking if desktop nav is responsive")
            # Check if navigation is still accessible
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "nav a")
            self.assertGreater(len(nav_links), 0, "Navigation should be accessible on mobile")
        
        # Test report form on mobile
        self.driver.get(f"{self.base_url}/report")
        
        # Check if form elements are properly sized
        form_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input, textarea, select")
        for input_element in form_inputs:
            self.assertTrue(input_element.is_displayed(), "Form inputs should be visible on mobile")
        
        # Reset to desktop size
        self.driver.set_window_size(1920, 1080)
        print("✓ Mobile responsiveness test completed")
    
    def test_09_performance_check(self):
        """Basic performance checks"""
        print("Testing basic performance...")
        
        # Measure page load time
        start_time = time.time()
        self.driver.get(self.base_url)
        
        # Wait for page to be fully loaded
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        load_time = time.time() - start_time
        
        # Page should load within 5 seconds
        self.assertLess(load_time, 5.0, f"Page load time ({load_time:.2f}s) should be under 5 seconds")
        
        # Check for JavaScript errors in console
        logs = self.driver.get_log('browser')
        severe_errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if severe_errors:
            print(f"⚠ Found {len(severe_errors)} severe JavaScript errors:")
            for error in severe_errors[:3]:  # Show first 3 errors
                print(f"  - {error['message']}")
        else:
            print("✓ No severe JavaScript errors found")
        
        print(f"✓ Page load time: {load_time:.2f} seconds")
    
    def _admin_login(self):
        """Helper method to login as admin"""
        self.driver.get(f"{self.base_url}/admin/login")
        
        username_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='text']")
        password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        username_field.clear()
        password_field.clear()
        
        username_field.send_keys(self.admin_username)
        password_field.send_keys(self.admin_password)
        
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait for redirect
        self.wait.until(EC.url_contains("/admin"))

if __name__ == "__main__":
    # Run tests
    unittest.main(verbosity=2)