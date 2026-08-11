// Image URL helper
const BACKEND_URL = import.meta.env.VITE_API_URL;

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder.jpg';
  }

  // Already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Image path from the backend
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }

  // Just a filename
  if (!imagePath.startsWith('/')) {
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  }

  return '/placeholder.jpg';
};
