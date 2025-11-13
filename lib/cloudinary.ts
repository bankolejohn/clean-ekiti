/**
 * Cloudinary integration with enhanced security and error handling
 */

import { v2 as cloudinary } from 'cloudinary';
import { FileUploadError } from './errors';
import { validateFile } from './validation';

// Validate and sanitize environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName) {
  throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required');
}

if (!apiKey) {
  throw new Error('CLOUDINARY_API_KEY environment variable is required');
}

if (!apiSecret) {
  throw new Error('CLOUDINARY_API_SECRET environment variable is required');
}

// Validate format (basic check)
if (cloudName.includes(' ') || apiKey.includes(' ') || apiSecret.includes(' ')) {
  console.error('Cloudinary credentials contain spaces - this will cause authentication errors');
  throw new Error('Invalid Cloudinary credentials format - credentials contain spaces');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // Always use HTTPS
});

console.log('Cloudinary configured successfully:', {
  cloud_name: cloudName,
  api_key_length: apiKey.length,
  api_secret_length: apiSecret.length
});

/**
 * Upload configuration
 */
const UPLOAD_CONFIG = {
  folder: 'cleanekiti-reports',
  resource_type: 'image' as const,
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  max_bytes: 10 * 1024 * 1024, // 10MB
  quality: 'auto:good',
  fetch_format: 'auto',
  flags: 'sanitize', // Remove potentially harmful content
  timeout: 30000, // 30 second timeout
};

/**
 * Upload image to Cloudinary with validation and security
 */
export async function uploadImage(file: File): Promise<string> {
  console.log('uploadImage called with file:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    console.error('File validation failed in uploadImage:', validation.error);
    throw new FileUploadError(validation.error);
  }

  // Check Cloudinary configuration
  console.log('Cloudinary config check:', {
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '...'
  });

  try {
    // Convert file to buffer
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer created, size:', buffer.length);

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload stream...');
    const result = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('Upload timeout after', UPLOAD_CONFIG.timeout, 'ms');
        reject(new FileUploadError('Image upload timeout'));
      }, UPLOAD_CONFIG.timeout);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...UPLOAD_CONFIG,
          // Add timestamp to filename for uniqueness
          public_id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        },
        (error, result) => {
          clearTimeout(timeout);
          
          if (error) {
            console.error('Cloudinary upload stream error:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              error: error
            });
            
            // Provide more specific error messages
            let errorMessage = error.message;
            if (error.http_code === 401 || error.http_code === 403) {
              errorMessage = 'Authentication failed. Please check Cloudinary credentials.';
            } else if (error.http_code === 500) {
              errorMessage = 'Cloudinary server error. Please check your credentials and try again.';
            } else if (error.message?.includes('Invalid JSON')) {
              errorMessage = 'Invalid Cloudinary configuration. Please verify your credentials.';
            }
            
            reject(new FileUploadError(errorMessage));
          } else if (result) {
            console.log('Upload successful:', {
              url: result.secure_url,
              public_id: result.public_id
            });
            resolve(result);
          } else {
            console.error('No error but no result returned');
            reject(new FileUploadError('Upload failed: No result returned'));
          }
        }
      );

      console.log('Writing buffer to upload stream...');
      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Image upload error caught:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof FileUploadError) {
      throw error;
    }
    
    throw new FileUploadError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      console.warn(`Failed to delete image ${publicId}:`, result);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error as this is not critical
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  let transformation = `q_${quality},f_${format}`;
  
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}