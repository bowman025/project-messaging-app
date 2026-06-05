import { fetchWithAuth } from './api.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE_MB = 5;

export const uploadImage = async (file, type) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP and GIF images are allowed');
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be smaller than ${MAX_SIZE_MB}MB`);
  }

  const sigRes = await fetchWithAuth(`/api/upload/signature?type=${type}`);
  if (!sigRes.ok) throw new Error('Failed to get upload signature');

  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('allowed_formats', 'jpg,jpeg,png,webp,gif,avif');
  formData.append('api_key', apiKey);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) throw new Error('Failed to upload image');

  const data = await uploadRes.json();
  return data.secure_url;
};
