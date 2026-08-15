import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileContract, FaGavel, FaCheckCircle, FaExclamationTriangle, 
  FaCreditCard, FaTruck, FaUserShield, FaClipboardList 
} from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const TermsOfUsePage = () => {
  return (
    <>
      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        .terms-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        .terms-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .terms-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .terms-breadcrumb a:hover {
          color: #DB4444;
        }
        .terms-breadcrumb-current {
          color: #000000;
        }

        .terms-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #F0F0F0;
        }
        .terms-icon {
          font-size: 3rem;
          color: #DB4444;
          margin-bottom: 1rem;
        }
        .terms-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
        }
        .terms-subtitle {
          font-size: 1rem;
          color: #666666;
        }
        .terms-last-updated {
          font-size: 0.85rem;
          color: #999999;
          margin-top: 0.5rem;
        }

        .terms-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
        .terms-section:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .terms-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .terms-section-icon {
          font-size: 1.5rem;
          color: #DB4444;
          flex-shrink: 0;
        }
        .terms-section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #000000;
        }
        .terms-text {
          color: #555555;
          line-height: 1.8;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }
        .terms-text:last-child {
          margin-bottom: 0;
        }
        .terms-list {
          list-style: none;
          padding: 0;
          margin: 0.75rem 0;
        }
        .terms-list-item {
          padding: 0.4rem 0;
          color: #555555;
          font-size: 0.95rem;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .terms-list-item::before {
          content: "•";
          color: #DB4444;
          font-weight: 700;
          font-size: 1.2rem;
        }
        .terms-list-item strong {
          color: #000000;
        }

        .terms-highlight {
          background-color: #FDF2F2;
          border-left: 4px solid #DB4444;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .terms-highlight p {
          margin: 0;
          color: #555555;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .terms-footer-text {
          text-align: center;
          color: #999999;
          font-size: 0.85rem;
          padding-top: 2rem;
          border-top: 1px solid #EEEEEE;
          margin-top: 2rem;
        }
        .terms-footer-text a {
          color: #DB4444;
          text-decoration: none;
        }
        .terms-footer-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .terms-container {
            padding: 1rem 0.75rem;
          }
          .terms-title {
            font-size: 1.5rem;
          }
          .terms-section {
            padding: 1rem;
          }
          .terms-section-title {
            font-size: 1rem;
          }
          .terms-text {
            font-size: 0.9rem;
          }
          .terms-list-item {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .terms-container {
            padding: 0.75rem 0.5rem;
          }
          .terms-title {
            font-size: 1.25rem;
          }
          .terms-icon {
            font-size: 2.5rem;
          }
          .terms-section {
            padding: 0.75rem;
          }
          .terms-section-icon {
            font-size: 1.2rem;
          }
          .terms-text {
            font-size: 0.85rem;
          }
          .terms-list-item {
            font-size: 0.85rem;
          }
          .terms-highlight {
            padding: 0.75rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="terms-container">
        {/* Breadcrumb */}
        <div className="terms-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="terms-breadcrumb-current">Terms of Use</span>
        </div>

        {/* Header */}
        <div className="terms-header">
          <FaFileContract className="terms-icon" />
          <h1 className="terms-title">Terms of Use</h1>
          <p className="terms-subtitle">Legal terms and conditions for using CrochetKE</p>
          <p className="terms-last-updated">Last Updated: August 2026</p>
        </div>

        {/* Acceptance of Terms */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaCheckCircle className="terms-section-icon" />
            <h2 className="terms-section-title">Acceptance of Terms</h2>
          </div>
          <p className="terms-text">
            By accessing and using CrochetKE, you agree to be bound by these Terms of Use. If you do not agree 
            to these terms, please do not use our website or services.
          </p>
          <p className="terms-text">
            These terms apply to all visitors, users, and others who access or use our services.
          </p>
        </div>

        {/* User Accounts */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaUserShield className="terms-section-icon" />
            <h2 className="terms-section-title">User Accounts</h2>
          </div>
          <p className="terms-text">
            To access certain features of our service, you may be required to create an account. You are responsible 
            for maintaining the confidentiality of your account credentials.
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Account Security:</strong> You are responsible for all activities that occur under your account.
            </li>
            <li className="terms-list-item">
              <strong>Accurate Information:</strong> You must provide accurate and complete information when creating your account.
            </li>
            <li className="terms-list-item">
              <strong>Age Requirement:</strong> You must be at least 18 years old or have parental consent to create an account.
            </li>
            <li className="terms-list-item">
              <strong>Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.
            </li>
          </ul>
        </div>

        {/* Product Listings */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaClipboardList className="terms-section-icon" />
            <h2 className="terms-section-title">Product Listings</h2>
          </div>
          <p className="terms-text">
            CrochetKE connects customers with independent artisans and brands. While we strive for accuracy, 
            we do not guarantee the accuracy of product descriptions, images, or pricing.
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Product Availability:</strong> Products are subject to availability and may be discontinued without notice.
            </li>
            <li className="terms-list-item">
              <strong>Pricing:</strong> Prices are subject to change without notice. We reserve the right to correct pricing errors.
            </li>
            <li className="terms-list-item">
              <strong>Product Quality:</strong> We strive to work with artisans who produce high-quality products, but we do not manufacture items ourselves.
            </li>
          </ul>
        </div>

        {/* Orders and Payments */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaCreditCard className="terms-section-icon" />
            <h2 className="terms-section-title">Orders and Payments</h2>
          </div>
          <p className="terms-text">
            By placing an order on CrochetKE, you agree to the following terms:
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Order Confirmation:</strong> You will receive an email confirmation after placing an order.
            </li>
            <li className="terms-list-item">
              <strong>Payment Processing:</strong> Payments are processed through secure third-party payment gateways.
            </li>
            <li className="terms-list-item">
              <strong>Order Cancellation:</strong> You may cancel an order within 2 hours of placing it, subject to our cancellation policy.
            </li>
            <li className="terms-list-item">
              <strong>Refunds:</strong> Refunds are processed according to our return and refund policy.
            </li>
          </ul>
        </div>

        {/* Shipping and Delivery */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaTruck className="terms-section-icon" />
            <h2 className="terms-section-title">Shipping and Delivery</h2>
          </div>
          <p className="terms-text">
            We partner with trusted shipping providers to deliver your orders. Delivery times are estimates and may vary.
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Shipping Costs:</strong> Shipping costs are calculated at checkout based on your location and order size.
            </li>
            <li className="terms-list-item">
              <strong>Delivery Time:</strong> Standard delivery within Kenya takes 2-5 business days.
            </li>
            <li className="terms-list-item">
              <strong>Tracking:</strong> You will receive tracking information once your order ships.
            </li>
            <li className="terms-list-item">
              <strong>Issues:</strong> Contact us immediately if you experience delivery problems.
            </li>
          </ul>
        </div>

        {/* Intellectual Property */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaGavel className="terms-section-icon" />
            <h2 className="terms-section-title">Intellectual Property</h2>
          </div>
          <p className="terms-text">
            All content on CrochetKE, including text, graphics, logos, images, and software, is the property of CrochetKE 
            and is protected by copyright and intellectual property laws.
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Use of Content:</strong> You may not copy, reproduce, distribute, or create derivative works from our content without permission.
            </li>
            <li className="terms-list-item">
              <strong>User Content:</strong> By posting content, you grant us a non-exclusive license to use it for platform operations.
            </li>
            <li className="terms-list-item">
              <strong>Trademarks:</strong> CrochetKE and related logos are trademarks of CrochetKE.
            </li>
          </ul>
        </div>

        {/* Prohibited Conduct */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaExclamationTriangle className="terms-section-icon" />
            <h2 className="terms-section-title">Prohibited Conduct</h2>
          </div>
          <p className="terms-text">You agree not to engage in the following activities:</p>
          <ul className="terms-list">
            <li className="terms-list-item">Violate any applicable laws or regulations</li>
            <li className="terms-list-item">Infringe on the rights of others, including intellectual property rights</li>
            <li className="terms-list-item">Upload malicious code or viruses</li>
            <li className="terms-list-item">Attempt to gain unauthorized access to our systems</li>
            <li className="terms-list-item">Engage in fraudulent or deceptive activities</li>
            <li className="terms-list-item">Harass, abuse, or harm other users</li>
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaFileContract className="terms-section-icon" />
            <h2 className="terms-section-title">Limitation of Liability</h2>
          </div>
          <p className="terms-text">
            CrochetKE is provided "as is" and "as available" without warranties of any kind. We do not warrant that 
            our service will be uninterrupted, error-free, or secure.
          </p>
          <div className="terms-highlight">
            <p>
              <strong>Important:</strong> To the maximum extent permitted by law, CrochetKE shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of our service.
            </p>
          </div>
        </div>

        {/* Governing Law */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaGavel className="terms-section-icon" />
            <h2 className="terms-section-title">Governing Law</h2>
          </div>
          <p className="terms-text">
            These terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. 
            Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaFileContract className="terms-section-icon" />
            <h2 className="terms-section-title">Changes to Terms</h2>
          </div>
          <p className="terms-text">
            We reserve the right to update or modify these terms at any time without prior notice. Your continued use 
            of our service after any changes constitutes acceptance of the new terms.
          </p>
        </div>

        {/* Contact Us */}
        <div className="terms-section">
          <div className="terms-section-header">
            <FaClipboardList className="terms-section-icon" />
            <h2 className="terms-section-title">Contact Us</h2>
          </div>
          <p className="terms-text">
            If you have any questions about these Terms of Use, please contact us:
          </p>
          <ul className="terms-list">
            <li className="terms-list-item">
              <strong>Email:</strong> legal@crochetke.com
            </li>
            <li className="terms-list-item">
              <strong>Phone:</strong> +254 700 000 000
            </li>
            <li className="terms-list-item">
              <strong>Address:</strong> Nairobi, Kenya
            </li>
          </ul>
        </div>

        <div className="terms-footer-text">
          <Link to="/">Home</Link> &bull; <Link to="/shop">Shop</Link> &bull; <Link to="/about">About</Link> &bull; <Link to="/contact">Contact</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfUsePage;