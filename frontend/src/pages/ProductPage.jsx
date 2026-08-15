import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaHeart, FaShare, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [mainImage, setMainImage] = useState('/api/placeholder/600/600');
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
    // Reset image loaded state when product changes
    setImageLoaded(false);
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${slug}`);
      const productData = response.data;
      
      // Filter out demo reviews and recalculate ratings
      if (productData.reviews && Array.isArray(productData.reviews)) {
        const realReviews = productData.reviews.filter(review => 
          !review.is_demo && // If there's a flag for demo reviews
          review.rating > 0 &&
          review.rating <= 5 &&
          review.user_id !== null && // Demo reviews might have null user_id
          review.user_id !== undefined
        );
        
        // Recalculate ratings based on real reviews only
        if (realReviews.length > 0) {
          const avg = realReviews.reduce((sum, r) => sum + r.rating, 0) / realReviews.length;
          productData.average_rating = Math.round(avg * 10) / 10;
          productData.review_count = realReviews.length;
        } else {
          productData.average_rating = 0;
          productData.review_count = 0;
        }
        
        // Replace reviews with filtered ones
        productData.reviews = realReviews;
      } else {
        // If no reviews array exists, ensure ratings are 0
        productData.average_rating = 0;
        productData.review_count = 0;
      }
      
      setProduct(productData);
      const firstImage = productData.images?.[0]?.image_url || '/api/placeholder/600/600';
      setMainImage(firstImage);
      if (productData.color_options?.length > 0) {
        setSelectedColor(productData.color_options[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = useCallback((price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  }, []);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  }, [product, quantity, addToCart]);

  // Memoized image URL
  const mainImageUrl = useMemo(() => {
    return getImageUrl(mainImage);
  }, [mainImage]);

  // Memoized thumbnail URLs
  const thumbnails = useMemo(() => {
    const images = product?.images?.length > 0 ? product.images : [{ image_url: '/api/placeholder/600/600' }];
    return images.slice(0, 4).map(img => ({
      ...img,
      url: getImageUrl(img.image_url)
    }));
  }, [product]);

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '3rem 0',
    },
    loadingText: {
      color: '#666666',
    },
    notFoundContainer: {
      textAlign: 'center',
      padding: '3rem 0',
    },
    notFoundTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    notFoundLink: {
      color: '#DB4444',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
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
    productLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
    },
    imageSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      backgroundColor: '#F5F5F5',
      borderRadius: '8px',
      overflow: 'hidden',
      minHeight: '300px',
    },
    mainImageStyle: {
      width: '100%',
      height: 'auto',
      maxHeight: '500px',
      objectFit: 'cover',
      transition: 'opacity 0.3s ease',
      opacity: 1,
    },
    mainImageLoading: {
      opacity: 0,
    },
    imagePlaceholder: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#999999',
      fontSize: '1rem',
    },
    thumbnailGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    thumbnail: {
      width: '100%',
      height: '96px',
      objectFit: 'cover',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'opacity 0.3s ease, transform 0.2s ease',
      backgroundColor: '#F5F5F5',
    },
    thumbnailActive: {
      border: '2px solid #DB4444',
    },
    detailsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    productName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
    },
    stars: {
      color: '#FFC107',
      display: 'flex',
      gap: '0.1rem',
    },
    reviewCount: {
      fontSize: '0.875rem',
      color: '#999999',
    },
    inStock: {
      fontSize: '0.875rem',
      color: '#16A34A',
      fontWeight: '600',
    },
    outOfStock: {
      fontSize: '0.875rem',
      color: '#DC2626',
      fontWeight: '600',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    currentPrice: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#DB4444',
    },
    comparePrice: {
      fontSize: '1.125rem',
      color: '#999999',
      textDecoration: 'line-through',
    },
    description: {
      color: '#666666',
      lineHeight: '1.6',
      marginTop: '0.25rem',
    },
    sectionTitle: {
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.5rem',
      fontSize: '0.95rem',
    },
    colorOptions: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
    },
    colorButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid #E5E5E5',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease, transform 0.2s ease',
    },
    colorButtonActive: {
      borderColor: '#DB4444',
      transform: 'scale(1.1)',
    },
    sizeOptions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    sizeButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    sizeButtonActive: {
      borderColor: '#DB4444',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
    },
    quantitySection: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: '0.25rem',
    },
    quantityControls: {
      display: 'flex',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    qtyButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      minWidth: '40px',
    },
    qtyText: {
      padding: '0.5rem 1rem',
      minWidth: '40px',
      textAlign: 'center',
      borderLeft: '1px solid #E5E5E5',
      borderRight: '1px solid #E5E5E5',
    },
    addToCartButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 2rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
    },
    addToCartButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    wishlistButton: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    productInfo: {
      borderTop: '1px solid #E5E5E5',
      paddingTop: '1rem',
      marginTop: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    infoRow: {
      display: 'flex',
      gap: '0.5rem',
      fontSize: '0.875rem',
    },
    infoLabel: {
      fontWeight: '600',
      color: '#000000',
    },
    infoValue: {
      color: '#666666',
    },
    shareSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.5rem',
    },
    shareLabel: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    shareButton: {
      color: '#666666',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    // Mobile responsive styles
    '@media (max-width: 768px)': {
      productLayout: {
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
      },
      mainImageStyle: {
        maxHeight: '300px',
      },
      currentPrice: {
        fontSize: '1.5rem',
      },
    },
  };

  const handleBreadcrumbHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleBreadcrumbLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleQtyHover = (e) => {
    e.target.style.backgroundColor = '#F5F5F5';
  };

  const handleQtyLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  const handleAddHover = (e) => {
    if (!loading && product?.stock_quantity > 0) {
      e.target.style.backgroundColor = '#B33A3A';
    }
  };

  const handleAddLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleWishlistHover = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.color = '#DB4444';
  };

  const handleWishlistLeave = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.color = '#000000';
  };

  const handleThumbnailHover = (e) => {
    e.target.style.opacity = '0.75';
  };

  const handleThumbnailLeave = (e) => {
    e.target.style.opacity = '1';
  };

  // Lazy load image handler
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #E5E5E5',
            borderTop: '4px solid #DB4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={styles.loadingText}>Loading product...</p>
        </div>
        <Footer />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div style={styles.notFoundContainer}>
          <h2 style={styles.notFoundTitle}>Product not found</h2>
          <Link to="/shop" style={styles.notFoundLink}>Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isInStock = (product.stock_quantity || 0) > 0;

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
          <Link 
            to="/shop" 
            style={styles.breadcrumbLink}
            onMouseEnter={handleBreadcrumbHover}
            onMouseLeave={handleBreadcrumbLeave}
          >
            Shop
          </Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        <div style={styles.productLayout}>
          {/* Product Images */}
          <div style={styles.imageSection}>
            <div style={styles.imageWrapper}>
              <img 
                src={mainImageUrl}
                alt={product.name}
                loading="lazy"
                style={{
                  ...styles.mainImageStyle,
                  opacity: imageLoaded ? 1 : 0,
                }}
                onLoad={handleImageLoad}
                onError={(e) => {
                  e.target.src = '/api/placeholder/600/600';
                  setImageLoaded(true);
                }}
              />
              {!imageLoaded && (
                <div style={styles.imagePlaceholder}>
                  Loading image...
                </div>
              )}
            </div>
            <div style={styles.thumbnailGrid}>
              {thumbnails.map((img, index) => (
                <img 
                  key={index} 
                  src={img.url}
                  alt={img.alt_text || product.name}
                  loading="lazy"
                  style={{
                    ...styles.thumbnail,
                    ...(mainImage === img.image_url ? styles.thumbnailActive : {})
                  }}
                  onMouseEnter={handleThumbnailHover}
                  onMouseLeave={handleThumbnailLeave}
                  onClick={() => {
                    setMainImage(img.image_url);
                    setImageLoaded(false);
                  }}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/100/100';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div style={styles.detailsSection}>
            <h1 style={styles.productName}>{product.name}</h1>
            
            <div style={styles.ratingRow}>
              {product.review_count > 0 ? (
                <>
                  <div style={styles.stars}>
                    {[...Array(5)].map((_, i) => {
                      const rating = product.average_rating || 0;
                      if (i < Math.floor(rating)) {
                        return <FaStar key={i} />;
                      } else if (i < Math.ceil(rating) && rating % 1 !== 0) {
                        return <FaStarHalfAlt key={i} />;
                      } else {
                        return <FaStar key={i} style={{ color: '#E5E5E5' }} />;
                      }
                    })}
                  </div>
                  <span style={styles.reviewCount}>({product.review_count} Reviews)</span>
                </>
              ) : (
                <span style={styles.reviewCount}>No reviews yet</span>
              )}
              <span style={isInStock ? styles.inStock : styles.outOfStock}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div style={styles.priceRow}>
              <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span style={styles.comparePrice}>{formatPrice(product.compare_price)}</span>
              )}
            </div>

            <p style={styles.description}>{product.description}</p>

            {/* Colors */}
            {product.color_options?.length > 0 && (
              <div>
                <h3 style={styles.sectionTitle}>Colours</h3>
                <div style={styles.colorOptions}>
                  {product.color_options.map((color, index) => (
                    <button key={index}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        ...styles.colorButton,
                        backgroundColor: color.toLowerCase(),
                        ...(selectedColor === color ? styles.colorButtonActive : {})
                      }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <h3 style={styles.sectionTitle}>Size</h3>
                <div style={styles.sizeOptions}>
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        ...styles.sizeButton,
                        ...(selectedSize === size ? styles.sizeButtonActive : {})
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div style={styles.quantitySection}>
              <div style={styles.quantityControls}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.qtyButton}
                  onMouseEnter={handleQtyHover}
                  onMouseLeave={handleQtyLeave}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={styles.qtyText}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={styles.qtyButton}
                  onMouseEnter={handleQtyHover}
                  onMouseLeave={handleQtyLeave}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={!isInStock}
                style={{
                  ...styles.addToCartButton,
                  ...(!isInStock ? styles.addToCartButtonDisabled : {})
                }}
                onMouseEnter={handleAddHover}
                onMouseLeave={handleAddLeave}
              >
                {!isInStock ? (
                  'Out of Stock'
                ) : addedToCart ? (
                  <><FaCheck /> Added</>
                ) : (
                  <><FaShoppingCart /> Add to Cart</>
                )}
              </button>
              <button 
                style={styles.wishlistButton}
                onMouseEnter={handleWishlistHover}
                onMouseLeave={handleWishlistLeave}
                aria-label="Add to wishlist"
              >
                <FaHeart />
              </button>
            </div>

            {/* Product Info */}
            <div style={styles.productInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Category:</span>
                <span style={styles.infoValue}>{product.category_name || 'Crochet'}</span>
              </div>
              {product.material_type && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Material:</span>
                  <span style={styles.infoValue}>{product.material_type}</span>
                </div>
              )}
              {product.sku && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>SKU:</span>
                  <span style={styles.infoValue}>{product.sku}</span>
                </div>
              )}
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Availability:</span>
                <span style={{
                  ...styles.infoValue,
                  color: isInStock ? '#16A34A' : '#DC2626'
                }}>
                  {isInStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Share */}
            <div style={styles.shareSection}>
              <span style={styles.shareLabel}>Share:</span>
              <button 
                style={styles.shareButton}
                onMouseEnter={handleWishlistHover}
                onMouseLeave={handleWishlistLeave}
                aria-label="Share product"
              >
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;