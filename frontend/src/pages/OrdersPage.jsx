import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaEye, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      const response = await api.get('/api/orders/my-orders', {
        headers: { Authorization: 'Bearer ' + token }
      });

      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.error || 'Failed to fetch orders');
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
      'pending': { color: '#F59E0B', icon: <FaClock size={14} />, text: 'Pending' },
      'processing': { color: '#3B82F6', icon: <FaClock size={14} />, text: 'Processing' },
      'shipped': { color: '#8B5CF6', icon: <FaTruck size={14} />, text: 'Shipped' },
      'delivered': { color: '#22C55E', icon: <FaCheckCircle size={14} />, text: 'Delivered' },
      'cancelled': { color: '#DC2626', icon: <FaTimesCircle size={14} />, text: 'Cancelled' }
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

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
      minHeight: '60vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#999999',
    },
    breadcrumbLink: {
      color: '#999999',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    breadcrumbCurrent: {
      color: '#000000',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '4rem 0',
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
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '1rem',
      borderRadius: '6px',
      textAlign: 'center',
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '4rem 0',
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
    shopButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
    },
    orderCard: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'box-shadow 0.3s ease',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '0.75rem',
    },
    orderInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    orderNumber: {
      fontWeight: '600',
      color: '#000000',
      fontSize: '1rem',
    },
    orderDate: {
      color: '#666666',
      fontSize: '0.875rem',
    },
    orderTotal: {
      fontWeight: '700',
      color: '#000000',
      fontSize: '1.1rem',
    },
    orderBadges: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    orderItems: {
      borderTop: '1px solid #EEEEEE',
      paddingTop: '0.75rem',
      marginTop: '0.75rem',
    },
    orderItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.25rem 0',
      fontSize: '0.875rem',
    },
    orderItemName: {
      color: '#333333',
    },
    orderItemQty: {
      color: '#666666',
    },
    orderItemPrice: {
      color: '#000000',
      fontWeight: '500',
    },
    orderFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid #EEEEEE',
    },
    viewButton: {
      color: '#DB4444',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'color 0.3s ease',
    },
  };

  const handleBreadcrumbHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleBreadcrumbLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleShopHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleShopLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading your orders...</p>
          </div>
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
          <span style={styles.breadcrumbCurrent}>My Orders</span>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>My Orders</h1>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaShoppingBag style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>No Orders Yet</h2>
            <p style={styles.emptyText}>You haven't placed any orders yet. Start shopping!</p>
            <Link 
              to="/shop" 
              style={styles.shopButton}
              onMouseEnter={handleShopHover}
              onMouseLeave={handleShopLeave}
            >
              Start Shopping <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentBadge(order.payment_status);

              return (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div style={styles.orderInfo}>
                      <span style={styles.orderNumber}>Order #{order.order_number}</span>
                      <span style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div>
                      <span style={styles.orderTotal}>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  <div style={styles.orderBadges}>
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
                    <span style={{
                      ...styles.badge,
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280'
                    }}>
                      {order.payment_method || 'Payment Pending'}
                    </span>
                  </div>

                  <div style={styles.orderItems}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={styles.orderItem}>
                        <span style={styles.orderItemName}>
                          {item.product_name} 
                          <span style={styles.orderItemQty}> x {item.quantity}</span>
                        </span>
                        <span style={styles.orderItemPrice}>{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.orderFooter}>
                    <span style={{ fontSize: '0.875rem', color: '#666666' }}>
                      {order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} items
                    </span>
                    <Link 
                      to={'/orders/' + order.id} 
                      style={styles.viewButton}
                      onMouseEnter={(e) => e.target.style.color = '#B33A3A'}
                      onMouseLeave={(e) => e.target.style.color = '#DB4444'}
                    >
                      View Details <FaEye />
                    </Link>
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

export default OrdersPage;