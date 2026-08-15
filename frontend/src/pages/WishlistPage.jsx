import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

// Helper function to render star ratings
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={14} />
      ))}
      {hasHalfStar && <FaStar key="half" size={14} style={{ color: '#FFC107' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaStar key={`empty-${i}`} size={14} style={{ color: '#E5E5E5' }} />
      ))}
    </>
  );
};

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process each product to filter out demo reviews
      const processedItems = (response.data || []).map(product => {
        if (product.reviews && Array.isArray(product.reviews)) {
          const realReviews = product.reviews.filter(review => 
            !review.is_demo &&
            review.rating > 0 &&
            review.rating <= 5 &&
            review.user_id !== null &&
            review.user_id !== undefined
          );
          
          if (realReviews.length > 0) {
            const avg = realReviews.reduce((sum, r) => sum + r.rating, 0) / realReviews.length;
            product.average_rating = Math.round(avg * 10) / 10;
            product.review_count = realReviews.length;
          } else {
            product.average_rating = 0;
            product.review_count = 0;
          }
          
          product.reviews = realReviews;
        } else {
          product.average_rating = 0;
          product.review_count = 0;
        }
        return product;
      });
      
      setWishlistItems(processedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (removingId) return;
    
    setRemovingId(productId);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      
      // Dispatch event to update navbar badge
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: wishlistItems.length - 1 } 
      }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return `KES ${Number(price).toLocaleString()}`;
  };

  const getDiscountPercentage = (product) => {
    if (product.compare_price && product.price) {
      const original = parseFloat(product.compare_price);
      const current = parseFloat(product.price);
      
      if (original > current && original > 0) {
        return Math.round(((original - current) / original) * 100);
      }
    }
    
    if (product.sale_percentage) {
      return parseInt(product.sale_percentage);
    }
    
    return 0;
  };

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
      '@media (max-width: 768px)': {
        padding: '1rem 0.75rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.75rem 0.5rem',
      },
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#999999',
      marginBottom: '1.5rem',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
        marginBottom: '1rem',
      },
    },
    breadcrumbLink: {
      color: '#999999',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    breadcrumbCurrent: {
      color: '#000000',
    },
    pageTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1.5rem',
      '@media (max-width: 480px)': {
        fontSize: '1.25rem',
        marginBottom: '1rem',
      },
    },
    loadingText: {
      textAlign: 'center',
      padding: '3rem 0',
      color: '#666666',
      '@media (max-width: 480px)': {
        padding: '2rem 0',
        fontSize: '0.875rem',
      },
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '3rem 0',
      '@media (max-width: 480px)': {
        padding: '2rem 0',
      },
    },
    emptyIcon: {
      fontSize: '4rem',
      color: '#E5E5E5',
      marginBottom: '1rem',
      '@media (max-width: 480px)': {
        fontSize: '3rem',
      },
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        fontSize: '1.25rem',
      },
    },
    emptyText: {
      color: '#666666',
      marginBottom: '1.5rem',
      '@media (max-width: 480px)': {
        fontSize: '0.875rem',
      },
    },
    emptyButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 480px)': {
        padding: '0.5rem 1.5rem',
        fontSize: '0.875rem',
        width: '100%',
      },
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.25rem',
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.75rem',
      },
    },
    productCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      position: 'relative',
      '@media (max-width: 768px)': {
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      },
    },
    imageContainer: {
      position: 'relative',
      backgroundColor: '#F5F5F5',
      height: '200px',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        height: '160px',
      },
      '@media (max-width: 480px)': {
        height: '140px',
      },
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    removeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      backgroundColor: '#FFFFFF',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      color: '#000000',
      '@media (max-width: 768px)': {
        width: '28px',
        height: '28px',
        fontSize: '0.75rem',
      },
      '@media (max-width: 480px)': {
        width: '24px',
        height: '24px',
        fontSize: '0.65rem',
        top: '0.3rem',
        right: '0.3rem',
      },
    },
    saleBadge: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontWeight: '600',
      '@media (max-width: 768px)': {
        fontSize: '0.65rem',
        padding: '0.2rem 0.4rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.55rem',
        padding: '0.15rem 0.35rem',
        top: '0.3rem',
        left: '0.3rem',
      },
    },
    productInfo: {
      padding: '1rem',
      '@media (max-width: 768px)': {
        padding: '0.75rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.5rem',
      },
    },
    productName: {
      fontWeight: '600',
      color: '#000000',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '0.25rem',
      fontSize: '0.95rem',
      '@media (max-width: 768px)': {
        fontSize: '0.875rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        marginBottom: '0.3rem',
      },
    },
    stars: {
      color: '#FFC107',
      display: 'flex',
      gap: '0.05rem',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    reviewCount: {
      fontSize: '0.75rem',
      color: '#999999',
      '@media (max-width: 480px)': {
        fontSize: '0.65rem',
      },
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      flexWrap: 'wrap',
      '@media (max-width: 480px)': {
        marginBottom: '0.3rem',
      },
    },
    currentPrice: {
      color: '#DB4444',
      fontWeight: '700',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
      },
    },
    originalPrice: {
      color: '#999999',
      textDecoration: 'line-through',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.7rem',
      },
    },
    addButton: {
      width: '100%',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      padding: '0.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
      fontSize: '0.875rem',
      '@media (max-width: 768px)': {
        fontSize: '0.8rem',
        padding: '0.4rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.7rem',
        padding: '0.3rem',
        gap: '0.3rem',
      },
    },
    addButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    removingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '8px',
    },
    spinner: {
      width: '30px',
      height: '30px',
      border: '3px solid #E5E5E5',
      borderTop: '3px solid #DB4444',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
  };

  const handleBreadcrumbHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleBreadcrumbLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleRemoveHover = (e) => {
    e.target.style.color = '#DB4444';
    e.target.style.backgroundColor = '#FEF2F2';
  };

  const handleRemoveLeave = (e) => {
    e.target.style.color = '#000000';
    e.target.style.backgroundColor = '#FFFFFF';
  };

  const handleAddHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleAddLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleEmptyHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleEmptyLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.breadcrumb}>
            <Link 
              to="/" 
              style={styles.breadcrumbLink}
              onMouseEnter={handleBreadcrumbHover}
              onMouseLeave={handleBreadcrumbLeave}
            >
              Home
            </Link>
            <span>/</span>
            <span style={styles.breadcrumbCurrent}>Wishlist</span>
          </div>
          <div style={styles.emptyContainer}>
            <FaHeart style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>Please Login</h2>
            <p style={styles.emptyText}>Login to view your wishlist items</p>
            <Link 
              to="/login" 
              style={styles.emptyButton}
              onMouseEnter={handleEmptyHover}
              onMouseLeave={handleEmptyLeave}
            >
              Login Now
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <Link 
            to="/" 
            style={styles.breadcrumbLink}
            onMouseEnter={handleBreadcrumbHover}
            onMouseLeave={handleBreadcrumbLeave}
          >
            Home
          </Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>Wishlist</span>
        </div>

        <h1 style={styles.pageTitle}>Wishlist ({wishlistItems.length})</h1>

        {loading ? (
          <div style={styles.loadingText}>Loading...</div>
        ) : wishlistItems.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaHeart style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
            <p style={styles.emptyText}>Start adding items you love</p>
            <Link 
              to="/shop" 
              style={styles.emptyButton}
              onMouseEnter={handleEmptyHover}
              onMouseLeave={handleEmptyLeave}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={styles.productGrid}>
            {wishlistItems.map(product => {
              const imageUrl = getImageUrl(product.images?.[0]?.image_url);
              const discountPercentage = getDiscountPercentage(product);
              const isRemoving = removingId === product.id;
              
              return (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.imageContainer}>
                    <img 
                      src={imageUrl}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/300';
                      }}
                    />
                    <button 
                      onClick={() => removeFromWishlist(product.id)}
                      style={styles.removeButton}
                      onMouseEnter={handleRemoveHover}
                      onMouseLeave={handleRemoveLeave}
                      disabled={isRemoving}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                    {discountPercentage > 0 && (
                      <span style={styles.saleBadge}>-{discountPercentage}%</span>
                    )}
                    {isRemoving && (
                      <div style={styles.removingOverlay}>
                        <div style={styles.spinner}></div>
                      </div>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <Link to={`/product/${product.slug}`} style={styles.productName}>
                      {product.name}
                    </Link>
                    <div style={styles.rating}>
                      <span style={styles.stars}>
                        {product.review_count > 0 ? (
                          renderStars(product.average_rating || 0)
                        ) : (
                          [...Array(5)].map((_, i) => (
                            <FaStar key={i} size={14} style={{ color: '#E5E5E5' }} />
                          ))
                        )}
                      </span>
                      {product.review_count > 0 && (
                        <span style={styles.reviewCount}>({product.review_count})</span>
                      )}
                    </div>
                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span style={styles.originalPrice}>{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                    <button 
                      style={{
                        ...styles.addButton,
                        ...(isRemoving ? styles.addButtonDisabled : {})
                      }}
                      onMouseEnter={handleAddHover}
                      onMouseLeave={handleAddLeave}
                      onClick={() => handleAddToCart(product)}
                      disabled={isRemoving}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default WishlistPage;