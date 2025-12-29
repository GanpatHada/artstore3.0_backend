const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath, folderPath, publicId) {
  if (!localFilePath) return null;

  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: folderPath,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return null;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}

module.exports = uploadOnCloudinary;
