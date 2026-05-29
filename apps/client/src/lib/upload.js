import { fetchWithAuth } from './api.js';

export const uploadImage = async (file, type) => {
  const sigRes = await fetchWithAuth(`/api/upload/signature?type=${type}`);
  if (!sigRes.ok) throw new Error('Failed to get upload signature');

  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('api_key', apiKey);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadRes.ok) throw new Error('Failed to upload image');

  const data = await uploadRes.json();
  return data.secure_url;
};
