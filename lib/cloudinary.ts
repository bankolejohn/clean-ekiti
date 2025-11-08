/**
 * Cloudinary integration with enhanced security and error handling
 */

import { v2 as cloudinary } from 'cloudinary';
import { FileUploadError } from './errors';
import { validateFile } from './validation';

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY environment variable is required');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET environment variable is required');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
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
  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new FileUploadError(validation.error);
  }

  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new FileUploadError('Image upload timeout'));
      }, UPLOAD_CONFIG.timeout);

      cloudinary.uploader.upload_stream(
        {
          ...UPLOAD_CONFIG,
          // Add timestamp to filename for uniqueness
          public_id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        },
        (error, result) => {
          clearTimeout(timeout);
          
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new FileUploadError(`Upload failed: ${error.message}`));
          } else if (result) {
            resolve(result);
          } else {
            reject(new FileUploadError('Upload failed: No result returned'));
          }
        }
      ).end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error instanceof FileUploadError) {
      throw error;
    }
    
    throw new FileUploadError('Failed to upload image');
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