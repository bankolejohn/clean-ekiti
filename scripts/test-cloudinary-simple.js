#!/usr/bin/env node

/**
 * Simple Cloudinary test without external dependencies
 * Run this to verify Cloudinary credentials work
 */

const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Cloudinary Configuration\n');
console.log('=====================================\n');

// Read .env.local file manually
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const cloudName = envVars.CLOUDINARY_CLOUD_NAME;
const apiKey = envVars.CLOUDINARY_API_KEY;
const apiSecret = envVars.CLOUDINARY_API_SECRET;

console.log('📋 Environment Variables:');
console.log('-------------------------');
console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
console.log('');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing required Cloudinary credentials!\n');
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
      console.error('\nPlease verify:');
      console.error('1. Cloud Name:', cloudName);
      console.error('2. API Key:', apiKey);
      console.error('3. API Secret: (hidden)');
      console.error('\nDouble-check these values in your Cloudinary dashboard:');
      console.error('https://cloudinary.com/console');
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
