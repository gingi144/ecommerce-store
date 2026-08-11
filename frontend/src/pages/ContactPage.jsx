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
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem',
    },
    infoColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    infoCard: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #EEEEEE',
    },
    infoTitle: {
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
      fontSize: '1rem',
    },
    infoText: {
      fontSize: '0.875rem',
      color: '#666666',
      lineHeight: '1.6',
      margin: '0.25rem 0',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    infoIcon: {
      color: '#DB4444',
      marginTop: '0.15rem',
    },
    formCard: {
      backgroundColor: '#FFFFFF',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #EEEEEE',
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1.5rem',
    },
    successBox: {
      backgroundColor: '#F0FDF4',
      color: '#16A34A',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    errorBox: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#000000',
      marginBottom: '0.25rem',
    },
    input: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
    },
    button: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.6rem 2rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  const handleLinkHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleLinkLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.08)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.boxShadow = 'none';
  };

  const handleButtonHover = (e) => {
    if (!loading) e.target.style.backgroundColor = '#B33A3A';
  };

  const handleButtonLeave = (e) => {
    if (!loading) e.target.style.backgroundColor = '#DB4444';
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <Link 
            to="/" 
            style={styles.breadcrumbLink}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            Home
          </Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>Contact</span>
        </div>

        <div style={styles.grid}>
          {/* Contact Info */}
          <div style={styles.infoColumn}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Call To Us</h3>
              <p style={styles.infoText}>We are available 24/7, 7 days a week.</p>
              <p style={{...styles.infoText, marginTop: '0.5rem'}}>
                Phone: +254 700 000 000
              </p>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Write To Us</h3>
              <p style={styles.infoText}>Fill out our form and we will contact you within 24 hours.</p>
              <p style={{...styles.infoText, marginTop: '0.5rem'}}>
                Emails: customer@crochetke.com
              </p>
              <p style={styles.infoText}>support@crochetke.com</p>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Visit Us</h3>
              <div style={styles.infoRow}>
                <FaMapMarkerAlt style={styles.infoIcon} size={16} />
                <p style={styles.infoText}>Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Send Us a Message</h2>

            {success && (
              <div style={styles.successBox}>
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Your Email *</label>
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
                <label style={styles.label}>Your Phone *</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Your Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  style={styles.textarea}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;