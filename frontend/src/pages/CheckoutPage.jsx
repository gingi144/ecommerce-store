import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/shared/SuccessModal';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

// M-PESA Logo
const MpesaLogo = () => (
  <svg viewBox="0 0 24 24" width="45" height="28">
    <rect x="0" y="0" width="24" height="24" fill="#4CAF50" rx="3"/>
    <text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">M-PESA</text>
  </svg>
);

const CheckoutPage = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [expandedSection, setExpandedSection] = useState('billing');

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate M-PESA phone number
      if (!mpesaPhone) {
        setError('Please enter your M-PESA phone number');
        setLoading(false);
        return;
      }

      const subtotal = total;
      const shipping = 200;
      const vat = subtotal * 0.08;
      const discount = couponDiscount || 0;
      const finalTotal = subtotal + shipping + vat - discount;

      // Create order
      const orderData = {
        shippingAddress: formData.address,
        billingAddress: formData.address,
        paymentMethod: 'M-PESA (via PayHero)',
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        mpesaPhone: mpesaPhone,
        couponCode: couponCode || null,
        subtotal: subtotal,
        shipping: shipping,
        vat: vat,
        discount: discount,
        total: finalTotal,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryNotes: formData.notes
      };

      // Create order
      const orderResponse = await api.post('/api/orders', orderData, {
        headers: { Authorization: 'Bearer ' + token }
      });

      const orderId = orderResponse.data.id;

      // Initiate PayHero payment
      const paymentResponse = await api.post('/api/payments/payhero/initiate', {
        orderId: orderId,
        amount: finalTotal,
        phoneNumber: mpesaPhone,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });

      if (paymentResponse.data.success) {
        localStorage.setItem('payment_tracking_id', paymentResponse.data.tracking_id);
        localStorage.setItem('pending_order_id', orderId);
        clearCart();
        window.location.href = paymentResponse.data.redirect_url;
      } else {
        setError(paymentResponse.data.error || 'Payment initiation failed');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div style={styles.emptyContainer}>
          <h2 style={styles.emptyTitle}>Your cart is empty</h2>
          <Link to="/shop" style={styles.emptyButton}>
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = total;
  const shipping = 200;
  const vat = subtotal * 0.08;
  const discount = couponDiscount || 0;
  const finalTotal = subtotal + shipping + vat - discount;

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '4rem 1rem',
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    emptyButton: {
      display: 'inline-block',
      backgroundColor: '#000000',
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
    checkoutLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: '2rem',
    },
    leftSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    sectionCard: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      cursor: 'pointer',
      backgroundColor: '#FAFAFA',
      borderBottom: '1px solid #EEEEEE',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#000000',
    },
    sectionNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderRadius: '50%',
      fontSize: '0.75rem',
      fontWeight: '700',
      marginRight: '0.5rem',
    },
    sectionContent: {
      padding: '1.5rem',
    },
    mpesaDetails: {
      backgroundColor: '#F9FAFB',
      padding: '1rem',
      borderRadius: '6px',
    },
    mpesaText: {
      fontSize: '0.85rem',
      color: '#666666',
      marginBottom: '0.5rem',
      lineHeight: '1.5',
    },
    mpesaInput: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '250px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      marginBottom: '0.75rem',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#000000',
    },
    input: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
    },
    notesInput: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '60px',
    },
    orderSummary: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #EEEEEE',
      position: 'sticky',
      top: '80px',
      height: 'fit-content',
    },
    summaryTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    orderItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.4rem 0',
      fontSize: '0.9rem',
      borderBottom: '1px solid #F0F0F0',
    },
    orderItemName: {
      color: '#000000',
    },
    orderItemQty: {
      color: '#666666',
    },
    orderItemPrice: {
      fontWeight: '500',
      color: '#000000',
    },
    divider: {
      border: 'none',
      borderTop: '1px solid #E5E5E5',
      margin: '0.5rem 0',
    },
    couponSection: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
    couponInput: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    applyButton: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.3rem 0',
      fontSize: '0.9rem',
    },
    summaryLabel: {
      color: '#666666',
    },
    summaryValue: {
      fontWeight: '500',
      color: '#000000',
    },
    discountValue: {
      color: '#DB4444',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      fontSize: '1.1rem',
      fontWeight: '700',
      borderTop: '2px solid #EEEEEE',
      marginTop: '0.5rem',
    },
    totalAmount: {
      color: '#DB4444',
    },
    payButton: {
      width: '100%',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '0.5rem',
      transition: 'background-color 0.3s ease',
    },
    payButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    errorBox: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    mpesaLogoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
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
    e.target.style.backgroundColor = '#333333';
  };

  const handleApplyLeave = (e) => {
    e.target.style.backgroundColor = '#000000';
  };

  const handlePayHover = (e) => {
    if (!loading) e.target.style.backgroundColor = '#B33A3A';
  };

  const handlePayLeave = (e) => {
    if (!loading) e.target.style.backgroundColor = '#DB4444';
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>Home</Link>
          <span>/</span>
          <Link to="/cart" style={styles.breadcrumbLink}>Cart</Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>Checkout</span>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.checkoutLayout}>
          <div style={styles.leftSection}>
            {/* Billing Details */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader} onClick={() => toggleSection('billing')}>
                <span style={styles.sectionTitle}>
                  <span style={styles.sectionNumber}>1</span> Billing Details
                </span>
                {expandedSection === 'billing' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'billing' && (
                <div style={styles.sectionContent}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>First Name *</label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        style={styles.input}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Last Name *</label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        style={styles.input}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number *</label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Address *</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      style={styles.input}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      required
                    />
                  </div>
                  <div style={styles.fullWidth}>
                    <label style={styles.label}>City *</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      style={styles.input}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      required
                    />
                  </div>
                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Order Notes (optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      style={styles.notesInput}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* M-PESA Payment */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader} onClick={() => toggleSection('payment')}>
                <span style={styles.sectionTitle}>
                  <span style={styles.sectionNumber}>2</span> M-PESA Payment
                </span>
                {expandedSection === 'payment' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'payment' && (
                <div style={styles.sectionContent}>
                  <div style={styles.mpesaLogoWrapper}>
                    <MpesaLogo />
                    <span style={{ fontWeight: '600', color: '#000000' }}>Pay with M-PESA</span>
                  </div>
                  <div style={styles.mpesaDetails}>
                    <p style={styles.mpesaText}>
                      By typing your number and selecting the pay button, you will receive a prompt to enter your M-PESA PIN and pay the total amount.
                    </p>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>M-PESA Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 0712345678"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        style={styles.mpesaInput}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary (Mobile) */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader} onClick={() => toggleSection('summary')}>
                <span style={styles.sectionTitle}>
                  <span style={styles.sectionNumber}>3</span> Order Summary
                </span>
                {expandedSection === 'summary' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'summary' && (
                <div style={styles.sectionContent}>
                  {cartItems.map(item => (
                    <div key={item.id} style={styles.orderItem}>
                      <span style={styles.orderItemName}>{item.name}</span>
                      <div>
                        <span style={styles.orderItemQty}>x {item.quantity}</span>
                        <span style={styles.orderItemPrice}> {formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Sidebar */}
          <div style={styles.orderSummary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>

            {cartItems.map(item => (
              <div key={item.id} style={styles.orderItem}>
                <span style={styles.orderItemName}>
                  {item.name} <span style={styles.orderItemQty}>x {item.quantity}</span>
                </span>
                <span style={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <hr style={styles.divider} />

            <div style={styles.couponSection}>
              <input
                type="text"
                placeholder="Enter code"
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
                Apply
              </button>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal</span>
              <span style={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Shipping</span>
              <span style={styles.summaryValue}>{formatPrice(shipping)}</span>
            </div>
            {discount > 0 && (
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Discount</span>
                <span style={styles.discountValue}>-{formatPrice(discount)}</span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>VAT</span>
              <span style={styles.summaryValue}>{formatPrice(vat)}</span>
            </div>

            <hr style={styles.divider} />

            <div style={styles.totalRow}>
              <span>Total</span>
              <span style={styles.totalAmount}>{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.payButton,
                ...(loading ? styles.payButtonDisabled : {})
              }}
              onMouseEnter={handlePayHover}
              onMouseLeave={handlePayLeave}
            >
              {loading ? 'Processing...' : 'Pay ' + formatPrice(finalTotal)}
            </button>
          </div>
        </div>
      </div>
      <Footer />

      <SuccessModal
        isOpen={showSuccess}
        title="Order Placed!"
        message="Your order has been placed successfully. You will receive a confirmation email shortly."
        onClose={() => setShowSuccess(false)}
        redirectPath="/orders"
      />
    </div>
  );
};

export default CheckoutPage;