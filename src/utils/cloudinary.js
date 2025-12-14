const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath, folderPath) {
  if (!localFilePath) return null;

  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: folderPath,
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
}

module.exports = uploadOnCloudinary;
