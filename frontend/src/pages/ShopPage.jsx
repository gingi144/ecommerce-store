import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaFilter, FaTh, FaList, FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: 'newest',
    minPrice: '',
    maxPrice: ''
  });
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [filters, isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const response = await axios.get(`http://localhost:5000/api/products?${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.map(item => item.product_id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (wishlist.includes(productId)) {
        await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(wishlist.filter(id => id !== productId));
      } else {
        await axios.post('http://localhost:5000/api/wishlist', 
          { product_id: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist([...wishlist, productId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
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
        flexWrap: 'wrap',
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
    shopLayout: {
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: '2rem',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '240px 1fr',
        gap: '1.5rem',
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '1rem',
      },
    },
    sidebar: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '80px',
      '@media (max-width: 768px)': {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        borderRadius: 0,
        padding: '1.5rem',
        overflowY: 'auto',
        transform: isMobileFilterOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      },
    },
    sidebarOverlay: {
      display: 'none',
      '@media (max-width: 768px)': {
        display: isMobileFilterOpen ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
      },
    },
    sidebarHeader: {
      display: 'none',
      '@media (max-width: 768px)': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #E5E5E5',
      },
    },
    sidebarTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        fontSize: '1rem',
      },
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#000000',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterSection: {
      marginBottom: '1.5rem',
      '@media (max-width: 480px)': {
        marginBottom: '1rem',
      },
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#000000',
      display: 'block',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
      },
    },
    filterOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0',
      cursor: 'pointer',
      color: '#666666',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.2rem 0',
      },
    },
    filterOptionActive: {
      color: '#DB4444',
    },
    priceInputs: {
      display: 'flex',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        gap: '0.3rem',
      },
    },
    priceInput: {
      width: '50%',
      padding: '0.4rem 0.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      '@media (max-width: 480px)': {
        width: '100%',
        padding: '0.3rem 0.4rem',
        fontSize: '0.8rem',
      },
    },
    resetButton: {
      width: '100%',
      padding: '0.5rem',
      backgroundColor: '#F5F5F5',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 480px)': {
        padding: '0.4rem',
        fontSize: '0.8rem',
      },
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '0.5rem',
        marginBottom: '1rem',
      },
    },
    productCount: {
      color: '#666666',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        textAlign: 'center',
      },
    },
    toolbarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      '@media (max-width: 480px)': {
        justifyContent: 'space-between',
        width: '100%',
      },
    },
    mobileFilterButton: {
      display: 'none',
      padding: '0.5rem 1rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (max-width: 768px)': {
        display: 'flex',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.4rem 0.8rem',
        justifyContent: 'center',
        flex: 1,
      },
    },
    sortSelect: {
      padding: '0.4rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.3rem 0.5rem',
        flex: 1,
      },
    },
    viewToggle: {
      display: 'flex',
      gap: '0.25rem',
      '@media (max-width: 480px)': {
        gap: '0.15rem',
      },
    },
    viewButton: {
      padding: '0.4rem 0.6rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '@media (max-width: 480px)': {
        padding: '0.3rem 0.5rem',
        fontSize: '0.75rem',
      },
    },
    viewButtonActive: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      borderColor: '#DB4444',
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
    productList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
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
    noProducts: {
      textAlign: 'center',
      padding: '3rem 0',
      color: '#999999',
      '@media (max-width: 480px)': {
        padding: '2rem 0',
        fontSize: '0.875rem',
      },
    },
    // Mobile filter count badge
    filterBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      color: '#DB4444',
      fontSize: '0.7rem',
      fontWeight: '700',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      marginLeft: '0.25rem',
    },
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.search) count++;
    return count;
  };

  const handleBreadcrumbHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleBreadcrumbLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.1)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.boxShadow = 'none';
  };

  const handleResetHover = (e) => {
    e.target.style.backgroundColor = '#E5E5E5';
  };

  const handleResetLeave = (e) => {
    e.target.style.backgroundColor = '#F5F5F5';
  };

  const handleFilterButtonHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleFilterButtonLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const activeFilterCount = getActiveFilterCount();

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
          <span style={styles.breadcrumbCurrent}>Shop</span>
        </div>

        {/* Mobile Filter Overlay */}
        <div style={styles.sidebarOverlay} onClick={() => setIsMobileFilterOpen(false)} />

        <div style={styles.shopLayout}>
          {/* Sidebar - Filters (Hidden on mobile unless opened) */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>
                <FaFilter /> Filters
                {activeFilterCount > 0 && (
                  <span style={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </h3>
              <button style={styles.closeButton} onClick={() => setIsMobileFilterOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div style={styles.filterSection}>
              <h4 style={styles.filterLabel}>Categories</h4>
              <div style={styles.filterOption}>
                <input 
                  type="radio" 
                  name="category" 
                  value=""
                  checked={filters.category === ''}
                  onChange={() => setFilters({...filters, category: ''})}
                />
                <span style={filters.category === '' ? styles.filterOptionActive : {}}>All</span>
              </div>
              {categories.map(cat => (
                <div key={cat.id} style={styles.filterOption}>
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.slug}
                    checked={filters.category === cat.slug}
                    onChange={() => setFilters({...filters, category: cat.slug})}
                  />
                  <span style={filters.category === cat.slug ? styles.filterOptionActive : {}}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.filterSection}>
              <h4 style={styles.filterLabel}>Price Range</h4>
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  style={styles.priceInput}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  style={styles.priceInput}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            <button 
              style={styles.resetButton}
              onMouseEnter={handleResetHover}
              onMouseLeave={handleResetLeave}
              onClick={() => setFilters({category: '', search: '', minPrice: '', maxPrice: '', sort: 'newest'})}
            >
              Reset Filters
            </button>
          </div>

          {/* Products */}
          <div>
            <div style={styles.toolbar}>
              <span style={styles.productCount}>{products.length} products found</span>
              <div style={styles.toolbarRight}>
                <button 
                  style={styles.mobileFilterButton}
                  onMouseEnter={handleFilterButtonHover}
                  onMouseLeave={handleFilterButtonLeave}
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <FaFilter /> 
                  Filters
                  {activeFilterCount > 0 && (
                    <span style={styles.filterBadge}>{activeFilterCount}</span>
                  )}
                </button>
                <select 
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  style={styles.sortSelect}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <div style={styles.viewToggle}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    style={{
                      ...styles.viewButton,
                      ...(viewMode === 'grid' ? styles.viewButtonActive : {})
                    }}
                  >
                    <FaTh />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    style={{
                      ...styles.viewButton,
                      ...(viewMode === 'list' ? styles.viewButtonActive : {})
                    }}
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={styles.loadingText}>Loading products...</div>
            ) : products.length === 0 ? (
              <div style={styles.noProducts}>No products found</div>
            ) : viewMode === 'grid' ? (
              <div style={styles.productGrid}>
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    formatPrice={formatPrice}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    discount={getDiscountPercentage(product)}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.productList}>
                {products.map(product => (
                  <ProductListItem 
                    key={product.id} 
                    product={product} 
                    formatPrice={formatPrice}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    discount={getDiscountPercentage(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Product Grid Card Component - Responsive
const ProductCard = ({ product, formatPrice, isWishlisted, onToggleWishlist, onAddToCart, discount }) => {
  const imageUrl = getImageUrl(product.images?.[0]?.image_url);
  const discountPercentage = discount || 0;

  const styles = {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
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
      cursor: 'pointer',
      '@media (max-width: 768px)': {
        height: '160px',
      },
      '@media (max-width: 480px)': {
        height: '140px',
      },
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    wishlistBtn: {
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
      zIndex: 2,
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
    wishlistActive: {
      color: '#DB4444',
    },
    wishlistInactive: {
      color: '#999999',
    },
    discountBadge: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.8rem',
      fontWeight: '700',
      padding: '0.3rem 0.7rem',
      borderRadius: '4px',
      zIndex: 2,
      '@media (max-width: 768px)': {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.6rem',
        padding: '0.15rem 0.4rem',
        top: '0.3rem',
        left: '0.3rem',
      },
    },
    info: {
      padding: '1rem',
      '@media (max-width: 768px)': {
        padding: '0.75rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.5rem',
      },
    },
    name: {
      fontWeight: '600',
      color: '#000000',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '0.25rem',
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
    price: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        marginBottom: '0.3rem',
        flexWrap: 'wrap',
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
      '@media (max-width: 768px)': {
        fontSize: '0.875rem',
        padding: '0.4rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
        padding: '0.3rem',
        gap: '0.3rem',
      },
    },
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div style={styles.card}>
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div style={styles.imageContainer}>
          <img 
            src={imageUrl}
            alt={product.name} 
            style={styles.image}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          <button 
            style={{
              ...styles.wishlistBtn,
              ...(isWishlisted ? styles.wishlistActive : styles.wishlistInactive)
            }}
            onClick={handleWishlistClick}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
          {discountPercentage > 0 && (
            <span style={styles.discountBadge}>-{discountPercentage}% OFF</span>
          )}
        </div>
      </Link>
      <div style={styles.info}>
        <Link to={`/product/${product.slug}`} style={styles.name}>
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
        <div style={styles.price}>
          <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span style={styles.originalPrice}>{formatPrice(product.compare_price)}</span>
          )}
        </div>
        <button style={styles.addButton} onClick={handleAddClick}>
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

// Product List Item Component - Responsive
const ProductListItem = ({ product, formatPrice, isWishlisted, onToggleWishlist, onAddToCart, discount }) => {
  const imageUrl = getImageUrl(product.images?.[0]?.image_url);
  const discountPercentage = discount || 0;

  const styles = {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease',
      display: 'flex',
      flexDirection: 'row',
      '@media (max-width: 768px)': {
        borderRadius: '4px',
        flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      },
    },
    imageContainer: {
      width: '180px',
      height: '180px',
      backgroundColor: '#F5F5F5',
      flexShrink: 0,
      cursor: 'pointer',
      position: 'relative',
      '@media (max-width: 768px)': {
        width: '100%',
        height: '200px',
      },
      '@media (max-width: 480px)': {
        height: '160px',
      },
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    wishlistBtn: {
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
      zIndex: 2,
      '@media (max-width: 480px)': {
        width: '28px',
        height: '28px',
        fontSize: '0.75rem',
        top: '0.3rem',
        right: '0.3rem',
      },
    },
    wishlistActive: {
      color: '#DB4444',
    },
    wishlistInactive: {
      color: '#999999',
    },
    discountBadge: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.8rem',
      fontWeight: '700',
      padding: '0.3rem 0.7rem',
      borderRadius: '4px',
      zIndex: 2,
      '@media (max-width: 480px)': {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        top: '0.3rem',
        left: '0.3rem',
      },
    },
    info: {
      padding: '1rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      '@media (max-width: 768px)': {
        padding: '0.75rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.5rem',
      },
    },
    name: {
      fontWeight: '600',
      color: '#000000',
      textDecoration: 'none',
      fontSize: '1.1rem',
      display: 'block',
      '@media (max-width: 768px)': {
        fontSize: '1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.875rem',
      },
    },
    description: {
      color: '#666666',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        marginTop: '0.15rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      },
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.25rem',
      '@media (max-width: 480px)': {
        marginTop: '0.15rem',
      },
    },
    stars: {
      color: '#FFC107',
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
    bottomRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '0.5rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '0.5rem',
        marginTop: '0.3rem',
      },
    },
    price: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        flexWrap: 'wrap',
      },
    },
    currentPrice: {
      color: '#DB4444',
      fontWeight: '700',
      fontSize: '1.1rem',
      '@media (max-width: 480px)': {
        fontSize: '0.95rem',
      },
    },
    originalPrice: {
      color: '#999999',
      textDecoration: 'line-through',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    addButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      padding: '0.5rem 1.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 768px)': {
        padding: '0.4rem 1rem',
        fontSize: '0.875rem',
      },
      '@media (max-width: 480px)': {
        width: '100%',
        justifyContent: 'center',
        padding: '0.4rem',
        fontSize: '0.8rem',
      },
    },
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div style={styles.card}>
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div style={styles.imageContainer}>
          <img 
            src={imageUrl}
            alt={product.name} 
            style={styles.image}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          <button 
            style={{
              ...styles.wishlistBtn,
              ...(isWishlisted ? styles.wishlistActive : styles.wishlistInactive)
            }}
            onClick={handleWishlistClick}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
          {discountPercentage > 0 && (
            <span style={styles.discountBadge}>-{discountPercentage}% OFF</span>
          )}
        </div>
      </Link>
      <div style={styles.info}>
        <div>
          <Link to={`/product/${product.slug}`} style={styles.name}>
            {product.name}
          </Link>
          <p style={styles.description}>{product.description?.substring(0, 120)}...</p>
          <div style={styles.rating}>
            <span style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} size={14} />
              ))}
            </span>
            <span style={styles.reviewCount}>(88)</span>
          </div>
        </div>
        <div style={styles.bottomRow}>
          <div style={styles.price}>
            <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span style={styles.originalPrice}>{formatPrice(product.compare_price)}</span>
            )}
          </div>
          <button style={styles.addButton} onClick={handleAddClick}>
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;