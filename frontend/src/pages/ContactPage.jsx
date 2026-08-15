import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Container ----- */
        .contact-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        /* ----- Breadcrumb ----- */
        .contact-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .contact-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .contact-breadcrumb a:hover {
          color: #DB4444;
        }
        .contact-breadcrumb-current {
          color: #000000;
        }

        /* ----- Grid Layout ----- */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        /* ----- Info Column ----- */
        .contact-info-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .contact-info-card {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #EEEEEE;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .contact-info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .contact-info-title {
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .contact-info-text {
          font-size: 0.875rem;
          color: #666666;
          line-height: 1.6;
          margin: 0.25rem 0;
        }
        .contact-info-text-mt {
          margin-top: 0.5rem;
        }
        .contact-info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .contact-info-icon {
          color: #DB4444;
          margin-top: 0.15rem;
          flex-shrink: 0;
        }

        /* ----- Form Column ----- */
        .contact-form-card {
          background-color: #FFFFFF;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #EEEEEE;
        }
        .contact-form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1.5rem;
        }

        /* ----- Success & Error Messages ----- */
        .contact-success {
          background-color: #F0FDF4;
          color: #16A34A;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid #86EFAC;
        }
        .contact-error {
          background-color: #FEF2F2;
          color: #DC2626;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid #FCA5A5;
        }

        /* ----- Form Elements ----- */
        .contact-form-group {
          margin-bottom: 1rem;
        }
        .contact-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #000000;
          margin-bottom: 0.25rem;
        }
        .contact-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
        }
        .contact-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.08);
        }
        .contact-input::placeholder {
          color: #AAAAAA;
        }
        .contact-textarea {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
        }
        .contact-textarea:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.08);
        }
        .contact-textarea::placeholder {
          color: #AAAAAA;
        }

        /* ----- Submit Button ----- */
        .contact-button {
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.6rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .contact-button:hover:not(:disabled) {
          background-color: #B33A3A;
        }
        .contact-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        /* Tablet Landscape */
        @media (max-width: 1024px) {
          .contact-grid {
            gap: 1.5rem;
          }
          .contact-form-card {
            padding: 1.5rem;
          }
        }

        /* Tablets */
        @media (max-width: 768px) {
          .contact-container {
            padding: 1rem 0.75rem;
          }
          
          .contact-breadcrumb {
            font-size: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .contact-info-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .contact-info-card {
            padding: 1.25rem;
          }
          
          .contact-form-card {
            padding: 1.5rem;
          }
          .contact-form-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
          
          .contact-input,
          .contact-textarea {
            font-size: 0.9rem;
            padding: 0.5rem 0.65rem;
          }
        }

        /* Mobile Phones */
        @media (max-width: 480px) {
          .contact-container {
            padding: 0.75rem 0.5rem;
          }
          
          .contact-breadcrumb {
            font-size: 0.7rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }
          
          .contact-info-column {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .contact-info-card {
            padding: 1rem;
          }
          .contact-info-title {
            font-size: 0.9rem;
          }
          .contact-info-text {
            font-size: 0.8rem;
          }
          
          .contact-form-card {
            padding: 1rem;
          }
          .contact-form-title {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
          }
          
          .contact-form-group {
            margin-bottom: 0.75rem;
          }
          .contact-label {
            font-size: 0.8rem;
          }
          .contact-input,
          .contact-textarea {
            font-size: 0.85rem;
            padding: 0.4rem 0.5rem;
          }
          .contact-textarea {
            min-height: 100px;
          }
          
          .contact-button {
            width: 100%;
            padding: 0.5rem;
            font-size: 0.9rem;
            justify-content: center;
          }
          
          .contact-success,
          .contact-error {
            font-size: 0.8rem;
            padding: 0.5rem;
          }
        }

        /* Very Small Phones */
        @media (max-width: 360px) {
          .contact-container {
            padding: 0.5rem 0.25rem;
          }
          .contact-info-card {
            padding: 0.75rem;
          }
          .contact-form-card {
            padding: 0.75rem;
          }
          .contact-input,
          .contact-textarea {
            font-size: 0.8rem;
            padding: 0.35rem 0.4rem;
          }
          .contact-textarea {
            min-height: 80px;
          }
        }
      `}</style>

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <Navbar />
        <div className="contact-container">
          {/* Breadcrumb */}
          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="contact-breadcrumb-current">Contact</span>
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info-column">
              <div className="contact-info-card">
                <h3 className="contact-info-title">
                  <FaPhone style={{ color: '#DB4444', marginRight: '0.5rem' }} size={16} />
                  Call To Us
                </h3>
                <p className="contact-info-text">We are available 24/7, 7 days a week.</p>
                <p className="contact-info-text contact-info-text-mt">
                  Phone: +254 799 428 420
                </p>
              </div>

              <div className="contact-info-card">
                <h3 className="contact-info-title">
                  <FaEnvelope style={{ color: '#DB4444', marginRight: '0.5rem' }} size={16} />
                  Write To Us
                </h3>
                <p className="contact-info-text">Fill out our form and we will contact you within 24 hours.</p>
                <p className="contact-info-text contact-info-text-mt">
                  Emails: sarahsila3846@gmail.com
                </p>
                <p className="contact-info-text">sarahsila3846@gmail.com</p>
              </div>

              <div className="contact-info-card">
                <h3 className="contact-info-title">
                  <FaMapMarkerAlt style={{ color: '#DB4444', marginRight: '0.5rem' }} size={16} />
                  Visit Us
                </h3>
                <div className="contact-info-row">
                  <FaMapMarkerAlt className="contact-info-icon" size={16} />
                  <p className="contact-info-text">Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send Us a Message</h2>

              {success && (
                <div className="contact-success">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="contact-error">
                  ✗ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="contact-form-group">
                  <label className="contact-label">Your Name *</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Your Email *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-input"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Your Phone *</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="contact-input"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Your Message *</label>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="contact-button"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
