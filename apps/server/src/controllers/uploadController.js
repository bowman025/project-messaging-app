import cloudinary from '../config/cloudinary.js';

const FOLDERS = {
  avatar: 'messaging-app/avatars',
  message: 'messaging-app/messages',
};

const ALLOWED_TYPES = ['avatar', 'message'];

export const getUploadSignature = (req, res) => {
  const { type } = req.query;

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ status: 'error', message: 'Invalid upload type' });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = FOLDERS[type];

  const paramsToSign = {
    folder,
    timestamp,
    allowed_formats: 'jpg,jpeg,png,webp,gif',
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    status: 'success',
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
};
