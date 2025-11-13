#!/usr/bin/env node

/**
 * Test Cloudinary configuration
 * Run this script to verify Cloudinary credentials are working
 * 
 * Usage: node scripts/test-cloudinary.js
 */

require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');

console.log('🔍 Testing Cloudinary Configuration\n');
console.log('=====================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('-------------------------');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');

if (cloudName) {
  console.log('  Cloud Name:', cloudName);
  console.log('  Cloud Name Length:', cloudName.length);
  console.log('  Has leading/trailing spaces:', cloudName !== cloudName.trim() ? '⚠️ YES' : '✅ No');
}

if (apiKey) {
  console.log('  API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('  API Key Length:', apiKey.length);
  console.log('  Has leading/trailing spaces:', apiKey !== apiKey.trim() ? '⚠️ YES' : '✅ No');
}

if (apiSecret) {
  console.log('  API Secret (first 10 chars):', apiSecret.substring(0, 10) + '...');
  console.log('  API Secret Length:', apiSecret.length);
  console.log('  Has leading/trailing spaces:', apiSecret !== apiSecret.trim() ? '⚠️ YES' : '✅ No');
}

console.log('\n');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing required Cloudinary credentials!\n');
  console.log('Please ensure your .env.local file contains:');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Configure Cloudinary
console.log('⚙️  Configuring Cloudinary...');
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

console.log('✅ Configuration applied\n');

// Test API connection
console.log('🔌 Testing API Connection...');
console.log('-------------------------');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ API Connection Successful!');
    console.log('Response:', result);
    console.log('\n');
    
    // Test upload capability
    console.log('📤 Testing Upload Capability...');
    console.log('-------------------------');
    
    // Create a small test image buffer (1x1 transparent PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'cleanekiti-reports',
          public_id: `test_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(testImageBuffer);
    });
  })
  .then(uploadResult => {
    console.log('✅ Upload Test Successful!');
    console.log('Uploaded to:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    console.log('\n');
    
    // Clean up test image
    console.log('🧹 Cleaning up test image...');
    return cloudinary.uploader.destroy(uploadResult.public_id);
  })
  .then(() => {
    console.log('✅ Test image deleted\n');
    console.log('=====================================');
    console.log('✅ All Tests Passed!');
    console.log('=====================================\n');
    console.log('Your Cloudinary configuration is working correctly.');
    console.log('You can now upload images from your application.\n');
  })
  .catch(error => {
    console.error('\n❌ Test Failed!');
    console.error('=====================================');
    console.error('Error:', error.message);
    
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    
    if (error.http_code === 401 || error.http_code === 403) {
      console.error('\n⚠️  Authentication Error:');
      console.error('Your Cloudinary credentials are incorrect.');
      console.error('Please verify:');
      console.error('1. Cloud Name is correct');
      console.error('2. API Key is correct');
      console.error('3. API Secret is correct');
      console.error('4. No extra spaces in credentials');
    } else if (error.http_code === 500) {
      console.error('\n⚠️  Server Error:');
      console.error('Cloudinary server returned an error.');
      console.error('This usually means invalid credentials or configuration.');
    }
    
    console.error('\nFull error details:');
    console.error(error);
    console.error('\n');
    process.exit(1);
  });
