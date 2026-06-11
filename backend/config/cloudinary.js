import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
const uploadOnCloudinary=async (filePath)=>{
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME, 
    api_key:process.env.API_KEY, 
    api_secret: process.env.API_SECRET
})
try {
    // Check if credentials are placeholders (not configured)
    if (!process.env.CLOUD_NAME || process.env.CLOUD_NAME.includes('your_')) {
        console.log('[CLOUDINARY] Credentials not configured, skipping upload');
        fs.unlinkSync(filePath);
        return null; // Return null instead of throwing error
    }
    const uploadResult = await cloudinary.uploader.upload(filePath) 
    fs.unlinkSync(filePath)
    return uploadResult.secure_url

} catch (error) {
    fs.unlinkSync(filePath)
    console.log('[CLOUDINARY ERROR]', error.message)
    return null; // Return null on error instead of throwing
}
}

export default uploadOnCloudinary