// Get the base API URL (without /api)
export const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

// Convert relative image path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle case where imagePath is an object (e.g., {url: '...'} or {path: '...'})
  if (typeof imagePath === 'object') {
    imagePath = imagePath.url || imagePath.path || imagePath.src || null;
    if (!imagePath) return null;
  }
  
  // Ensure imagePath is a string
  if (typeof imagePath !== 'string') {
    console.warn('getImageUrl received non-string:', imagePath);
    return null;
  }
  
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
