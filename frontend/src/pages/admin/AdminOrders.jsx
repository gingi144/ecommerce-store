import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes, FaTruck, FaFilter, FaArrowLeft, FaPrint } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/admin/orders/${orderId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', text: '#D97706' },
      processing: { bg: '#DBEAFE', text: '#2563EB' },
      shipped: { bg: '#EDE9FE', text: '#7C3AED' },
      delivered: { bg: '#D1FAE5', text: '#059669' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getStatusBadgeStyle = (status) => {
    const colors = getStatusColor(status);
    return {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: colors.bg,
      color: colors.text,
      textTransform: 'capitalize',
    };
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      margin: 0,
    },
    filterContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterLabel: {
      fontSize: '0.875rem',
      color: '#666666',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    filterSelect: {
      padding: '0.4rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
    },
    loadingText: {
      textAlign: 'center',
      padding: '2rem',
      color: '#666666',
    },
    noData: {
      textAlign: 'center',
      padding: '2rem',
      color: '#999999',
    },
    tableCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#666666',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #E5E5E5',
      backgroundColor: '#FAFAFA',
    },
    tr: {
      borderBottom: '1px solid #F0F0F0',
      transition: 'background-color 0.2s ease',
    },
    td: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      color: '#000000',
    },
    orderNumber: {
      fontWeight: '600',
      color: '#000000',
    },
    customerName: {
      color: '#000000',
    },
    totalAmount: {
      fontWeight: '600',
      color: '#000000',
    },
    dateText: {
      color: '#666666',
      fontSize: '0.8rem',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    actionButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },
    actionView: {
      color: '#8B5CF6',
    },
    actionCheck: {
      color: '#16A34A',
    },
    actionTruck: {
      color: '#7C3AED',
    },
    actionTimes: {
      color: '#DC2626',
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '2rem',
      position: 'relative',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #E5E5E5',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#999999',
      transition: 'color 0.3s ease',
    },
    orderDetailGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
    },
    orderInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    orderInfoRow: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.25rem 0',
    },
    orderInfoLabel: {
      fontWeight: '600',
      color: '#666666',
      minWidth: '120px',
    },
    orderInfoValue: {
      color: '#000000',
    },
    itemsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    itemsTh: {
      textAlign: 'left',
      padding: '0.5rem 0.75rem',
      backgroundColor: '#FAFAFA',
      borderBottom: '1px solid #E5E5E5',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#666666',
      textTransform: 'uppercase',
    },
    itemsTd: {
      padding: '0.5rem 0.75rem',
      borderBottom: '1px solid #F0F0F0',
      fontSize: '0.875rem',
      color: '#000000',
    },
    summaryCard: {
      backgroundColor: '#F9FAFB',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #EEEEEE',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.4rem 0',
      fontSize: '0.9rem',
    },
    summaryTotal: {
      fontWeight: '700',
      fontSize: '1.1rem',
      borderTop: '2px solid #E5E5E5',
      paddingTop: '0.5rem',
      marginTop: '0.5rem',
    },
    statusUpdateSection: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #E5E5E5',
    },
    statusButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    statusBtn: {
      padding: '0.3rem 0.75rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
    },
    statusBtnPending: {
      backgroundColor: '#FEF3C7',
      color: '#D97706',
    },
    statusBtnProcessing: {
      backgroundColor: '#DBEAFE',
      color: '#2563EB',
    },
    statusBtnShipped: {
      backgroundColor: '#EDE9FE',
      color: '#7C3AED',
    },
    statusBtnDelivered: {
      backgroundColor: '#D1FAE5',
      color: '#059669',
    },
    statusBtnCancelled: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    printButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      fontSize: '0.8rem',
      color: '#000000',
      transition: 'background-color 0.3s ease',
    },
  };

  const handleFilterFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.1)';
  };

  const handleFilterBlur = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.boxShadow = 'none';
  };

  const handleRowHover = (e) => {
    e.currentTarget.style.backgroundColor = '#FAFAFA';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleActionHover = (e, color) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
  };

  const handleActionLeave = (e, color) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <div style={styles.pageContainer}>
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Orders</h1>
            <div style={styles.filterContainer}>
              <span style={styles.filterLabel}>
                <FaFilter /> Filter:
              </span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
                onFocus={handleFilterFocus}
                onBlur={handleFilterBlur}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingText}>Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={styles.noData}>
              {orders.length === 0 ? 'No orders found' : 'No orders match the selected filter'}
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order #</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr 
                        key={order.id || Math.random()} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>
                          <span style={styles.orderNumber}>{order.order_number || 'N/A'}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.customerName}>
                            {order.first_name || ''} {order.last_name || ''}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.totalAmount}>{formatPrice(order.total_amount)}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(order.status)}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dateText}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button 
                              style={{...styles.actionButton, ...styles.actionView}}
                              onClick={() => viewOrderDetails(order)}
                              onMouseEnter={(e) => handleActionHover(e, '#6D28D9')}
                              onMouseLeave={(e) => handleActionLeave(e, '#8B5CF6')}
                              title="View Order Details"
                            >
                              <FaEye />
                            </button>
                            
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                style={{...styles.actionButton, ...styles.actionCheck}}
                                onMouseEnter={(e) => handleActionHover(e, '#15803D')}
                                onMouseLeave={(e) => handleActionLeave(e, '#16A34A')}
                                title="Mark as Processing"
                              >
                                <FaCheck />
                              </button>
                            )}
                            
                            {order.status === 'processing' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                style={{...styles.actionButton, ...styles.actionTruck}}
                                onMouseEnter={(e) => handleActionHover(e, '#5B21B6')}
                                onMouseLeave={(e) => handleActionLeave(e, '#7C3AED')}
                                title="Mark as Shipped"
                              >
                                <FaTruck />
                              </button>
                            )}
                            
                            {order.status === 'shipped' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                style={{...styles.actionButton, ...styles.actionCheck}}
                                onMouseEnter={(e) => handleActionHover(e, '#15803D')}
                                onMouseLeave={(e) => handleActionLeave(e, '#16A34A')}
                                title="Mark as Delivered"
                              >
                                <FaCheck />
                              </button>
                            )}
                            
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                style={{...styles.actionButton, ...styles.actionTimes}}
                                onMouseEnter={(e) => handleActionHover(e, '#B91C1C')}
                                onMouseLeave={(e) => handleActionLeave(e, '#DC2626')}
                                title="Cancel Order"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div style={styles.modalOverlay} onClick={closeOrderDetails}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Order #{selectedOrder.order_number}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button style={styles.printButton} onClick={() => window.print()}>
                  <FaPrint /> Print
                </button>
                <button style={styles.closeButton} onClick={closeOrderDetails}>
                  ✕
                </button>
              </div>
            </div>

            <div style={styles.orderDetailGrid}>
              <div>
                {/* Order Items */}
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Order Items</h3>
                <table style={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={styles.itemsTh}>Product</th>
                      <th style={styles.itemsTh}>Qty</th>
                      <th style={styles.itemsTh}>Price</th>
                      <th style={styles.itemsTh}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td style={styles.itemsTd}>{item.product_name}</td>
                        <td style={styles.itemsTd}>{item.quantity}</td>
                        <td style={styles.itemsTd}>{formatPrice(item.price)}</td>
                        <td style={styles.itemsTd}>{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Status Update */}
                <div style={styles.statusUpdateSection}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Update Status</h4>
                  <div style={styles.statusButtons}>
                    {selectedOrder.status !== 'pending' && (
                      <button 
                        style={{...styles.statusBtn, ...styles.statusBtnPending}}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'pending');
                          closeOrderDetails();
                        }}
                      >
                        Pending
                      </button>
                    )}
                    {selectedOrder.status !== 'processing' && (
                      <button 
                        style={{...styles.statusBtn, ...styles.statusBtnProcessing}}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'processing');
                          closeOrderDetails();
                        }}
                      >
                        Processing
                      </button>
                    )}
                    {selectedOrder.status !== 'shipped' && (
                      <button 
                        style={{...styles.statusBtn, ...styles.statusBtnShipped}}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'shipped');
                          closeOrderDetails();
                        }}
                      >
                        Shipped
                      </button>
                    )}
                    {selectedOrder.status !== 'delivered' && (
                      <button 
                        style={{...styles.statusBtn, ...styles.statusBtnDelivered}}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'delivered');
                          closeOrderDetails();
                        }}
                      >
                        Delivered
                      </button>
                    )}
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                      <button 
                        style={{...styles.statusBtn, ...styles.statusBtnCancelled}}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'cancelled');
                          closeOrderDetails();
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div style={styles.summaryCard}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Order Summary</h4>
                  
                  <div style={styles.orderInfo}>
                    <div style={styles.orderInfoRow}>
                      <span style={styles.orderInfoLabel}>Status:</span>
                      <span style={getStatusBadgeStyle(selectedOrder.status)}>
                        {selectedOrder.status || 'pending'}
                      </span>
                    </div>
                    <div style={styles.orderInfoRow}>
                      <span style={styles.orderInfoLabel}>Date:</span>
                      <span style={styles.orderInfoValue}>
                        {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.orderInfoRow}>
                      <span style={styles.orderInfoLabel}>Payment:</span>
                      <span style={styles.orderInfoValue}>
                        {selectedOrder.payment_method || 'N/A'}
                      </span>
                    </div>
                    <div style={styles.orderInfoRow}>
                      <span style={styles.orderInfoLabel}>Payment Status:</span>
                      <span style={styles.orderInfoValue}>
                        {selectedOrder.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '0.75rem 0' }} />

                  <div style={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Shipping</span>
                    <span>{formatPrice(selectedOrder.shipping_amount || 0)}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Tax</span>
                    <span>{formatPrice(selectedOrder.tax_amount || 0)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div style={styles.summaryRow}>
                      <span>Discount</span>
                      <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div style={styles.summaryTotal}>
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                  </div>

                  {/* Customer Info */}
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '0.75rem 0' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>Customer</h4>
                  <div style={styles.orderInfoRow}>
                    <span style={styles.orderInfoLabel}>Name:</span>
                    <span style={styles.orderInfoValue}>
                      {selectedOrder.first_name || ''} {selectedOrder.last_name || ''}
                    </span>
                  </div>
                  <div style={styles.orderInfoRow}>
                    <span style={styles.orderInfoLabel}>Email:</span>
                    <span style={styles.orderInfoValue}>{selectedOrder.email || 'N/A'}</span>
                  </div>

                  {/* Shipping Address */}
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '0.75rem 0' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>Shipping Address</h4>
                  <div style={styles.orderInfoValue} style={{ fontSize: '0.85rem', color: '#666666', lineHeight: '1.6' }}>
                    {selectedOrder.shipping_address || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
