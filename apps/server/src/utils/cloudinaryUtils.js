export const extractPublicId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const relevantParts = parts.slice(uploadIndex + 2);
    const withoutExtension = relevantParts.join('/').replace(/\.[^/.]+$/, '');
    return withoutExtension;
  } catch {
    return null;
  }
};
