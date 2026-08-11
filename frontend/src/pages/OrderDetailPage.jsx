import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaTruck, 
  FaTimesCircle,
  FaPrint
} from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  
  console.log('=== OrderDetailPage Debug ===');
  console.log('URL params id:', id);
  console.log('Full URL:', window.location.href);
  console.log('Location:', location);
  console.log('==============================');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    
    if (id) {
      fetchOrderDetail(id);
    } else {
      console.error('No order ID provided in URL params');
      setError('No order ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchOrderDetail = async (orderId) => {
    console.log('Fetching order with ID:', orderId);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setError('Please login to view order details');
        setLoading(false);
        return;
      }

      const url = `/api/orders/${orderId}`;
      console.log('Fetching from URL:', url);
      
      const response = await api.get(url, {
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order details response:', response.data);
      setOrder(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        setError('Order not found');
      } else if (error.response?.status === 401) {
        setError('Please login to view this order');
      } else {
        setError(error.response?.data?.error || 'Failed to fetch order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#F59E0B', icon: <FaClock size={16} />, text: 'Pending' },
      'processing': { color: '#3B82F6', icon: <FaClock size={16} />, text: 'Processing' },
      'shipped': { color: '#8B5CF6', icon: <FaTruck size={16} />, text: 'Shipped' },
      'delivered': { color: '#22C55E', icon: <FaCheckCircle size={16} />, text: 'Delivered' },
      'cancelled': { color: '#DC2626', icon: <FaTimesCircle size={16} />, text: 'Cancelled' }
    };
    return badges[status] || badges['pending'];
  };

  const getPaymentBadge = (status) => {
    const badges = {
      'pending': { color: '#F59E0B', text: 'Pending' },
      'paid': { color: '#22C55E', text: 'Paid' },
      'failed': { color: '#DC2626', text: 'Failed' },
      'refunded': { color: '#8B5CF6', text: 'Refunded' }
    };
    return badges[status] || badges['pending'];
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
      minHeight: '60vh',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '4rem 0',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '4px solid #E5E5E5',
      borderTop: '4px solid #DB4444',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      marginTop: '1rem',
      color: '#666666',
    },
    errorBox: {
      textAlign: 'center',
      padding: '4rem 0',
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    errorText: {
      color: '#666666',
      marginBottom: '1.5rem',
    },
    backButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
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
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    orderNumber: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
    },
    orderDate: {
      color: '#666666',
      fontSize: '0.95rem',
    },
    headerRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.5rem',
    },
    orderTotal: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#DB4444',
    },
    badges: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 1rem',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    summaryCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
    },
    summaryItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    summaryLabel: {
      fontSize: '0.75rem',
      color: '#999999',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    summaryValue: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#000000',
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
    },
    itemsSection: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#000000',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #EEEEEE',
      backgroundColor: '#FAFAFA',
    },
    itemRow: {
      display: 'grid',
      gridTemplateColumns: '3fr 1fr 1fr 1fr',
      padding: '0.75rem 1.5rem',
      borderBottom: '1px solid #F0F0F0',
      fontSize: '0.95rem',
      alignItems: 'center',
    },
    itemHeader: {
      fontWeight: '600',
      color: '#666666',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: '#FAFAFA',
    },
    itemName: {
      color: '#000000',
    },
    itemPrice: {
      color: '#000000',
      fontWeight: '500',
      textAlign: 'right',
    },
    itemQty: {
      color: '#666666',
      textAlign: 'center',
    },
    itemTotal: {
      color: '#000000',
      fontWeight: '600',
      textAlign: 'right',
    },
    summarySidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    summaryCardSide: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      padding: '1.5rem',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem 0',
      fontSize: '0.95rem',
    },
    summaryRowTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      fontSize: '1.1rem',
      fontWeight: '700',
      borderTop: '2px solid #EEEEEE',
      marginTop: '0.5rem',
    },
    summaryLabelSide: {
      color: '#666666',
    },
    summaryValueSide: {
      color: '#000000',
      fontWeight: '500',
    },
    summaryTotal: {
      color: '#DB4444',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1rem',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      background: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      color: '#000000',
      transition: 'background-color 0.3s ease',
    },
    shippingAddress: {
      marginTop: '0.5rem',
      color: '#666666',
      fontSize: '0.95rem',
      lineHeight: '1.6',
    },
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading order details...</p>
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

  if (error || !order) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.errorBox}>
            <h2 style={styles.errorTitle}>Order Not Found</h2>
            <p style={styles.errorText}>{error || 'The order you are looking for does not exist.'}</p>
            <Link to="/orders" style={styles.backButton}>Back to Orders</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const paymentBadge = getPaymentBadge(order.payment_status);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>Home</Link>
          <span>/</span>
          <Link to="/orders" style={styles.breadcrumbLink}>My Orders</Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>Order #{order.order_number}</span>
        </div>

        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.orderNumber}>Order #{order.order_number}</h1>
            <span style={styles.orderDate}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.orderTotal}>{formatPrice(order.total_amount)}</span>
            <div style={styles.badges}>
              <span style={{
                ...styles.badge,
                backgroundColor: statusBadge.color + '20',
                color: statusBadge.color
              }}>
                {statusBadge.icon} {statusBadge.text}
              </span>
              <span style={{
                ...styles.badge,
                backgroundColor: paymentBadge.color + '20',
                color: paymentBadge.color
              }}>
                {paymentBadge.text}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Order Status</span>
            <span style={styles.summaryValue}>{statusBadge.text}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Payment Status</span>
            <span style={styles.summaryValue}>{paymentBadge.text}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Payment Method</span>
            <span style={styles.summaryValue}>{order.payment_method || 'Not specified'}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Items</span>
            <span style={styles.summaryValue}>
              {order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} items
            </span>
          </div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.itemsSection}>
            <div style={styles.sectionTitle}>Order Items</div>
            <div style={styles.itemRow}>
              <span style={styles.itemHeader}>Product</span>
              <span style={styles.itemHeader}>Price</span>
              <span style={styles.itemHeader}>Qty</span>
              <span style={styles.itemHeader}>Total</span>
            </div>
            {order.items && order.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={styles.itemName}>{item.product_name}</span>
                <span style={styles.itemPrice}>{formatPrice(item.price)}</span>
                <span style={styles.itemQty}>{item.quantity}</span>
                <span style={styles.itemTotal}>{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          <div style={styles.summarySidebar}>
            <div style={styles.summaryCardSide}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabelSide}>Subtotal</span>
                <span style={styles.summaryValueSide}>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabelSide}>Shipping</span>
                <span style={styles.summaryValueSide}>{formatPrice(order.shipping_amount || 0)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabelSide}>Tax</span>
                <span style={styles.summaryValueSide}>{formatPrice(order.tax_amount || 0)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabelSide}>Discount</span>
                  <span style={styles.summaryValueSide}>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div style={styles.summaryRowTotal}>
                <span>Total</span>
                <span style={styles.summaryTotal}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <div style={styles.summaryCardSide}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Shipping Address</h3>
              <div style={styles.shippingAddress}>
                {order.shipping_address && order.shipping_address.split(',').map((line, i) => (
                  <div key={i}>{line.trim()}</div>
                ))}
              </div>
            </div>

            <div style={styles.actionButtons}>
              <Link to="/orders" style={styles.actionButton}>
                <FaArrowLeft /> Back to Orders
              </Link>
              <button style={styles.actionButton}>
                <FaPrint /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetailPage;