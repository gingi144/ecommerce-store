import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaFilter, FaTh, FaList, FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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
      const response = await api.get('/api/categories');
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
      
      const response = await api.get(`/api/products?${params}`);
      const productsData = response.data.products || [];
      
      // Filter out demo reviews and recalculate ratings for each product
      const processedProducts = productsData.map(product => {
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
      
      setProducts(processedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/wishlist', {
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
        await api.delete(`/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(wishlist.filter(id => id !== productId));
      } else {
        await api.post('/api/wishlist', 
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

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

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

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Container ----- */
        .shop-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        /* ----- Breadcrumb ----- */
        .shop-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .shop-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .shop-breadcrumb a:hover {
          color: #DB4444;
        }
        .shop-breadcrumb-current {
          color: #000000;
        }

        /* ----- Layout ----- */
        .shop-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        /* ----- Sidebar ----- */
        .shop-sidebar {
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          height: fit-content;
          position: sticky;
          top: 80px;
        }
        .shop-sidebar-overlay {
          display: none;
        }
        .shop-sidebar-header {
          display: none;
        }
        .shop-sidebar-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .shop-close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #000000;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ----- Filter Sections ----- */
        .shop-filter-section {
          margin-bottom: 1.5rem;
        }
        .shop-filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #000000;
          display: block;
          margin-bottom: 0.5rem;
        }
        .shop-filter-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
          cursor: pointer;
          color: #666666;
          font-size: 0.875rem;
        }
        .shop-filter-option input[type="radio"] {
          cursor: pointer;
        }
        .shop-filter-option-active {
          color: #DB4444;
        }

        /* ----- Price Inputs ----- */
        .shop-price-inputs {
          display: flex;
          gap: 0.5rem;
        }
        .shop-price-input {
          width: 50%;
          padding: 0.4rem 0.5rem;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .shop-price-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }

        /* ----- Reset Button ----- */
        .shop-reset-button {
          width: 100%;
          padding: 0.5rem;
          background-color: #F5F5F5;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.3s ease;
        }
        .shop-reset-button:hover {
          background-color: #E5E5E5;
        }

        /* ----- Toolbar ----- */
        .shop-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .shop-product-count {
          color: #666666;
          font-size: 0.875rem;
        }
        .shop-toolbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .shop-mobile-filter-button {
          display: none;
          padding: 0.5rem 1rem;
          background-color: #DB4444;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.3s ease;
          align-items: center;
          gap: 0.5rem;
        }
        .shop-mobile-filter-button:hover {
          background-color: #B33A3A;
        }
        .shop-filter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #FFFFFF;
          color: #DB4444;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          margin-left: 0.25rem;
        }

        /* ----- Sort & View ----- */
        .shop-sort-select {
          padding: 0.4rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          font-size: 0.875rem;
          outline: none;
          background-color: #FFFFFF;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .shop-sort-select:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .shop-view-toggle {
          display: flex;
          gap: 0.25rem;
        }
        .shop-view-button {
          padding: 0.4rem 0.6rem;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          background: none;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
        }
        .shop-view-button:hover {
          background-color: #f0f0f0;
        }
        .shop-view-button-active {
          background-color: #DB4444;
          color: #FFFFFF;
          border-color: #DB4444;
        }
        .shop-view-button-active:hover {
          background-color: #B33A3A;
        }

        /* ----- Product Grid & List ----- */
        .shop-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .shop-product-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .shop-loading-text {
          text-align: center;
          padding: 3rem 0;
          color: #666666;
        }
        .shop-no-products {
          text-align: center;
          padding: 3rem 0;
          color: #999999;
        }

        /* ----- Product Card ----- */
        .shop-product-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .shop-product-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
        .shop-product-image-container {
          position: relative;
          background-color: #F5F5F5;
          height: 200px;
          overflow: hidden;
          cursor: pointer;
        }
        .shop-product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .shop-product-card:hover .shop-product-image {
          transform: scale(1.03);
        }
        .shop-product-wishlist-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background-color: #FFFFFF;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          z-index: 2;
          color: #999999;
        }
        .shop-product-wishlist-btn:hover {
          transform: scale(1.1);
        }
        .shop-product-wishlist-active {
          color: #DB4444;
        }
        .shop-product-wishlist-inactive {
          color: #999999;
        }
        .shop-product-discount-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background-color: #DB4444;
          color: #FFFFFF;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          z-index: 2;
        }
        .shop-product-info {
          padding: 1rem;
        }
        .shop-product-name {
          font-weight: 600;
          color: #000000;
          text-decoration: none;
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }
        .shop-product-name:hover {
          color: #DB4444;
        }
        .shop-product-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .shop-product-stars {
          color: #FFC107;
          display: flex;
          gap: 0.05rem;
        }
        .shop-product-review-count {
          font-size: 0.75rem;
          color: #999999;
        }
        .shop-product-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .shop-product-current-price {
          color: #DB4444;
          font-weight: 700;
        }
        .shop-product-original-price {
          color: #999999;
          text-decoration: line-through;
          font-size: 0.875rem;
        }
        .shop-product-add-button {
          width: 100%;
          background-color: #DB4444;
          color: #FFFFFF;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.3s ease;
          font-size: 0.875rem;
        }
        .shop-product-add-button:hover {
          background-color: #B33A3A;
        }

        /* ----- Product List Item ----- */
        .shop-product-list-item {
          background-color: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: box-shadow 0.3s ease;
          display: flex;
          flex-direction: row;
        }
        .shop-product-list-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .shop-product-list-image-container {
          width: 180px;
          height: 180px;
          background-color: #F5F5F5;
          flex-shrink: 0;
          cursor: pointer;
          position: relative;
        }
        .shop-product-list-image-container .shop-product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shop-product-list-info {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .shop-product-list-name {
          font-weight: 600;
          color: #000000;
          text-decoration: none;
          font-size: 1.1rem;
          display: block;
        }
        .shop-product-list-name:hover {
          color: #DB4444;
        }
        .shop-product-list-description {
          color: #666666;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .shop-product-list-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.5rem;
        }
        .shop-product-list-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .shop-product-list-current {
          color: #DB4444;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .shop-product-list-original {
          color: #999999;
          text-decoration: line-through;
          font-size: 0.875rem;
        }
        .shop-product-list-add {
          background-color: #DB4444;
          color: #FFFFFF;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.3s ease;
          font-size: 0.875rem;
        }
        .shop-product-list-add:hover {
          background-color: #B33A3A;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        /* Tablet Landscape / Small Laptops */
        @media (max-width: 1024px) {
          .shop-layout {
            grid-template-columns: 240px 1fr;
            gap: 1.5rem;
          }
          .shop-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.25rem;
          }
        }

        /* Tablets / Mobile Landscape */
        @media (max-width: 768px) {
          .shop-container {
            padding: 1rem 0.75rem;
          }
          .shop-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          /* Sidebar becomes slide-out drawer */
          .shop-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            border-radius: 0;
            padding: 1.5rem;
            overflow-y: auto;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
          }
          .shop-sidebar-open {
            transform: translateX(0);
          }
          
          /* Overlay for mobile sidebar */
          .shop-sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            z-index: 999;
          }
          .shop-sidebar-overlay-open {
            display: block;
          }
          
          /* Sidebar header for mobile */
          .shop-sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #E5E5E5;
          }
          
          /* Show filter button on mobile */
          .shop-mobile-filter-button {
            display: flex;
          }
          
          /* Product grid adjustments */
          .shop-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
          }
          .shop-product-card {
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          }
          .shop-product-image-container {
            height: 160px;
          }
          .shop-product-info {
            padding: 0.75rem;
          }
          .shop-product-name {
            font-size: 0.875rem;
          }
          .shop-product-wishlist-btn {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }
          .shop-product-discount-badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }
          .shop-product-add-button {
            font-size: 0.75rem;
            padding: 0.4rem;
          }
          
          /* List view adjustments */
          .shop-product-list-item {
            border-radius: 4px;
            flex-direction: column;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          }
          .shop-product-list-image-container {
            width: 100%;
            height: 200px;
          }
          .shop-product-list-info {
            padding: 0.75rem;
          }
          .shop-product-list-name {
            font-size: 1rem;
          }
          .shop-product-list-add {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
          }
          
          /* Breadcrumb */
          .shop-breadcrumb {
            font-size: 0.75rem;
            margin-bottom: 1rem;
          }
          
          /* Toolbar */
          .shop-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          .shop-product-count {
            text-align: center;
          }
          .shop-toolbar-right {
            justify-content: space-between;
            width: 100%;
          }
        }

        /* Mobile Phones */
        @media (max-width: 480px) {
          .shop-container {
            padding: 0.75rem 0.5rem;
          }
          
          .shop-breadcrumb {
            font-size: 0.7rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }
          
          .shop-sidebar {
            padding: 1rem;
            max-width: 100%;
          }
          .shop-sidebar-title {
            font-size: 1rem;
          }
          .shop-filter-section {
            margin-bottom: 1rem;
          }
          .shop-filter-label {
            font-size: 0.8rem;
          }
          .shop-filter-option {
            font-size: 0.8rem;
            padding: 0.2rem 0;
          }
          
          .shop-price-inputs {
            flex-direction: column;
            gap: 0.3rem;
          }
          .shop-price-input {
            width: 100%;
            padding: 0.3rem 0.4rem;
            font-size: 0.8rem;
          }
          
          .shop-reset-button {
            padding: 0.4rem;
            font-size: 0.8rem;
          }
          
          .shop-product-count {
            font-size: 0.8rem;
          }
          
          .shop-mobile-filter-button {
            font-size: 0.75rem;
            padding: 0.4rem 0.6rem;
            justify-content: center;
            flex: 1;
          }
          .shop-sort-select {
            font-size: 0.75rem;
            padding: 0.3rem 0.4rem;
            flex: 1;
          }
          .shop-view-toggle {
            gap: 0.15rem;
          }
          .shop-view-button {
            padding: 0.3rem 0.4rem;
            font-size: 0.7rem;
          }
          
          .shop-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
          }
          .shop-product-image-container {
            height: 140px;
          }
          .shop-product-info {
            padding: 0.5rem;
          }
          .shop-product-name {
            font-size: 0.75rem;
          }
          .shop-product-rating {
            margin-bottom: 0.25rem;
          }
          .shop-product-stars {
            font-size: 0.65rem;
          }
          .shop-product-review-count {
            font-size: 0.6rem;
          }
          .shop-product-price {
            margin-bottom: 0.25rem;
          }
          .shop-product-current-price {
            font-size: 0.8rem;
          }
          .shop-product-original-price {
            font-size: 0.65rem;
          }
          .shop-product-add-button {
            font-size: 0.7rem;
            padding: 0.3rem;
            gap: 0.25rem;
          }
          .shop-product-wishlist-btn {
            width: 24px;
            height: 24px;
            font-size: 0.6rem;
            top: 0.3rem;
            right: 0.3rem;
          }
          .shop-product-discount-badge {
            font-size: 0.55rem;
            padding: 0.15rem 0.4rem;
            top: 0.3rem;
            left: 0.3rem;
          }
          
          .shop-product-list-image-container {
            height: 160px;
          }
          .shop-product-list-info {
            padding: 0.5rem;
          }
          .shop-product-list-name {
            font-size: 0.875rem;
          }
          .shop-product-list-description {
            font-size: 0.75rem;
            margin-top: 0.15rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .shop-product-list-bottom {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            margin-top: 0.3rem;
          }
          .shop-product-list-price {
            justify-content: center;
          }
          .shop-product-list-current {
            font-size: 0.95rem;
          }
          .shop-product-list-original {
            font-size: 0.75rem;
          }
          .shop-product-list-add {
            width: 100%;
            justify-content: center;
            padding: 0.4rem;
            font-size: 0.75rem;
          }
          
          .shop-loading-text {
            padding: 2rem 0;
            font-size: 0.875rem;
          }
          .shop-no-products {
            padding: 2rem 0;
            font-size: 0.875rem;
          }
        }

        /* Very Small Phones */
        @media (max-width: 360px) {
          .shop-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 0.5rem;
          }
          .shop-product-image-container {
            height: 120px;
          }
          .shop-product-info {
            padding: 0.4rem;
          }
          .shop-product-name {
            font-size: 0.7rem;
          }
          .shop-product-current-price {
            font-size: 0.7rem;
          }
          .shop-product-add-button {
            font-size: 0.65rem;
            padding: 0.25rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="shop-container">
        {/* Breadcrumb */}
        <div className="shop-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="shop-breadcrumb-current">Shop</span>
        </div>

        {/* Mobile Filter Overlay */}
        <div 
          className={`shop-sidebar-overlay ${isMobileFilterOpen ? 'shop-sidebar-overlay-open' : ''}`} 
          onClick={() => setIsMobileFilterOpen(false)} 
        />

        <div className="shop-layout">
          {/* Sidebar - Filters */}
          <div className={`shop-sidebar ${isMobileFilterOpen ? 'shop-sidebar-open' : ''}`}>
            <div className="shop-sidebar-header">
              <h3 className="shop-sidebar-title">
                <FaFilter /> Filters
                {activeFilterCount > 0 && (
                  <span className="shop-filter-badge">{activeFilterCount}</span>
                )}
              </h3>
              <button className="shop-close-button" onClick={() => setIsMobileFilterOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="shop-filter-section">
              <h4 className="shop-filter-label">Categories</h4>
              <div className="shop-filter-option">
                <input 
                  type="radio" 
                  name="category" 
                  value=""
                  checked={filters.category === ''}
                  onChange={() => setFilters({...filters, category: ''})}
                />
                <span className={filters.category === '' ? 'shop-filter-option-active' : ''}>All</span>
              </div>
              {categories.map(cat => (
                <div key={cat.id} className="shop-filter-option">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.slug}
                    checked={filters.category === cat.slug}
                    onChange={() => setFilters({...filters, category: cat.slug})}
                  />
                  <span className={filters.category === cat.slug ? 'shop-filter-option-active' : ''}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="shop-filter-section">
              <h4 className="shop-filter-label">Price Range</h4>
              <div className="shop-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="shop-price-input"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="shop-price-input"
                  min="0"
                />
              </div>
            </div>

            <button 
              className="shop-reset-button"
              onClick={() => setFilters({category: '', search: '', minPrice: '', maxPrice: '', sort: 'newest'})}
            >
              Reset Filters
            </button>
          </div>

          {/* Products Section */}
          <div>
            <div className="shop-toolbar">
              <span className="shop-product-count">{products.length} products found</span>
              <div className="shop-toolbar-right">
                <button 
                  className="shop-mobile-filter-button"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <FaFilter /> 
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="shop-filter-badge">{activeFilterCount}</span>
                  )}
                </button>
                <select 
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  className="shop-sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <div className="shop-view-toggle">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`shop-view-button ${viewMode === 'grid' ? 'shop-view-button-active' : ''}`}
                    aria-label="Grid view"
                  >
                    <FaTh />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`shop-view-button ${viewMode === 'list' ? 'shop-view-button-active' : ''}`}
                    aria-label="List view"
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="shop-loading-text">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="shop-no-products">No products found</div>
            ) : viewMode === 'grid' ? (
              <div className="shop-product-grid">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    formatPrice={formatPrice}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    discount={getDiscountPercentage(product)}
                    renderStars={renderStars}
                  />
                ))}
              </div>
            ) : (
              <div className="shop-product-list">
                {products.map(product => (
                  <ProductListItem 
                    key={product.id} 
                    product={product} 
                    formatPrice={formatPrice}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    discount={getDiscountPercentage(product)}
                    renderStars={renderStars}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// =============================================
// Product Grid Card Component
// =============================================
const ProductCard = ({ product, formatPrice, isWishlisted, onToggleWishlist, onAddToCart, discount, renderStars }) => {
  const imageUrl = getImageUrl(product.images?.[0]?.image_url);
  const discountPercentage = discount || 0;

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
    <div className="shop-product-card">
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div className="shop-product-image-container">
          <img 
            src={imageUrl}
            alt={product.name} 
            className="shop-product-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          <button 
            className={`shop-product-wishlist-btn ${isWishlisted ? 'shop-product-wishlist-active' : 'shop-product-wishlist-inactive'}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
          {discountPercentage > 0 && (
            <span className="shop-product-discount-badge">-{discountPercentage}% OFF</span>
          )}
        </div>
      </Link>
      <div className="shop-product-info">
        <Link to={`/product/${product.slug}`} className="shop-product-name">
          {product.name}
        </Link>
        <div className="shop-product-rating">
          <span className="shop-product-stars">
            {product.review_count > 0 ? (
              renderStars(product.average_rating || 0)
            ) : (
              [...Array(5)].map((_, i) => (
                <FaStar key={i} size={14} style={{ color: '#E5E5E5' }} />
              ))
            )}
          </span>
          {product.review_count > 0 && (
            <span className="shop-product-review-count">({product.review_count})</span>
          )}
        </div>
        <div className="shop-product-price">
          <span className="shop-product-current-price">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="shop-product-original-price">{formatPrice(product.compare_price)}</span>
          )}
        </div>
        <button className="shop-product-add-button" onClick={handleAddClick}>
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

// =============================================
// Product List Item Component
// =============================================
const ProductListItem = ({ product, formatPrice, isWishlisted, onToggleWishlist, onAddToCart, discount, renderStars }) => {
  const imageUrl = getImageUrl(product.images?.[0]?.image_url);
  const discountPercentage = discount || 0;

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
    <div className="shop-product-list-item">
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div className="shop-product-list-image-container">
          <img 
            src={imageUrl}
            alt={product.name} 
            className="shop-product-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          <button 
            className={`shop-product-wishlist-btn ${isWishlisted ? 'shop-product-wishlist-active' : 'shop-product-wishlist-inactive'}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
          {discountPercentage > 0 && (
            <span className="shop-product-discount-badge">-{discountPercentage}% OFF</span>
          )}
        </div>
      </Link>
      <div className="shop-product-list-info">
        <div>
          <Link to={`/product/${product.slug}`} className="shop-product-list-name">
            {product.name}
          </Link>
          <p className="shop-product-list-description">{product.description?.substring(0, 120)}...</p>
          <div className="shop-product-rating">
            <span className="shop-product-stars">
              {product.review_count > 0 ? (
                renderStars(product.average_rating || 0)
              ) : (
                [...Array(5)].map((_, i) => (
                  <FaStar key={i} size={14} style={{ color: '#E5E5E5' }} />
                ))
              )}
            </span>
            {product.review_count > 0 && (
              <span className="shop-product-review-count">({product.review_count})</span>
            )}
          </div>
        </div>
        <div className="shop-product-list-bottom">
          <div className="shop-product-list-price">
            <span className="shop-product-list-current">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="shop-product-list-original">{formatPrice(product.compare_price)}</span>
            )}
          </div>
          <button className="shop-product-list-add" onClick={handleAddClick}>
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;