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

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Container ----- */
        .cart-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        /* ----- Breadcrumb ----- */
        .cart-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .cart-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .cart-breadcrumb a:hover {
          color: #DB4444;
        }
        .cart-breadcrumb-current {
          color: #000000;
        }

        /* ----- Empty Cart ----- */
        .cart-empty {
          text-align: center;
          padding: 3rem 0;
        }
        .cart-empty-icon {
          font-size: 4rem;
          color: #E5E5E5;
          margin-bottom: 1rem;
        }
        .cart-empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
        }
        .cart-empty-text {
          color: #666666;
          margin-bottom: 1.5rem;
        }
        .cart-continue-btn {
          display: inline-block;
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }
        .cart-continue-btn:hover {
          background-color: #B33A3A;
        }

        /* ----- Table ----- */
        .cart-table-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .cart-table-wrapper {
          overflow-x: auto;
        }
        .cart-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        .cart-th {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #E5E5E5;
          background-color: #FAFAFA;
        }
        .cart-tr {
          border-bottom: 1px solid #F0F0F0;
          transition: background-color 0.3s ease;
        }
        .cart-tr:hover {
          background-color: #FAFAFA;
        }
        .cart-td {
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          color: #000000;
        }

        /* ----- Product Cell ----- */
        .cart-product-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .cart-product-image {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 6px;
          background-color: #F5F5F5;
          flex-shrink: 0;
        }
        .cart-product-name {
          font-weight: 500;
          color: #000000;
        }

        /* ----- Quantity Controls ----- */
        .cart-quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cart-qty-btn {
          padding: 0.25rem 0.5rem;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          background: none;
          cursor: pointer;
          transition: background-color 0.3s ease, border-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
        }
        .cart-qty-btn:hover {
          background-color: #F5F5F5;
          border-color: #DB4444;
        }
        .cart-qty-btn:active {
          transform: scale(0.95);
        }
        .cart-qty-text {
          min-width: 32px;
          text-align: center;
          font-weight: 500;
        }

        /* ----- Subtotal ----- */
        .cart-subtotal {
          font-weight: 700;
          color: #000000;
        }

        /* ----- Delete Button ----- */
        .cart-delete-btn {
          color: #DC2626;
          border: none;
          background: none;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
          padding: 0.25rem;
        }
        .cart-delete-btn:hover {
          color: #B91C1C;
          transform: scale(1.1);
        }

        /* ----- Action Row ----- */
        .cart-action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .cart-action-btn {
          padding: 0.5rem 1.5rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          background: none;
          cursor: pointer;
          text-decoration: none;
          color: #000000;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .cart-action-btn:hover {
          background-color: #F5F5F5;
          border-color: #DB4444;
        }

        /* ----- Checkout Section ----- */
        .cart-checkout-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 2rem;
        }

        /* ----- Coupon Section ----- */
        .cart-coupon-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .cart-coupon-input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          min-width: 150px;
        }
        .cart-coupon-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .cart-coupon-input::placeholder {
          color: #AAAAAA;
        }
        .cart-apply-btn {
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          white-space: nowrap;
        }
        .cart-apply-btn:hover {
          background-color: #B33A3A;
        }

        /* ----- Totals Card ----- */
        .cart-totals-card {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          min-width: 300px;
          align-self: flex-end;
          width: 100%;
          max-width: 400px;
        }
        .cart-totals-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #E5E5E5;
        }
        .cart-totals-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }
        .cart-totals-label {
          color: #666666;
        }
        .cart-totals-value {
          font-weight: 600;
          color: #000000;
        }
        .cart-totals-divider {
          border: none;
          border-top: 1px solid #E5E5E5;
          margin: 0.75rem 0;
        }
        .cart-total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1.1rem;
          padding-top: 0.5rem;
        }
        .cart-total-label {
          color: #000000;
        }
        .cart-total-value {
          color: #DB4444;
        }
        .cart-free-shipping {
          color: #16A34A;
          font-weight: 600;
        }
        .cart-checkout-btn {
          display: block;
          width: 100%;
          background-color: #DB4444;
          color: #FFFFFF;
          text-align: center;
          padding: 0.75rem;
          border-radius: 6px;
          text-decoration: none;
          margin-top: 1rem;
          transition: background-color 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .cart-checkout-btn:hover {
          background-color: #B33A3A;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        @media (max-width: 768px) {
          .cart-container {
            padding: 1rem 0.75rem;
          }
          
          .cart-breadcrumb {
            font-size: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .cart-table {
            min-width: 500px;
          }
          .cart-th,
          .cart-td {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          .cart-product-image {
            width: 48px;
            height: 48px;
          }
          .cart-product-name {
            font-size: 0.8rem;
          }
          .cart-qty-btn {
            padding: 0.15rem 0.35rem;
            min-width: 26px;
          }
          .cart-qty-text {
            min-width: 28px;
            font-size: 0.8rem;
          }
          
          .cart-action-row {
            flex-direction: column;
            align-items: stretch;
          }
          .cart-action-btn {
            text-align: center;
            padding: 0.5rem;
          }
          
          .cart-coupon-section {
            flex-direction: column;
          }
          .cart-coupon-input {
            width: 100%;
          }
          .cart-apply-btn {
            width: 100%;
            padding: 0.6rem;
          }
          
          .cart-totals-card {
            min-width: unset;
            max-width: 100%;
            padding: 1.25rem;
          }
          
          .cart-checkout-section {
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .cart-container {
            padding: 0.75rem 0.5rem;
          }
          
          .cart-breadcrumb {
            font-size: 0.7rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }
          
          .cart-table {
            min-width: 400px;
          }
          .cart-th,
          .cart-td {
            padding: 0.4rem 0.5rem;
            font-size: 0.7rem;
          }
          .cart-product-image {
            width: 40px;
            height: 40px;
          }
          .cart-product-name {
            font-size: 0.7rem;
          }
          .cart-qty-btn {
            padding: 0.1rem 0.25rem;
            min-width: 22px;
            font-size: 0.6rem;
          }
          .cart-qty-text {
            min-width: 24px;
            font-size: 0.7rem;
          }
          .cart-subtotal {
            font-size: 0.75rem;
          }
          
          .cart-empty-title {
            font-size: 1.25rem;
          }
          .cart-empty-icon {
            font-size: 3rem;
          }
          .cart-continue-btn {
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
          }
          
          .cart-action-btn {
            padding: 0.4rem;
            font-size: 0.8rem;
          }
          
          .cart-totals-card {
            padding: 1rem;
          }
          .cart-totals-title {
            font-size: 1rem;
          }
          .cart-totals-row {
            font-size: 0.85rem;
          }
          .cart-total-row {
            font-size: 1rem;
          }
          .cart-checkout-btn {
            padding: 0.6rem;
            font-size: 0.9rem;
          }
          .cart-apply-btn {
            font-size: 0.9rem;
          }
          .cart-coupon-input {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .cart-container {
            padding: 0.5rem 0.25rem;
          }
          
          .cart-table {
            min-width: 320px;
          }
          .cart-th,
          .cart-td {
            padding: 0.3rem 0.35rem;
            font-size: 0.65rem;
          }
          .cart-product-image {
            width: 32px;
            height: 32px;
          }
          .cart-product-name {
            font-size: 0.65rem;
          }
          .cart-qty-btn {
            min-width: 20px;
            padding: 0.05rem 0.2rem;
          }
          .cart-qty-text {
            min-width: 20px;
            font-size: 0.65rem;
          }
          
          .cart-totals-card {
            padding: 0.75rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="cart-container">
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="cart-breadcrumb-current">Cart</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <FaShoppingCart className="cart-empty-icon" />
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-text">Start shopping to add items to your cart</p>
            <Link to="/shop" className="cart-continue-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Table */}
            <div className="cart-table-card">
              <div className="cart-table-wrapper">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th className="cart-th">Product</th>
                      <th className="cart-th">Price</th>
                      <th className="cart-th">Quantity</th>
                      <th className="cart-th">Subtotal</th>
                      <th className="cart-th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => {
                      const imageUrl = getImageUrl(item.images?.[0]?.image_url);
                      return (
                        <tr key={item.id} className="cart-tr">
                          <td className="cart-td">
                            <div className="cart-product-cell">
                              <img 
                                src={imageUrl}
                                alt={item.name} 
                                className="cart-product-image"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/80/80';
                                }}
                              />
                              <span className="cart-product-name">{item.name}</span>
                            </div>
                          </td>
                          <td className="cart-td">{formatPrice(item.price)}</td>
                          <td className="cart-td">
                            <div className="cart-quantity-controls">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="cart-qty-btn"
                                aria-label="Decrease quantity"
                              >
                                <FaMinus size={12} />
                              </button>
                              <span className="cart-qty-text">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="cart-qty-btn"
                                aria-label="Increase quantity"
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="cart-td">
                            <span className="cart-subtotal">{formatPrice(item.price * item.quantity)}</span>
                          </td>
                          <td className="cart-td">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="cart-delete-btn"
                              aria-label="Remove item"
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

            {/* Action Row */}
            <div className="cart-action-row">
              <Link to="/shop" className="cart-action-btn">
                Return To Shop
              </Link>
              <button className="cart-action-btn">
                Update Cart
              </button>
            </div>

            {/* Checkout Section */}
            <div className="cart-checkout-section">
              {/* Coupon Section */}
              <div className="cart-coupon-section">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="cart-coupon-input"
                />
                <button className="cart-apply-btn">
                  Apply Coupon
                </button>
              </div>

              {/* Totals Card */}
              <div className="cart-totals-card">
                <h3 className="cart-totals-title">Cart Total</h3>
                <div className="cart-totals-row">
                  <span className="cart-totals-label">Subtotal:</span>
                  <span className="cart-totals-value">{formatPrice(total)}</span>
                </div>
                <div className="cart-totals-row">
                  <span className="cart-totals-label">Shipping:</span>
                  <span className="cart-free-shipping">Free</span>
                </div>
                <hr className="cart-totals-divider" />
                <div className="cart-total-row">
                  <span className="cart-total-label">Total:</span>
                  <span className="cart-total-value">{formatPrice(total)}</span>
                </div>
                <Link to="/checkout" className="cart-checkout-btn">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;