const cloudinary = require('cloudinary').v2;
const config = require('../config/env');

const initCloudinary = () => {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
};

const uploadImage = async (fileBuffer, folderPath, publicId = null) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `castglo/${folderPath}`,
          public_id: publicId,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              url: result.secure_url,
              cloudinaryId: result.public_id,
              width: result.width,
              height: result.height,
            });
        }
      );

      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

const uploadVideo = async (fileBuffer, folderPath, publicId = null) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `castglo/${folderPath}`,
          public_id: publicId,
          resource_type: 'video',
          video_sampling: 5,
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              url: result.secure_url,
              cloudinaryId: result.public_id,
              duration: result.duration,
              format: result.format,
            });
        }
      );

      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

const deleteAsset = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete asset: ${error.message}`);
  }
};

const getAssetUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
      ...options,
    });
  } catch (error) {
    throw new Error(`Failed to generate asset URL: ${error.message}`);
  }
};

const generateThumbnail = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      width: 400,
      height: 300,
      crop: 'fill',
      fetch_format: 'auto',
      quality: 'auto',
      ...options,
    });
  } catch (error) {
    throw new Error(`Failed to generate thumbnail: ${error.message}`);
  }
};

module.exports = {
  initCloudinary,
  uploadImage,
  uploadVideo,
  deleteAsset,
  getAssetUrl,
  generateThumbnail,
};
