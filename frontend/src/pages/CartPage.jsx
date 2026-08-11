import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, total, getTotalItems } = useCart();
  const [couponCode, setCouponCode] = useState('');

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
    continueButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
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
    },
    td: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      color: '#000000',
    },
    productCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    productImage: {
      width: '64px',
      height: '64px',
      objectFit: 'cover',
      borderRadius: '6px',
      backgroundColor: '#F5F5F5',
    },
    productName: {
      fontWeight: '500',
      color: '#000000',
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    qtyButton: {
      padding: '0.25rem 0.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    qtyText: {
      minWidth: '32px',
      textAlign: 'center',
      fontWeight: '500',
    },
    subtotalText: {
      fontWeight: '700',
      color: '#000000',
    },
    deleteButton: {
      color: '#DC2626',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    actionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    actionButton: {
      padding: '0.5rem 1.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      background: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      color: '#000000',
      transition: 'background-color 0.3s ease',
    },
    checkoutSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      marginTop: '2rem',
    },
    couponSection: {
      display: 'flex',
      gap: '1rem',
    },
    couponInput: {
      flex: 1,
      padding: '0.5rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    applyButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
    },
    totalsCard: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '300px',
    },
    totalsTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    totalsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem 0',
    },
    totalsLabel: {
      color: '#666666',
    },
    totalsValue: {
      fontWeight: '600',
      color: '#000000',
    },
    totalsDivider: {
      border: 'none',
      borderTop: '1px solid #E5E5E5',
      margin: '0.75rem 0',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: '700',
      fontSize: '1.1rem',
      paddingTop: '0.5rem',
    },
    checkoutButton: {
      display: 'block',
      width: '100%',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      textAlign: 'center',
      padding: '0.75rem',
      borderRadius: '6px',
      textDecoration: 'none',
      marginTop: '1rem',
      transition: 'background-color 0.3s ease',
    },
    freeShipping: {
      color: '#16A34A',
      fontWeight: '600',
    },
    // New styles matching the image design
    totalsValueBold: {
      fontWeight: '700',
      color: '#000000',
    },
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

  const handleApplyHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleApplyLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleCheckoutHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleCheckoutLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleActionHover = (e) => {
    e.target.style.backgroundColor = '#F5F5F5';
  };

  const handleActionLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  const handleDeleteHover = (e) => {
    e.target.style.color = '#B91C1C';
  };

  const handleDeleteLeave = (e) => {
    e.target.style.color = '#DC2626';
  };

  const handleQtyHover = (e) => {
    e.target.style.backgroundColor = '#F5F5F5';
  };

  const handleQtyLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
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
          <span style={styles.breadcrumbCurrent}>Cart</span>
        </div>

        {cartItems.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaShoppingCart style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>Your cart is empty</h2>
            <p style={styles.emptyText}>Start shopping to add items to your cart</p>
            <Link 
              to="/shop" 
              style={styles.continueButton}
              onMouseEnter={handleCheckoutHover}
              onMouseLeave={handleCheckoutLeave}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Subtotal</th>
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => {
                      const imageUrl = getImageUrl(item.images?.[0]?.image_url);
                      return (
                        <tr key={item.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.productCell}>
                              <img 
                                src={imageUrl}
                                alt={item.name} 
                                style={styles.productImage}
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/80/80';
                                }}
                              />
                              <span style={styles.productName}>{item.name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{formatPrice(item.price)}</td>
                          <td style={styles.td}>
                            <div style={styles.quantityControls}>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={styles.qtyButton}
                                onMouseEnter={handleQtyHover}
                                onMouseLeave={handleQtyLeave}
                              >
                                <FaMinus size={12} />
                              </button>
                              <span style={styles.qtyText}>{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={styles.qtyButton}
                                onMouseEnter={handleQtyHover}
                                onMouseLeave={handleQtyLeave}
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.subtotalText}>{formatPrice(item.price * item.quantity)}</span>
                          </td>
                          <td style={styles.td}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              style={styles.deleteButton}
                              onMouseEnter={handleDeleteHover}
                              onMouseLeave={handleDeleteLeave}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.actionRow}>
              <Link 
                to="/shop" 
                style={styles.actionButton}
                onMouseEnter={handleActionHover}
                onMouseLeave={handleActionLeave}
              >
                Return To Shop
              </Link>
              <button 
                style={styles.actionButton}
                onMouseEnter={handleActionHover}
                onMouseLeave={handleActionLeave}
              >
                Update Cart
              </button>
            </div>

            <div style={styles.checkoutSection}>
              <div style={styles.couponSection}>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={styles.couponInput}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <button 
                  style={styles.applyButton}
                  onMouseEnter={handleApplyHover}
                  onMouseLeave={handleApplyLeave}
                >
                  Apply Coupon
                </button>
              </div>

              <div style={styles.totalsCard}>
                <h3 style={styles.totalsTitle}>Cart Total</h3>
                <div style={styles.totalsRow}>
                  <span style={styles.totalsLabel}>Subtotal:</span>
                  <span style={styles.totalsValue}>{formatPrice(total)}</span>
                </div>
                <div style={styles.totalsRow}>
                  <span style={styles.totalsLabel}>Shipping:</span>
                  <span style={styles.freeShipping}>Free</span>
                </div>
                <hr style={styles.totalsDivider} />
                <div style={styles.totalRow}>
                  <span>Total:</span>
                  <span style={styles.totalsValueBold}>{formatPrice(total)}</span>
                </div>
                <Link 
                  to="/checkout" 
                  style={styles.checkoutButton}
                  onMouseEnter={handleCheckoutHover}
                  onMouseLeave={handleCheckoutLeave}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;