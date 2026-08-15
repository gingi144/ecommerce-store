import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaEye, FaDatabase, FaCookie, FaEnvelope } from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const PrivacyPolicyPage = () => {
  return (
    <>
      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        .privacy-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        .privacy-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .privacy-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .privacy-breadcrumb a:hover {
          color: #DB4444;
        }
        .privacy-breadcrumb-current {
          color: #000000;
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #F0F0F0;
        }
        .privacy-icon {
          font-size: 3rem;
          color: #DB4444;
          margin-bottom: 1rem;
        }
        .privacy-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
        }
        .privacy-subtitle {
          font-size: 1rem;
          color: #666666;
        }
        .privacy-last-updated {
          font-size: 0.85rem;
          color: #999999;
          margin-top: 0.5rem;
        }

        .privacy-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
        .privacy-section:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .privacy-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .privacy-section-icon {
          font-size: 1.5rem;
          color: #DB4444;
          flex-shrink: 0;
        }
        .privacy-section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #000000;
        }
        .privacy-text {
          color: #555555;
          line-height: 1.8;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }
        .privacy-text:last-child {
          margin-bottom: 0;
        }
        .privacy-list {
          list-style: none;
          padding: 0;
          margin: 0.75rem 0;
        }
        .privacy-list-item {
          padding: 0.4rem 0;
          color: #555555;
          font-size: 0.95rem;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .privacy-list-item::before {
          content: "•";
          color: #DB4444;
          font-weight: 700;
          font-size: 1.2rem;
        }
        .privacy-list-item strong {
          color: #000000;
        }

        .privacy-footer-text {
          text-align: center;
          color: #999999;
          font-size: 0.85rem;
          padding-top: 2rem;
          border-top: 1px solid #EEEEEE;
          margin-top: 2rem;
        }
        .privacy-footer-text a {
          color: #DB4444;
          text-decoration: none;
        }
        .privacy-footer-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .privacy-container {
            padding: 1rem 0.75rem;
          }
          .privacy-title {
            font-size: 1.5rem;
          }
          .privacy-section {
            padding: 1rem;
          }
          .privacy-section-title {
            font-size: 1rem;
          }
          .privacy-text {
            font-size: 0.9rem;
          }
          .privacy-list-item {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .privacy-container {
            padding: 0.75rem 0.5rem;
          }
          .privacy-title {
            font-size: 1.25rem;
          }
          .privacy-icon {
            font-size: 2.5rem;
          }
          .privacy-section {
            padding: 0.75rem;
          }
          .privacy-section-icon {
            font-size: 1.2rem;
          }
          .privacy-text {
            font-size: 0.85rem;
          }
          .privacy-list-item {
            font-size: 0.85rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="privacy-container">
        {/* Breadcrumb */}
        <div className="privacy-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="privacy-breadcrumb-current">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="privacy-header">
          <FaShieldAlt className="privacy-icon" />
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">How we collect, use, and protect your personal information</p>
          <p className="privacy-last-updated">Last Updated: August 2026</p>
        </div>

        {/* Introduction */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaShieldAlt className="privacy-section-icon" />
            <h2 className="privacy-section-title">Introduction</h2>
          </div>
          <p className="privacy-text">
            CrochetKE ("we", "our", "us") respects your privacy and is committed to protecting your personal data. 
            This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit 
            our website and use our services.
          </p>
          <p className="privacy-text">
            Please read this privacy policy carefully. By using our website and services, you agree to the collection 
            and use of information in accordance with this policy.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaDatabase className="privacy-section-icon" />
            <h2 className="privacy-section-title">Information We Collect</h2>
          </div>
          <p className="privacy-text">We collect several types of information to provide and improve our service:</p>
          <ul className="privacy-list">
            <li className="privacy-list-item">
              <strong>Personal Information:</strong> Name, email address, phone number, shipping address, and payment information when you create an account or place an order.
            </li>
            <li className="privacy-list-item">
              <strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and products viewed.
            </li>
            <li className="privacy-list-item">
              <strong>Device Information:</strong> Browser type, IP address, device type, and operating system.
            </li>
            <li className="privacy-list-item">
              <strong>Cookies:</strong> We use cookies to enhance your browsing experience and analyze website traffic.
            </li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaLock className="privacy-section-icon" />
            <h2 className="privacy-section-title">How We Use Your Information</h2>
          </div>
          <p className="privacy-text">We use your information for the following purposes:</p>
          <ul className="privacy-list">
            <li className="privacy-list-item">Process and fulfill your orders, including delivery and payment</li>
            <li className="privacy-list-item">Communicate with you about your orders, account, and promotional offers</li>
            <li className="privacy-list-item">Improve our website, products, and customer service</li>
            <li className="privacy-list-item">Prevent fraud and ensure the security of transactions</li>
            <li className="privacy-list-item">Comply with legal obligations and regulatory requirements</li>
          </ul>
        </div>

        {/* Information Sharing */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaEye className="privacy-section-icon" />
            <h2 className="privacy-section-title">Information Sharing</h2>
          </div>
          <p className="privacy-text">
            We do not sell, trade, or rent your personal information to third parties. However, we may share your 
            information with:
          </p>
          <ul className="privacy-list">
            <li className="privacy-list-item">
              <strong>Service Providers:</strong> Third-party companies that help us operate our business, such as payment processors, shipping partners, and hosting services.
            </li>
            <li className="privacy-list-item">
              <strong>Legal Authorities:</strong> When required by law or to protect our rights, property, or safety, and that of our users.
            </li>
            <li className="privacy-list-item">
              <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.
            </li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaShieldAlt className="privacy-section-icon" />
            <h2 className="privacy-section-title">Data Security</h2>
          </div>
          <p className="privacy-text">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. These include:
          </p>
          <ul className="privacy-list">
            <li className="privacy-list-item">SSL encryption for all data transmission</li>
            <li className="privacy-list-item">Secure servers and firewalls</li>
            <li className="privacy-list-item">Access controls and authentication mechanisms</li>
            <li className="privacy-list-item">Regular security audits and vulnerability assessments</li>
          </ul>
          <p className="privacy-text">
            While we strive to protect your data, no method of transmission over the internet is 100% secure, 
            and we cannot guarantee absolute security.
          </p>
        </div>

        {/* Cookies */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaCookie className="privacy-section-icon" />
            <h2 className="privacy-section-title">Cookies</h2>
          </div>
          <p className="privacy-text">
            We use cookies and similar tracking technologies to improve your browsing experience, analyze website 
            traffic, and personalize content. You can control cookie preferences through your browser settings.
          </p>
          <p className="privacy-text">
            Types of cookies we use:
          </p>
          <ul className="privacy-list">
            <li className="privacy-list-item">
              <strong>Essential Cookies:</strong> Necessary for the website to function properly.
            </li>
            <li className="privacy-list-item">
              <strong>Functional Cookies:</strong> Remember your preferences and enhance your experience.
            </li>
            <li className="privacy-list-item">
              <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.
            </li>
            <li className="privacy-list-item">
              <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements to you.
            </li>
          </ul>
        </div>

        {/* Your Rights */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaLock className="privacy-section-icon" />
            <h2 className="privacy-section-title">Your Rights</h2>
          </div>
          <p className="privacy-text">You have the following rights regarding your personal information:</p>
          <ul className="privacy-list">
            <li className="privacy-list-item">
              <strong>Access:</strong> Request a copy of the personal data we hold about you.
            </li>
            <li className="privacy-list-item">
              <strong>Correction:</strong> Request correction of inaccurate or incomplete information.
            </li>
            <li className="privacy-list-item">
              <strong>Deletion:</strong> Request deletion of your personal data, subject to legal obligations.
            </li>
            <li className="privacy-list-item">
              <strong>Objection:</strong> Object to the processing of your data for marketing purposes.
            </li>
            <li className="privacy-list-item">
              <strong>Data Portability:</strong> Request transfer of your data to another service provider.
            </li>
          </ul>
          <p className="privacy-text">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </div>

        {/* Contact Us */}
        <div className="privacy-section">
          <div className="privacy-section-header">
            <FaEnvelope className="privacy-section-icon" />
            <h2 className="privacy-section-title">Contact Us</h2>
          </div>
          <p className="privacy-text">
            If you have any questions, concerns, or requests regarding this privacy policy, please contact us:
          </p>
          <ul className="privacy-list">
            <li className="privacy-list-item">
              <strong>Email:</strong> sarahsila3846@gmail.com
            </li>
            <li className="privacy-list-item">
              <strong>Phone:</strong> +254 799 428 420
            </li>
            <li className="privacy-list-item">
              <strong>Address:</strong> Nairobi, Kenya
            </li>
          </ul>
        </div>

        <div className="privacy-footer-text">
          <Link to="/">Home</Link> &bull; <Link to="/shop">Shop</Link> &bull; <Link to="/about">About</Link> &bull; <Link to="/contact">Contact</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;