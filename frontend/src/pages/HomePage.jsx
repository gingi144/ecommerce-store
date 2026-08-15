import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaStar, 
  FaHeart, 
  FaTruck, 
  FaHeadset, 
  FaShieldAlt,
  FaYarn,
  FaPuzzlePiece,
  FaBook,
  FaGift,
  FaGem,
  FaBox,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

// Import local banner images
import banner1 from '/images/banners/banner1.jpg';
import banner2 from '/images/banners/banner2.jpg';
import banner3 from '/images/banners/banner3.jpg';
import banner4 from '/images/banners/banner4.jpg';
import banner5 from '/images/banners/banner5.jpg';

// Import New Arrival images (store these in /images/new-arrivals/)
import newArrivalMain from '/images/new-arrivals/new-arrival-main.jpg';
import newArrivalBlanket from '/images/new-arrivals/new-arrival-blanket.jpg';
import newArrivalAmigurumi from '/images/new-arrivals/new-arrival-amigurumi.jpg';
import newArrivalScarf from '/images/new-arrivals/new-arrival-scarf.jpg';
import newArrivalDecor from '/images/new-arrivals/new-arrival-decor.jpg';

// Image cache utility
const imageCache = new Map();

const preloadImage = (src) => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

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

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [imagesLoaded, setImagesLoaded] = useState({});
  const { addToCart } = useCart();
  
  const countdownIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: 'Premium Cotton Yarn',
      subtitle: 'Soft, durable, and perfect for all your projects',
      image: banner1,
      link: '/shop?category=yarn-thread'
    },
    {
      id: 2,
      title: 'Crochet Hooks Set',
      subtitle: 'Professional grade hooks for every project',
      image: banner2,
      link: '/shop?category=crochet-hooks'
    },
    {
      id: 3,
      title: 'Handmade Crochet Blankets',
      subtitle: 'Warm, cozy, and made with love',
      image: banner3,
      link: '/shop?category=finished-products'
    },
    {
      id: 4,
      title: 'Crochet Patterns & Kits',
      subtitle: 'Everything you need to get started',
      image: banner4,
      link: '/shop?category=patterns-kits'
    },
    {
      id: 5,
      title: 'Special Bundles & Deals',
      subtitle: 'Save big on our curated collections',
      image: banner5,
      link: '/shop?category=bundles-deals'
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchFlashSaleSettings();
    
    // Preload banner images
    slides.forEach(slide => {
      preloadImage(slide.image).catch(() => {});
    });
    
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      const allProducts = response.data.products || [];
      
      // Process each product to filter out demo reviews
      const processedProducts = allProducts.map(product => {
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
      setBestSelling(processedProducts.filter(p => p.is_featured) || []);
      setFlashSales(processedProducts.filter(p => p.is_on_sale) || []);
      
      // Preload product images
      processedProducts.forEach(product => {
        const imageUrl = getImageUrl(product.images?.[0]?.image_url);
        if (imageUrl) {
          preloadImage(imageUrl).catch(() => {});
        }
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashSaleSettings = async () => {
    try {
      const response = await api.get('/api/flash-sale/settings');
      const settings = response.data;
      
      if (settings && settings.end_time) {
        const endTime = new Date(settings.end_time);
        const now = new Date();
        
        if (endTime > now) {
          startCountdown(endTime);
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } else {
        const defaultEndTime = new Date();
        defaultEndTime.setDate(defaultEndTime.getDate() + 3);
        startCountdown(defaultEndTime);
      }
    } catch (error) {
      console.error('Error fetching flash sale settings:', error);
      const defaultEndTime = new Date();
      defaultEndTime.setDate(defaultEndTime.getDate() + 3);
      startCountdown(defaultEndTime);
    }
  };

  const startCountdown = (endTime) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    countdownIntervalRef.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;
      
      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
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

  // Responsive styles with media queries
  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      '@media (max-width: 768px)': {
        padding: '0 0.5rem',
      },
    },
    section: {
      padding: '2rem 0',
      '@media (max-width: 768px)': {
        padding: '1.5rem 0',
      },
      '@media (max-width: 480px)': {
        padding: '1rem 0',
      },
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5rem',
      },
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      '@media (max-width: 768px)': {
        fontSize: '1.25rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1rem',
      },
    },
    sectionSubtitle: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#DB4444',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    timerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (max-width: 768px)': {
        gap: '0.25rem',
      },
      '@media (max-width: 480px)': {
        gap: '0.15rem',
      },
    },
    timerBlock: {
      textAlign: 'center',
    },
    timerNumber: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '1.125rem',
      fontWeight: '700',
      display: 'block',
      minWidth: '32px',
      '@media (max-width: 768px)': {
        fontSize: '0.875rem',
        padding: '0.2rem 0.5rem',
        minWidth: '28px',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
        padding: '0.15rem 0.4rem',
        minWidth: '24px',
      },
    },
    timerLabel: {
      fontSize: '0.75rem',
      color: '#999999',
      display: 'block',
      marginTop: '2px',
      '@media (max-width: 480px)': {
        fontSize: '0.625rem',
      },
    },
    timerSeparator: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#DB4444',
      '@media (max-width: 768px)': {
        fontSize: '1.25rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1rem',
      },
    },
    sliderContainer: {
      position: 'relative',
      backgroundColor: '#000000',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '2rem',
      height: '400px',
      '@media (max-width: 1024px)': {
        height: '350px',
      },
      '@media (max-width: 768px)': {
        height: '300px',
        borderRadius: '4px',
        marginBottom: '1.5rem',
      },
      '@media (max-width: 480px)': {
        height: '250px',
        marginBottom: '1rem',
      },
    },
    sliderWrapper: {
      display: 'flex',
      transition: 'transform 0.5s ease-in-out',
      height: '100%',
    },
    slide: {
      minWidth: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '2rem 4rem',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      '@media (max-width: 1024px)': {
        padding: '1.5rem 3rem',
      },
      '@media (max-width: 768px)': {
        padding: '1rem 2rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.75rem 1.5rem',
      },
    },
    slideContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '50%',
      '@media (max-width: 768px)': {
        maxWidth: '60%',
      },
      '@media (max-width: 480px)': {
        maxWidth: '70%',
      },
    },
    slideTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '0.5rem',
      '@media (max-width: 1024px)': {
        fontSize: '2rem',
      },
      '@media (max-width: 768px)': {
        fontSize: '1.5rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.1rem',
        marginBottom: '0.25rem',
      },
    },
    slideSubtitle: {
      fontSize: '1.1rem',
      color: '#CCCCCC',
      marginBottom: '1.5rem',
      '@media (max-width: 1024px)': {
        fontSize: '1rem',
      },
      '@media (max-width: 768px)': {
        fontSize: '0.875rem',
        marginBottom: '1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.7rem',
        marginBottom: '0.75rem',
        display: 'none',
      },
    },
    slideButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '4px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 768px)': {
        padding: '0.5rem 1.5rem',
        fontSize: '0.875rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.4rem 1rem',
        fontSize: '0.75rem',
      },
    },
    slideImage: {
      position: 'absolute',
      right: '2rem',
      top: '50%',
      transform: 'translateY(-50%)',
      maxHeight: '80%',
      maxWidth: '40%',
      objectFit: 'contain',
      zIndex: 1,
      borderRadius: '8px',
      '@media (max-width: 1024px)': {
        right: '1.5rem',
        maxWidth: '35%',
      },
      '@media (max-width: 768px)': {
        right: '1rem',
        maxWidth: '30%',
        maxHeight: '70%',
      },
      '@media (max-width: 480px)': {
        right: '0.5rem',
        maxWidth: '25%',
        maxHeight: '60%',
        display: 'none',
      },
    },
    sliderDots: {
      position: 'absolute',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 10,
      '@media (max-width: 480px)': {
        bottom: '0.5rem',
        gap: '0.3rem',
      },
    },
    dot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 480px)': {
        width: '8px',
        height: '8px',
      },
    },
    dotActive: {
      backgroundColor: '#DB4444',
    },
    dotInactive: {
      backgroundColor: 'rgba(255,255,255,0.4)',
    },
    sliderNav: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      transition: 'background-color 0.3s ease',
      '@media (max-width: 768px)': {
        width: '30px',
        height: '30px',
        fontSize: '0.75rem',
      },
      '@media (max-width: 480px)': {
        width: '25px',
        height: '25px',
        fontSize: '0.625rem',
        display: 'none',
      },
    },
    sliderNavLeft: {
      left: '1rem',
      '@media (max-width: 768px)': {
        left: '0.5rem',
      },
    },
    sliderNavRight: {
      right: '1rem',
      '@media (max-width: 768px)': {
        right: '0.5rem',
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
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '0.75rem',
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '0.5rem',
        marginTop: '1rem',
      },
    },
    categoryCard: {
      backgroundColor: '#FFFFFF',
      border: '2px solid #E5E5E5',
      borderRadius: '8px',
      padding: '1.5rem 0.5rem',
      textAlign: 'center',
      textDecoration: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        padding: '1rem 0.25rem',
        gap: '0.3rem',
      },
    },
    categoryIcon: {
      fontSize: '2rem',
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '@media (max-width: 768px)': {
        fontSize: '1.5rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.25rem',
      },
    },
    categoryName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#000000',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    musicBanner: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      '@media (max-width: 768px)': {
        padding: '2rem 1rem',
      },
      '@media (max-width: 480px)': {
        padding: '1.5rem 0.75rem',
      },
    },
    musicBannerContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      width: '100%',
      '@media (max-width: 480px)': {
        gap: '1rem',
      },
    },
    musicBannerText: {
      textAlign: 'center',
    },
    musicBannerBadge: {
      color: '#DB4444',
      fontWeight: '600',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    musicBannerTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginTop: '0.5rem',
      '@media (max-width: 768px)': {
        fontSize: '1.5rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.25rem',
        marginTop: '0.3rem',
      },
    },
    musicBannerDescription: {
      color: '#CCCCCC',
      marginTop: '0.5rem',
      '@media (max-width: 480px)': {
        fontSize: '0.875rem',
        marginTop: '0.3rem',
      },
    },
    musicBannerButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '4px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 768px)': {
        padding: '0.5rem 1.5rem',
        fontSize: '0.875rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.4rem 1rem',
        fontSize: '0.75rem',
      },
    },
    newArrivalSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1.5rem',
      marginTop: '1rem',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: '1fr',
        gap: '0.75rem',
      },
    },
    newArrivalMain: {
      gridRow: 'span 2',
      borderRadius: '8px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '400px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
      '@media (max-width: 1024px)': {
        minHeight: '350px',
        padding: '1.5rem',
      },
      '@media (max-width: 768px)': {
        minHeight: '300px',
        padding: '1rem',
        gridRow: 'span 1',
      },
      '@media (max-width: 480px)': {
        minHeight: '250px',
        padding: '0.75rem',
      },
    },
    newArrivalMainOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 1,
    },
    newArrivalContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    },
    newArrivalCard: {
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '190px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        minHeight: '160px',
        padding: '1rem',
      },
      '@media (max-width: 480px)': {
        minHeight: '140px',
        padding: '0.75rem',
      },
    },
    newArrivalCardOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 1,
    },
    newArrivalCardContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    },
    newArrivalTag: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '0.5rem',
      backgroundColor: 'rgba(219, 68, 68, 0.8)',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      display: 'inline-block',
      width: 'fit-content',
      '@media (max-width: 480px)': {
        fontSize: '0.65rem',
        padding: '0.2rem 0.5rem',
        marginBottom: '0.3rem',
      },
    },
    newArrivalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '0.25rem',
      '@media (max-width: 768px)': {
        fontSize: '1.1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.9rem',
      },
    },
    newArrivalDesc: {
      fontSize: '0.875rem',
      color: '#EEEEEE',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
        marginBottom: '0.3rem',
      },
    },
    newArrivalButton: {
      color: '#FFFFFF',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
      borderBottom: '2px solid #FFFFFF',
      paddingBottom: '0.25rem',
      display: 'inline-block',
      width: 'fit-content',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '2rem',
      padding: '2rem 0',
      borderTop: '1px solid #E5E5E5',
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1.5rem',
        padding: '1.5rem 0',
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: '1fr',
        gap: '1rem',
        padding: '1rem 0',
      },
    },
    featureCard: {
      textAlign: 'center',
      '@media (max-width: 480px)': {
        padding: '0.5rem',
      },
    },
    featureIcon: {
      fontSize: '2.5rem',
      color: '#DB4444',
      marginBottom: '0.5rem',
      display: 'flex',
      justifyContent: 'center',
      '@media (max-width: 768px)': {
        fontSize: '2rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.75rem',
        marginBottom: '0.3rem',
      },
    },
    featureTitle: {
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.25rem',
      '@media (max-width: 480px)': {
        fontSize: '0.875rem',
      },
    },
    featureDescription: {
      fontSize: '0.875rem',
      color: '#999999',
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    viewAllContainer: {
      textAlign: 'center',
      marginTop: '2rem',
      '@media (max-width: 768px)': {
        marginTop: '1.5rem',
      },
      '@media (max-width: 480px)': {
        marginTop: '1rem',
      },
    },
    viewAllButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2.5rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.3s ease',
      '@media (max-width: 768px)': {
        padding: '0.5rem 2rem',
        fontSize: '0.875rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.4rem 1.5rem',
        fontSize: '0.75rem',
        width: '100%',
      },
    },
    loadingText: {
      textAlign: 'center',
      padding: '2rem 0',
      color: '#999999',
      '@media (max-width: 480px)': {
        padding: '1rem 0',
        fontSize: '0.875rem',
      },
    },
  };

  const handleNavHover = (e) => {
    e.target.style.backgroundColor = 'rgba(219, 68, 68, 0.8)';
  };

  const handleNavLeave = (e) => {
    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      
      <div style={styles.container}>
        {/* Sliding Banner Section */}
        <div style={styles.sliderContainer}>
          <div style={{
            ...styles.sliderWrapper,
            transform: 'translateX(-' + (currentSlide * 100) + '%)'
          }}>
            {slides.map((slide) => (
              <div key={slide.id} style={{
                ...styles.slide,
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)'
              }}>
                <div style={styles.slideContent}>
                  <h2 style={styles.slideTitle}>{slide.title}</h2>
                  <p style={styles.slideSubtitle}>{slide.subtitle}</p>
                  <Link to={slide.link} style={styles.slideButton}>
                    Shop Now
                  </Link>
                </div>
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  style={styles.slideImage}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <button 
            style={{...styles.sliderNav, ...styles.sliderNavLeft}}
            onMouseEnter={handleNavHover}
            onMouseLeave={handleNavLeave}
            onClick={prevSlide}
          >
            <FaChevronLeft />
          </button>
          <button 
            style={{...styles.sliderNav, ...styles.sliderNavRight}}
            onMouseEnter={handleNavHover}
            onMouseLeave={handleNavLeave}
            onClick={nextSlide}
          >
            <FaChevronRight />
          </button>

          <div style={styles.sliderDots}>
            {slides.map((_, index) => (
              <button
                key={index}
                style={{
                  ...styles.dot,
                  ...(currentSlide === index ? styles.dotActive : styles.dotInactive)
                }}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Flash Sales Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionSubtitle}>Today's</h2>
              <h1 style={styles.sectionTitle}>Flash Sales</h1>
            </div>
            <div style={styles.timerContainer}>
              <div style={styles.timerBlock}>
                <span style={styles.timerNumber}>{String(countdown.days).padStart(2, '0')}</span>
                <span style={styles.timerLabel}>Days</span>
              </div>
              <span style={styles.timerSeparator}>:</span>
              <div style={styles.timerBlock}>
                <span style={styles.timerNumber}>{String(countdown.hours).padStart(2, '0')}</span>
                <span style={styles.timerLabel}>Hours</span>
              </div>
              <span style={styles.timerSeparator}>:</span>
              <div style={styles.timerBlock}>
                <span style={styles.timerNumber}>{String(countdown.minutes).padStart(2, '0')}</span>
                <span style={styles.timerLabel}>Mins</span>
              </div>
              <span style={styles.timerSeparator}>:</span>
              <div style={styles.timerBlock}>
                <span style={styles.timerNumber}>{String(countdown.seconds).padStart(2, '0')}</span>
                <span style={styles.timerLabel}>Secs</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingText}>Loading products...</div>
          ) : flashSales.length === 0 ? (
            <div style={styles.loadingText}>No flash sales available</div>
          ) : (
            <div style={styles.productGrid}>
              {flashSales.slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatPrice={formatPrice}
                  onAddToCart={handleAddToCart}
                  discount={getDiscountPercentage(product)}
                  renderStars={renderStars}
                />
              ))}
            </div>
          )}

          <div style={styles.viewAllContainer}>
            <Link to="/shop" style={styles.viewAllButton}>View All Products</Link>
          </div>
        </section>

        {/* Categories Section */}
        <section style={{ ...styles.section, borderTop: '1px solid #E5E5E5' }}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Browse By Category</h2>
            <div style={styles.categoryGrid}>
              {[
                { name: 'Yarn & Thread', icon: <FaYarn size={28} />, slug: 'yarn-thread' },
                { name: 'Crochet Hooks', icon: <FaPuzzlePiece size={28} />, slug: 'crochet-hooks' },
                { name: 'Patterns', icon: <FaBook size={28} />, slug: 'patterns-kits' },
                { name: 'Finished Items', icon: <FaGift size={28} />, slug: 'finished-products' },
                { name: 'Accessories', icon: <FaGem size={28} />, slug: 'accessories' },
                { name: 'Bundles', icon: <FaBox size={28} />, slug: 'bundles-deals' },
              ].map((cat, index) => (
                <Link key={index} to={'/shop?category=' + cat.slug} style={styles.categoryCard}>
                  <span style={styles.categoryIcon}>{cat.icon}</span>
                  <span style={styles.categoryName}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best Selling Products */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h1 style={styles.sectionTitle}>Best Selling Products</h1>
          </div>
          {loading ? (
            <div style={styles.loadingText}>Loading products...</div>
          ) : bestSelling.length === 0 ? (
            <div style={styles.loadingText}>No products available</div>
          ) : (
            <div style={styles.productGrid}>
              {bestSelling.slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatPrice={formatPrice}
                  onAddToCart={handleAddToCart}
                  discount={getDiscountPercentage(product)}
                  renderStars={renderStars}
                />
              ))}
            </div>
          )}
        </section>

        {/* Enhance Your Music Experience Banner */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.musicBanner}>
              <div style={styles.musicBannerContent}>
                <div style={styles.musicBannerText}>
                  <span style={styles.musicBannerBadge}>Enhance Your Crochet Experience</span>
                  <h2 style={styles.musicBannerTitle}>Premium Crochet Kits</h2>
                  <p style={styles.musicBannerDescription}>Everything you need to start your crochet journey</p>
                </div>
                <Link to="/shop" style={styles.musicBannerButton}>Buy Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Our Products */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h1 style={styles.sectionTitle}>Explore Our Products</h1>
          </div>
          {loading ? (
            <div style={styles.loadingText}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={styles.loadingText}>No products available</div>
          ) : (
            <div style={styles.productGrid}>
              {products.slice(0, 8).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatPrice={formatPrice}
                  onAddToCart={handleAddToCart}
                  discount={getDiscountPercentage(product)}
                  renderStars={renderStars}
                />
              ))}
            </div>
          )}
          <div style={styles.viewAllContainer}>
            <Link to="/shop" style={styles.viewAllButton}>View All Products</Link>
          </div>
        </section>

        {/* New Arrival Section - With Local Images */}
        <section style={{ ...styles.section, borderTop: '1px solid #E5E5E5' }}>
          <div style={styles.sectionHeader}>
            <h1 style={styles.sectionTitle}>New Arrival</h1>
          </div>
          <div style={styles.newArrivalSection}>
            {/* Main large banner */}
            <div style={{
              ...styles.newArrivalMain,
              backgroundImage: 'url(' + newArrivalMain + ')'
            }}>
              <div style={styles.newArrivalMainOverlay}></div>
              <div style={styles.newArrivalContent}>
                <div>
                  <span style={styles.newArrivalTag}>Featured</span>
                  <h2 style={styles.newArrivalTitle}>Women's Collections</h2>
                  <p style={styles.newArrivalDesc}>Featured women's collections</p>
                  <p style={styles.newArrivalDesc}>Get your own collection</p>
                </div>
                <Link to="/shop" style={styles.newArrivalButton}>Shop Now</Link>
              </div>
            </div>

            {/* Top right cards */}
            <div style={{
              ...styles.newArrivalCard,
              backgroundImage: 'url(' + newArrivalBlanket + ')'
            }}>
              <div style={styles.newArrivalCardOverlay}></div>
              <div style={styles.newArrivalCardContent}>
                <div>
                  <span style={styles.newArrivalTag}>Featured</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>Crochet Blankets</h3>
                  <p style={styles.newArrivalDesc}>Warm and cozy</p>
                </div>
                <Link to="/shop" style={styles.newArrivalButton}>Shop Now</Link>
              </div>
            </div>

            <div style={{
              ...styles.newArrivalCard,
              backgroundImage: 'url(' + newArrivalAmigurumi + ')'
            }}>
              <div style={styles.newArrivalCardOverlay}></div>
              <div style={styles.newArrivalCardContent}>
                <div>
                  <span style={styles.newArrivalTag}>Featured</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>Amigurumi Toys</h3>
                  <p style={styles.newArrivalDesc}>Cute handmade toys</p>
                </div>
                <Link to="/shop" style={styles.newArrivalButton}>Shop Now</Link>
              </div>
            </div>

            {/* Bottom right cards */}
            <div style={{
              ...styles.newArrivalCard,
              backgroundImage: 'url(' + newArrivalScarf + ')'
            }}>
              <div style={styles.newArrivalCardOverlay}></div>
              <div style={styles.newArrivalCardContent}>
                <div>
                  <span style={styles.newArrivalTag}>Featured</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>Scarves & Wraps</h3>
                  <p style={styles.newArrivalDesc}>Stylish accessories</p>
                </div>
                <Link to="/shop" style={styles.newArrivalButton}>Shop Now</Link>
              </div>
            </div>

            <div style={{
              ...styles.newArrivalCard,
              backgroundImage: 'url(' + newArrivalDecor + ')'
            }}>
              <div style={styles.newArrivalCardOverlay}></div>
              <div style={styles.newArrivalCardContent}>
                <div>
                  <span style={styles.newArrivalTag}>Featured</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>Home Decor</h3>
                  <p style={styles.newArrivalDesc}>Beautiful home items</p>
                </div>
                <Link to="/shop" style={styles.newArrivalButton}>Shop Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ ...styles.section, borderTop: '1px solid #E5E5E5' }}>
          <div style={styles.container}>
            <div style={styles.featuresGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><FaTruck /></div>
                <h3 style={styles.featureTitle}>Free and Fast Delivery</h3>
                <p style={styles.featureDescription}>Free delivery for all orders over KES 20,000</p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><FaHeadset /></div>
                <h3 style={styles.featureTitle}>24/7 Customer Service</h3>
                <p style={styles.featureDescription}>Friendly 24/7 customer support</p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><FaShieldAlt /></div>
                <h3 style={styles.featureTitle}>Money Back Guarantee</h3>
                <p style={styles.featureDescription}>We return money within 30 days</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

// Product Card Component with image caching and responsive styles
const ProductCard = ({ product, formatPrice, onAddToCart, discount, renderStars }) => {
  const imageUrl = getImageUrl(product.images?.[0]?.image_url);
  const discountPercentage = discount || 0;

  const styles = {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      cursor: 'pointer',
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

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div style={styles.card}>
      <Link to={'/product/' + product.slug} style={{ textDecoration: 'none' }}>
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
          <button style={styles.wishlistBtn}><FaHeart /></button>
          
          {discountPercentage > 0 && (
            <span style={styles.discountBadge}>-{discountPercentage}% OFF</span>
          )}
        </div>
      </Link>
      <div style={styles.info}>
        <Link to={'/product/' + product.slug} style={styles.name}>
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

export default HomePage;