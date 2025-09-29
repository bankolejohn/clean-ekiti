import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Image upload timeout'))
    }, 30000) // 30 second timeout

    cloudinary.uploader.upload_stream(
      { 
        folder: 'cleanekiti-reports',
        timeout: 30000,
        resource_type: 'auto'
      },
      (error, result) => {
        clearTimeout(timeout)
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else {
          resolve(result!.secure_url)
        }
      }
    ).end(buffer)
  })
}