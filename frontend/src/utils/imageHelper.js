// Image URL helper - points to backend server
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/api/placeholder/300/300';
  }
  
  // If it's already a full URL with http
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads/
  if (imagePath.startsWith('/uploads/')) {
    // Use the backend URL (port 5000), not the frontend (port 5173)
    return `http://localhost:5000${imagePath}`;
  }
  
  // If it's just a filename
  if (!imagePath.startsWith('/')) {
    return `http://localhost:5000/uploads/products/${imagePath}`;
  }
  
  return '/api/placeholder/300/300';
};