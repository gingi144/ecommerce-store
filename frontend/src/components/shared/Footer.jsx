import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaGooglePlay, FaApple } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Subscribed with: ${email}`);
      setEmail('');
    }
  };

  const styles = {
    footer: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      marginTop: '3rem',
      padding: '3rem 0 1.5rem 0',
      '@media (max-width: 768px)': {
        padding: '2rem 0 1rem 0',
        marginTop: '2rem',
      },
      '@media (max-width: 480px)': {
        padding: '1.5rem 0 0.75rem 0',
        marginTop: '1.5rem',
      },
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 2rem',
      '@media (max-width: 768px)': {
        padding: '0 1.5rem',
      },
      '@media (max-width: 480px)': {
        padding: '0 1rem',
      },
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '2rem',
      marginBottom: '2rem',
      '@media (max-width: 1024px)': {
        gap: '1.5rem',
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: '1fr',
        gap: '1.25rem',
        marginBottom: '1rem',
      },
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      '@media (max-width: 480px)': {
        gap: '0.3rem',
      },
    },
    logo: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '0.5rem',
      '@media (max-width: 768px)': {
        fontSize: '1.1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1rem',
        marginBottom: '0.3rem',
      },
    },
    heading: {
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '0.5rem',
      fontSize: '1rem',
      '@media (max-width: 768px)': {
        fontSize: '0.9rem',
        marginBottom: '0.3rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.85rem',
        marginBottom: '0.25rem',
      },
    },
    text: {
      fontSize: '0.875rem',
      color: '#999999',
      lineHeight: '1.6',
      margin: '0',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        lineHeight: '1.5',
      },
    },
    link: {
      fontSize: '0.875rem',
      color: '#999999',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      padding: '0.15rem 0',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.1rem 0',
      },
    },
    subscribeContainer: {
      display: 'flex',
      marginTop: '0.25rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.15rem',
      },
    },
    subscribeInput: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      border: '1px solid #333333',
      borderRight: 'none',
      borderRadius: '4px 0 0 4px',
      fontSize: '0.75rem',
      outline: 'none',
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      minWidth: '120px',
      '@media (max-width: 480px)': {
        borderRadius: '4px',
        borderRight: '1px solid #333333',
        padding: '0.4rem 0.6rem',
        fontSize: '0.7rem',
      },
    },
    subscribeButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0 4px 4px 0',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
      '@media (max-width: 480px)': {
        borderRadius: '4px',
        padding: '0.4rem 0.8rem',
        fontSize: '0.7rem',
        width: '100%',
      },
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem',
      '@media (max-width: 480px)': {
        gap: '0.75rem',
        marginTop: '0.3rem',
      },
    },
    socialLink: {
      color: '#999999',
      fontSize: '1.1rem',
      transition: 'color 0.3s ease',
      '@media (max-width: 480px)': {
        fontSize: '1rem',
      },
    },
    appButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '0.25rem',
      '@media (max-width: 768px)': {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        gap: '0.3rem',
      },
    },
    appButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.75rem',
      border: '1px solid #333333',
      borderRadius: '4px',
      background: 'none',
      cursor: 'pointer',
      fontSize: '0.7rem',
      transition: 'all 0.3s ease',
      color: '#FFFFFF',
      width: 'fit-content',
      '@media (max-width: 768px)': {
        fontSize: '0.65rem',
        padding: '0.3rem 0.6rem',
      },
      '@media (max-width: 480px)': {
        width: '100%',
        justifyContent: 'center',
        padding: '0.3rem 0.5rem',
        fontSize: '0.7rem',
      },
    },
    bottomBar: {
      borderTop: '1px solid #1A1A1A',
      paddingTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#666666',
      '@media (max-width: 768px)': {
        paddingTop: '1rem',
        fontSize: '0.7rem',
      },
      '@media (max-width: 480px)': {
        paddingTop: '0.75rem',
        fontSize: '0.65rem',
      },
    },
    divider: {
      border: 'none',
      borderTop: '1px solid #1A1A1A',
      margin: '0.5rem 0',
    },
  };

  const handleLinkHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleLinkLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleSocialHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleSocialLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleAppButtonHover = (e) => {
    e.currentTarget.style.borderColor = '#DB4444';
    e.currentTarget.style.backgroundColor = '#1A1A1A';
  };

  const handleAppButtonLeave = (e) => {
    e.currentTarget.style.borderColor = '#333333';
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleSubscribeHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleSubscribeLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#333333';
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid} className="footer-grid">
          {/* Column 1: Brand */}
          <div style={styles.column}>
            <h3 style={styles.logo}>Stara Crochet Store</h3>
            <p style={{...styles.text, fontWeight: '600', color: '#FFFFFF', marginBottom: '0.25rem'}}>
              Subscribe
            </p>
            <p style={styles.text}>Get 10% off your first order</p>
            <form onSubmit={handleSubscribe} style={styles.subscribeContainer}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.subscribeInput}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <button 
                type="submit"
                style={styles.subscribeButton}
                onMouseEnter={handleSubscribeHover}
                onMouseLeave={handleSubscribeLeave}
              >
                Send
              </button>
            </form>
          </div>

          {/* Column 2: Support */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Support</h4>
            <p style={styles.text}>Nairobi, Kenya</p>
            <p style={styles.text}>Sarahsila3846@gmail.com</p>
            <p style={styles.text}>+254 799 428 420</p>
          </div>

          {/* Column 3: Account */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Account</h4>
            <Link 
              to="/account" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              My Account
            </Link>
            <Link 
              to="/login" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Login / Register
            </Link>
            <Link 
              to="/cart" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Cart
            </Link>
            <Link 
              to="/wishlist" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Wishlist
            </Link>
            <Link 
              to="/shop" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Shop
            </Link>
          </div>

          {/* Column 4: Quick Links */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Quick Link</h4>
            <Link 
              to="/privacy" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Terms Of Use
            </Link>
            <Link 
              to="/faq" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              style={styles.link}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              Contact
            </Link>
          </div>

          {/* Column 5: Download App */}
          <div style={styles.column}>
            <h4 style={styles.heading}>Download App</h4>
            <p style={styles.text}>Save Kes 150 with App New User Only</p>
            <div style={styles.appButtons}>
              <button 
                style={styles.appButton}
                onMouseEnter={handleAppButtonHover}
                onMouseLeave={handleAppButtonLeave}
              >
                <FaGooglePlay size={14} /> Google Play
              </button>
              <button 
                style={styles.appButton}
                onMouseEnter={handleAppButtonHover}
                onMouseLeave={handleAppButtonLeave}
              >
                <FaApple size={14} /> App Store
              </button>
            </div>
            <div style={styles.socialLinks}>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div style={styles.bottomBar}>
          <p>Copyright 2026 Exclusive. All rights reserved.</p>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 1024px) {
            .footer-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 1.5rem !important;
            }
          }
          @media (max-width: 768px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 1.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
          }
          /* Smooth hover transitions */
          .footer-link {
            transition: color 0.3s ease;
          }
          .footer-link:hover {
            color: #DB4444 !important;
          }
          .social-link {
            transition: color 0.3s ease;
          }
          .social-link:hover {
            color: #DB4444 !important;
          }
          .app-button {
            transition: all 0.3s ease;
          }
          .app-button:hover {
            border-color: #DB4444 !important;
            background-color: #1A1A1A !important;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;