const { v2 : cloudinary }=require("cloudinary");
const fs=require("fs")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFile) {
  if (!localFile) return null;
  try {
    const uploadResult = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });
    console.log('file has been uploaded on cloudinary',uploadResult.url);
    return uploadResult.url;
  } catch (error) {
    fs.unlinkSync(localFile);
    return null
  }
}

module.exports = uploadOnCloudinary;
