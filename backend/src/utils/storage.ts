import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simple implementation of creating URLs for file access
 * In production, you would integrate with cloud storage like S3
 */
export async function createPresignedUrl(filePath: string, contentType: string): Promise<string> {
  // In a real implementation, this would generate a signed URL to S3 or other cloud storage
  // For this example, we'll just create a path-based URL
  const fileName = path.basename(filePath);
  
  // In a real implementation, you might use something like:
  // return await s3.getSignedUrlPromise('getObject', {
  //   Bucket: 'your-bucket-name',
  //   Key: fileName,
  //   Expires: 3600,
  //   ContentType: contentType
  // });
  
  // Simplified URL generation for local development
  return `/api/uploads/${contentType.startsWith('audio') ? 'audio' : 'video'}/${fileName}`;
}

/**
 * Save a base64 encoded file
 * @param base64Data Base64 encoded data
 * @param fileType File type (audio or video)
 */
export function saveBase64File(base64Data: string, fileType: 'audio' | 'video'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Remove data URL prefix if present
      const base64Content = base64Data.includes('base64,') 
        ? base64Data.split('base64,')[1] 
        : base64Data;
      
      // Decode the base64 content
      const fileBuffer = Buffer.from(base64Content, 'base64');
      
      // Determine file extension
      let extension = '.webm';
      if (fileType === 'video') {
        extension = '.webm';
      } else if (fileType === 'audio') {
        extension = '.webm';
      }
      
      // Generate a unique filename
      const fileName = `${uuidv4()}${extension}`;
      
      // Determine the directory
      const uploadDir = path.join(__dirname, '../../uploads', fileType);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Full path for the file
      const filePath = path.join(uploadDir, fileName);
      
      // Write the file
      fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get the absolute path for a file
 * @param fileName File name
 * @param fileType File type (audio or video)
 */
export function getFilePath(fileName: string, fileType: 'audio' | 'video'): string {
  return path.join(__dirname, '../../uploads', fileType, fileName);
}

/**
 * Check if a file exists
 * @param filePath Path to the file
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Delete a file
 * @param filePath Path to the file
 */
export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}