import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaStar, FaHeart } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return `KES ${Number(price).toLocaleString()}`;
  };

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#999999',
      marginBottom: '1.5rem',
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
    },
    loadingText: {
      textAlign: 'center',
      padding: '3rem 0',
      color: '#666666',
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '3rem 0',
    },
    emptyIcon: {
      fontSize: '4rem',
      color: '#E5E5E5',
      marginBottom: '1rem',
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    emptyText: {
      color: '#666666',
      marginBottom: '1.5rem',
    },
    emptyButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
    },
    productCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    },
    imageContainer: {
      position: 'relative',
      backgroundColor: '#F5F5F5',
      height: '200px',
      overflow: 'hidden',
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
    },
    productInfo: {
      padding: '1rem',
    },
    productName: {
      fontWeight: '600',
      color: '#000000',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '0.25rem',
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginBottom: '0.5rem',
    },
    stars: {
      color: '#FFC107',
    },
    reviewCount: {
      fontSize: '0.75rem',
      color: '#999999',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    },
    currentPrice: {
      color: '#DB4444',
      fontWeight: '700',
    },
    originalPrice: {
      color: '#999999',
      textDecoration: 'line-through',
      fontSize: '0.875rem',
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
                    >
                      <FaTrash />
                    </button>
                    {product.is_on_sale && (
                      <span style={styles.saleBadge}>-{product.sale_percentage || 20}%</span>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <Link to={`/product/${product.slug}`} style={styles.productName}>
                      {product.name}
                    </Link>
                    <div style={styles.rating}>
                      <span style={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={14} />
                        ))}
                      </span>
                      <span style={styles.reviewCount}>(88)</span>
                    </div>
                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span style={styles.originalPrice}>{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                    <button 
                      style={styles.addButton}
                      onMouseEnter={handleAddHover}
                      onMouseLeave={handleAddLeave}
                      onClick={() => handleAddToCart(product)}
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
    </div>
  );
};

export default WishlistPage;