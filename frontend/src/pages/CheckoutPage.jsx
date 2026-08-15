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

      const orderData = {
        shippingAddress: formData.address,
        billingAddress: formData.address,
        paymentMethod: 'M-PESA (via Paystack)',
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

      const orderResponse = await api.post('/api/orders', orderData, {
        headers: { Authorization: 'Bearer ' + token }
      });

      const orderId = orderResponse.data.id;

      const paymentResponse = await api.post(
        '/api/payments/paystack/initiate',
        {
          orderId,
          amount: finalTotal,
          phoneNumber: mpesaPhone,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        {
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
      );

      console.log('Paystack response:', paymentResponse.data);

      if (
        paymentResponse.data.success &&
        paymentResponse.data.authorization_url
      ) {
        localStorage.setItem(
          'payment_reference',
          paymentResponse.data.reference
        );
        localStorage.setItem(
          'pending_order_id',
          orderId
        );
        clearCart();
        window.location.href = paymentResponse.data.authorization_url;
      } else {
        setError(
          paymentResponse.data.error ||
          'Unable to initialize Paystack payment.'
        );
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
      <>
        <style>{`
          .checkout-empty-container {
            text-align: center;
            padding: 4rem 1rem;
          }
          .checkout-empty-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000000;
            margin-bottom: 1rem;
          }
          .checkout-empty-button {
            display: inline-block;
            background-color: #000000;
            color: #FFFFFF;
            padding: 0.75rem 2rem;
            border-radius: 6px;
            text-decoration: none;
            transition: background-color 0.3s ease;
          }
          .checkout-empty-button:hover {
            background-color: #333333;
          }
        `}</style>
        <Navbar />
        <div className="checkout-empty-container">
          <h2 className="checkout-empty-title">Your cart is empty</h2>
          <Link to="/shop" className="checkout-empty-button">
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = total;
  const shipping = 200;
  const vat = subtotal * 0.08;
  const discount = couponDiscount || 0;
  const finalTotal = subtotal + shipping + vat - discount;

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Container ----- */
        .checkout-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        /* ----- Breadcrumb ----- */
        .checkout-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .checkout-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .checkout-breadcrumb a:hover {
          color: #DB4444;
        }
        .checkout-breadcrumb-current {
          color: #000000;
        }

        /* ----- Layout ----- */
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }
        .checkout-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ----- Section Cards ----- */
        .checkout-section {
          background-color: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }
        .checkout-section:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .checkout-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          cursor: pointer;
          background-color: #FAFAFA;
          border-bottom: 1px solid #EEEEEE;
          transition: background-color 0.3s ease;
        }
        .checkout-section-header:hover {
          background-color: #F5F5F5;
        }
        .checkout-section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #000000;
        }
        .checkout-section-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #000000;
          color: #FFFFFF;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          margin-right: 0.5rem;
        }
        .checkout-section-content {
          padding: 1.5rem;
        }

        /* ----- Form ----- */
        .checkout-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .checkout-full-width {
          grid-column: 1 / -1;
        }
        .checkout-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.75rem;
        }
        .checkout-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #000000;
        }
        .checkout-input {
          padding: 0.6rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
          width: 100%;
        }
        .checkout-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .checkout-input::placeholder {
          color: #AAAAAA;
        }
        .checkout-textarea {
          padding: 0.6rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
          width: 100%;
          font-family: inherit;
          resize: vertical;
          min-height: 60px;
        }
        .checkout-textarea:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .checkout-textarea::placeholder {
          color: #AAAAAA;
        }

        /* ----- M-PESA ----- */
        .checkout-mpesa-details {
          background-color: #F9FAFB;
          padding: 1rem;
          border-radius: 6px;
        }
        .checkout-mpesa-text {
          font-size: 0.85rem;
          color: #666666;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .checkout-mpesa-input {
          padding: 0.6rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
          width: 100%;
          max-width: 250px;
        }
        .checkout-mpesa-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .checkout-mpesa-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .checkout-mpesa-label {
          font-weight: 600;
          color: #000000;
        }

        /* ----- Error Box ----- */
        .checkout-error {
          background-color: #FEF2F2;
          color: #DC2626;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid #FCA5A5;
        }

        /* ----- Order Summary (Sidebar) ----- */
        .checkout-summary {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #EEEEEE;
          position: sticky;
          top: 80px;
          height: fit-content;
        }
        .checkout-summary-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1rem;
        }
        .checkout-order-item {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #F0F0F0;
        }
        .checkout-order-item:last-child {
          border-bottom: none;
        }
        .checkout-order-item-name {
          color: #000000;
        }
        .checkout-order-item-qty {
          color: #666666;
        }
        .checkout-order-item-price {
          font-weight: 500;
          color: #000000;
        }
        .checkout-divider {
          border: none;
          border-top: 1px solid #E5E5E5;
          margin: 0.5rem 0;
        }

        /* ----- Coupon ----- */
        .checkout-coupon {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .checkout-coupon-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .checkout-coupon-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .checkout-apply-btn {
          background-color: #000000;
          color: #FFFFFF;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          white-space: nowrap;
        }
        .checkout-apply-btn:hover {
          background-color: #333333;
        }

        /* ----- Summary Rows ----- */
        .checkout-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.3rem 0;
          font-size: 0.9rem;
        }
        .checkout-summary-label {
          color: #666666;
        }
        .checkout-summary-value {
          font-weight: 500;
          color: #000000;
        }
        .checkout-discount-value {
          color: #DB4444;
        }
        .checkout-total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          border-top: 2px solid #EEEEEE;
          margin-top: 0.5rem;
        }
        .checkout-total-label {
          color: #000000;
        }
        .checkout-total-amount {
          color: #DB4444;
        }

        /* ----- Pay Button ----- */
        .checkout-pay-btn {
          width: 100%;
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background-color 0.3s ease;
        }
        .checkout-pay-btn:hover:not(:disabled) {
          background-color: #B33A3A;
        }
        .checkout-pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        @media (max-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr 340px;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 1rem 0.75rem;
          }
          
          .checkout-breadcrumb {
            font-size: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .checkout-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .checkout-summary {
            position: static;
            order: -1;
          }
          
          .checkout-form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .checkout-section-content {
            padding: 1rem;
          }
          .checkout-section-header {
            padding: 0.75rem 1rem;
          }
          
          .checkout-mpesa-input {
            max-width: 100%;
          }
          
          .checkout-summary {
            padding: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .checkout-container {
            padding: 0.75rem 0.5rem;
          }
          
          .checkout-breadcrumb {
            font-size: 0.7rem;
            flex-wrap: wrap;
          }
          
          .checkout-section-title {
            font-size: 0.9rem;
          }
          .checkout-section-number {
            width: 20px;
            height: 20px;
            font-size: 0.65rem;
          }
          .checkout-section-content {
            padding: 0.75rem;
          }
          
          .checkout-input,
          .checkout-textarea,
          .checkout-mpesa-input {
            font-size: 0.85rem;
            padding: 0.5rem 0.6rem;
          }
          .checkout-label {
            font-size: 0.75rem;
          }
          
          .checkout-summary {
            padding: 1rem;
          }
          .checkout-summary-title {
            font-size: 1rem;
          }
          .checkout-order-item {
            font-size: 0.8rem;
            padding: 0.3rem 0;
          }
          .checkout-total-row {
            font-size: 1rem;
            padding: 0.5rem 0;
          }
          .checkout-pay-btn {
            font-size: 1rem;
            padding: 0.6rem;
          }
          .checkout-coupon-input {
            font-size: 0.8rem;
          }
          .checkout-apply-btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.75rem;
          }
          .checkout-mpesa-text {
            font-size: 0.8rem;
          }
          
          .checkout-error {
            font-size: 0.8rem;
            padding: 0.5rem;
          }
        }

        @media (max-width: 360px) {
          .checkout-container {
            padding: 0.5rem 0.25rem;
          }
          .checkout-section-content {
            padding: 0.5rem;
          }
          .checkout-input,
          .checkout-textarea {
            font-size: 0.8rem;
            padding: 0.4rem 0.5rem;
          }
          .checkout-summary {
            padding: 0.75rem;
          }
          .checkout-order-item {
            font-size: 0.75rem;
          }
          .checkout-pay-btn {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="checkout-container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span className="checkout-breadcrumb-current">Checkout</span>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <div className="checkout-layout">
          <div className="checkout-left">
            {/* Billing Details */}
            <div className="checkout-section">
              <div className="checkout-section-header" onClick={() => toggleSection('billing')}>
                <span className="checkout-section-title">
                  <span className="checkout-section-number">1</span> Billing Details
                </span>
                {expandedSection === 'billing' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'billing' && (
                <div className="checkout-section-content">
                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label className="checkout-label">First Name *</label>
                      <input
                        name="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label className="checkout-label">Last Name *</label>
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label className="checkout-label">Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label className="checkout-label">Phone Number *</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="checkout-full-width">
                    <div className="checkout-form-group">
                      <label className="checkout-label">Address *</label>
                      <input
                        name="address"
                        type="text"
                        placeholder="Enter your street address"
                        value={formData.address}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="checkout-full-width">
                    <div className="checkout-form-group">
                      <label className="checkout-label">City *</label>
                      <input
                        name="city"
                        type="text"
                        placeholder="Enter your city"
                        value={formData.city}
                        onChange={handleChange}
                        className="checkout-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="checkout-full-width">
                    <div className="checkout-form-group">
                      <label className="checkout-label">Order Notes (optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="checkout-textarea"
                        placeholder="Any special instructions for delivery..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* M-PESA Payment */}
            <div className="checkout-section">
              <div className="checkout-section-header" onClick={() => toggleSection('payment')}>
                <span className="checkout-section-title">
                  <span className="checkout-section-number">2</span> M-PESA Payment
                </span>
                {expandedSection === 'payment' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'payment' && (
                <div className="checkout-section-content">
                  <div className="checkout-mpesa-logo">
                    <MpesaLogo />
                    <span className="checkout-mpesa-label">Pay with M-PESA</span>
                  </div>
                  <div className="checkout-mpesa-details">
                    <p className="checkout-mpesa-text">
                      By typing your number and selecting the pay button, you will receive a prompt to enter your M-PESA PIN and pay the total amount.
                    </p>
                    <div className="checkout-form-group">
                      <label className="checkout-label">M-PESA Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g., 0712345678"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="checkout-mpesa-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary (Mobile) */}
            <div className="checkout-section">
              <div className="checkout-section-header" onClick={() => toggleSection('summary')}>
                <span className="checkout-section-title">
                  <span className="checkout-section-number">3</span> Order Summary
                </span>
                {expandedSection === 'summary' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSection === 'summary' && (
                <div className="checkout-section-content">
                  {cartItems.map(item => (
                    <div key={item.id} className="checkout-order-item">
                      <span className="checkout-order-item-name">{item.name}</span>
                      <div>
                        <span className="checkout-order-item-qty">x {item.quantity}</span>
                        <span className="checkout-order-item-price"> {formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Sidebar */}
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>

            {cartItems.map(item => (
              <div key={item.id} className="checkout-order-item">
                <span className="checkout-order-item-name">
                  {item.name} <span className="checkout-order-item-qty">x {item.quantity}</span>
                </span>
                <span className="checkout-order-item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <hr className="checkout-divider" />

            <div className="checkout-coupon">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="checkout-coupon-input"
              />
              <button className="checkout-apply-btn">
                Apply
              </button>
            </div>

            <div className="checkout-summary-row">
              <span className="checkout-summary-label">Subtotal</span>
              <span className="checkout-summary-value">{formatPrice(subtotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">Shipping</span>
              <span className="checkout-summary-value">{formatPrice(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Discount</span>
                <span className="checkout-discount-value">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">VAT (8%)</span>
              <span className="checkout-summary-value">{formatPrice(vat)}</span>
            </div>

            <hr className="checkout-divider" />

            <div className="checkout-total-row">
              <span className="checkout-total-label">Total</span>
              <span className="checkout-total-amount">{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="checkout-pay-btn"
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
    </>
  );
};

export default CheckoutPage;