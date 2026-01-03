// Get the base API URL (without /api)
export const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

// Convert relative image path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = getBaseUrl();
  // Ensure proper path joining (avoid double slashes)
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

export default {
  getBaseUrl,
  getImageUrl
};
