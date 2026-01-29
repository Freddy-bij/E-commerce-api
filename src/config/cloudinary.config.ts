import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate and extract environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if all required variables are present
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    '❌ Missing Cloudinary credentials!\n' +
    'Please add these to your .env file:\n' +
    '  CLOUDINARY_CLOUD_NAME=your_cloud_name\n' +
    '  CLOUDINARY_API_KEY=your_api_key\n' +
    '  CLOUDINARY_API_SECRET=your_api_secret\n\n' +
    'Get your credentials from: https://cloudinary.com/console'
  );
}

// Configure Cloudinary with validated credentials
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Log successful configuration
console.log('✅ Cloudinary configured successfully');
console.log('   Cloud Name:', cloudName);

export default cloudinary;