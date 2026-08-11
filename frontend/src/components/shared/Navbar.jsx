import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const styles = {
    navbar: {
      backgroundColor: '#FFFFFF',
      borderBottom: '2px solid #E5E5E5',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      '@media (max-width: 768px)': {
        padding: '0 0.5rem',
      },
    },
    navWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      '@media (max-width: 768px)': {
        height: '56px',
      },
      '@media (max-width: 480px)': {
        height: '50px',
      },
    },
    logo: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
      textDecoration: 'none',
      '@media (max-width: 768px)': {
        fontSize: '1.1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.9rem',
      },
    },
    desktopNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      '@media (max-width: 1024px)': {
        gap: '1.5rem',
      },
      '@media (max-width: 768px)': {
        display: 'none',
      },
    },
    navLink: {
      color: '#000000',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'color 0.2s ease',
      '@media (max-width: 1024px)': {
        fontSize: '0.8rem',
      },
    },
    desktopActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      '@media (max-width: 1024px)': {
        gap: '0.75rem',
      },
      '@media (max-width: 768px)': {
        display: 'none',
      },
    },
    searchForm: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: '8px',
      padding: '0.25rem 0.75rem',
      '@media (max-width: 1024px)': {
        padding: '0.2rem 0.5rem',
      },
    },
    searchInput: {
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '0.875rem',
      width: '192px',
      padding: '0.25rem 0',
      color: '#000000',
      '@media (max-width: 1024px)': {
        width: '140px',
        fontSize: '0.8rem',
      },
    },
    searchButton: {
      background: 'none',
      border: 'none',
      color: '#666666',
      cursor: 'pointer',
      padding: '0.25rem',
      '@media (max-width: 1024px)': {
        padding: '0.15rem',
      },
    },
    iconLink: {
      color: '#000000',
      position: 'relative',
      textDecoration: 'none',
      fontSize: '1.25rem',
      transition: 'color 0.2s ease',
      '@media (max-width: 1024px)': {
        fontSize: '1.1rem',
      },
    },
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.625rem',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      '@media (max-width: 1024px)': {
        width: '18px',
        height: '18px',
        fontSize: '0.55rem',
        top: '-6px',
        right: '-6px',
      },
    },
    userMenu: {
      position: 'relative',
      display: 'inline-block',
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'none',
      border: 'none',
      color: '#000000',
      cursor: 'pointer',
      fontSize: '0.875rem',
      '@media (max-width: 1024px)': {
        fontSize: '0.8rem',
        gap: '0.3rem',
      },
    },
    userDropdown: {
      position: 'absolute',
      right: 0,
      marginTop: '0.5rem',
      width: '220px',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '0.5rem 0',
      display: 'none',
      zIndex: 100,
      '@media (max-width: 480px)': {
        width: '200px',
        right: '-10px',
      },
    },
    dropdownItem: {
      display: 'block',
      padding: '0.5rem 1rem',
      color: '#000000',
      textDecoration: 'none',
      fontSize: '0.875rem',
      background: 'none',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.4rem 0.8rem',
      },
    },
    dropdownDivider: {
      border: 'none',
      borderTop: '1px solid #E5E5E5',
      margin: '0.25rem 0',
    },
    adminBadge: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.6rem',
      padding: '0.1rem 0.4rem',
      borderRadius: '4px',
      marginLeft: '0.25rem',
      '@media (max-width: 1024px)': {
        fontSize: '0.5rem',
        padding: '0.05rem 0.3rem',
      },
    },
    loginButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      '@media (max-width: 1024px)': {
        padding: '0.4rem 0.8rem',
        fontSize: '0.8rem',
      },
    },
    mobileMenuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: '#000000',
      cursor: 'pointer',
      '@media (max-width: 768px)': {
        display: 'block',
        fontSize: '1.3rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.1rem',
      },
    },
    mobileMenu: {
      display: 'none',
      padding: '1rem 0',
      borderTop: '2px solid #E5E5E5',
      '@media (max-width: 768px)': {
        display: 'block',
      },
    },
    mobileSearchForm: {
      display: 'none',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      marginBottom: '1rem',
      '@media (max-width: 768px)': {
        display: 'flex',
      },
    },
    mobileSearchInput: {
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '0.875rem',
      flex: 1,
      padding: '0.25rem 0',
      color: '#000000',
    },
    mobileLink: {
      display: 'block',
      padding: '0.5rem 0',
      color: '#000000',
      textDecoration: 'none',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.4rem 0',
      },
    },
    mobileActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      paddingTop: '0.5rem',
      '@media (max-width: 480px)': {
        gap: '0.3rem',
      },
    },
    mobileActionsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    mobileLogin: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.25rem 1rem',
      borderRadius: '4px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        padding: '0.2rem 0.8rem',
      },
    },
    mobileLogout: {
      background: 'none',
      border: 'none',
      color: '#DC2626',
      cursor: 'pointer',
      fontSize: '0.875rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
      },
    },
    mobileDivider: {
      border: 'none',
      borderTop: '1px solid #E5E5E5',
      margin: '0.5rem 0',
    },
    mobileIconLink: {
      color: '#000000',
      textDecoration: 'none',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      '@media (max-width: 480px)': {
        fontSize: '0.8rem',
      },
    },
    mobileBadge: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      fontSize: '0.625rem',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      marginLeft: '0.25rem',
    },
  };

  const handleNavLinkHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleNavLinkLeave = (e) => {
    e.target.style.color = '#000000';
  };

  const handleIconHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleIconLeave = (e) => {
    e.target.style.color = '#000000';
  };

  const handleLoginHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleLoginLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  // Get total items from cart
  const totalItems = getTotalItems();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.navWrapper}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            Stara crochet store KE
          </Link>

          {/* Desktop Navigation */}
          <div style={styles.desktopNav} className="desktop-nav">
            <Link 
              to="/" 
              style={styles.navLink}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={handleNavLinkLeave}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              style={styles.navLink}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={handleNavLinkLeave}
            >
              Shop
            </Link>
           
            <Link 
              to="/about" 
              style={styles.navLink}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={handleNavLinkLeave}
            >
              About
            </Link>
             <Link 
              to="/contact" 
              style={styles.navLink}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={handleNavLinkLeave}
            >
              Contact
            </Link>
            <Link 
              to="/signup" 
              style={styles.navLink}
              onMouseEnter={handleNavLinkHover}
              onMouseLeave={handleNavLinkLeave}
            >
              Sign Up
            </Link>
          </div>

          {/* Desktop Actions */}
          <div style={styles.desktopActions} className="desktop-actions">
            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                <FaSearch />
              </button>
            </form>

            <Link 
              to="/wishlist" 
              style={styles.iconLink}
              onMouseEnter={handleIconHover}
              onMouseLeave={handleIconLeave}
            >
              <FaHeart size={20} />
            </Link>

            <Link 
              to="/cart" 
              style={styles.iconLink}
              onMouseEnter={handleIconHover}
              onMouseLeave={handleIconLeave}
            >
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span style={styles.badge}>
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div style={styles.userMenu}
                onMouseEnter={(e) => {
                  const dropdown = e.currentTarget.querySelector('.dropdown');
                  if (dropdown) dropdown.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const dropdown = e.currentTarget.querySelector('.dropdown');
                  if (dropdown) dropdown.style.display = 'none';
                }}
              >
                <button style={styles.userButton}>
                  <FaUser size={20} />
                  <span>{user?.first_name || user?.username}</span>
                  {isAdmin && <span style={styles.adminBadge}>Admin</span>}
                </button>
                <div className="dropdown" style={styles.userDropdown}>
                  <Link to="/account" style={styles.dropdownItem}>My Account</Link>
                  {isAdmin && (
                    <Link to="/admin" style={{...styles.dropdownItem, color: '#DB4444', fontWeight: '600'}}>
                      Admin Dashboard
                    </Link>
                  )}
                  <hr style={styles.dropdownDivider} />
                  <button onClick={logout} style={{...styles.dropdownItem, color: '#DC2626'}}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                style={styles.loginButton}
                onMouseEnter={handleLoginHover}
                onMouseLeave={handleLoginLeave}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            style={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={styles.mobileMenu} className="mobile-menu">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} style={styles.mobileSearchForm}>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.mobileSearchInput}
              />
              <button type="submit" style={styles.searchButton}>
                <FaSearch />
              </button>
            </form>

            <Link to="/" style={styles.mobileLink}>Home</Link>
            <Link to="/shop" style={styles.mobileLink}>Shop</Link>
            <Link to="/about" style={styles.mobileLink}>About</Link>
            <Link to="/contact" style={styles.mobileLink}>Contact</Link>
            <Link to="/signup" style={styles.mobileLink}>Sign Up</Link>
            <hr style={styles.mobileDivider} />
            <div style={styles.mobileActions}>
              <div style={styles.mobileActionsRow}>
                <Link to="/wishlist" style={styles.mobileIconLink}>
                  <FaHeart size={16} /> Wishlist
                </Link>
                <Link to="/cart" style={styles.mobileIconLink}>
                  <FaShoppingCart size={16} /> Cart
                  {totalItems > 0 && (
                    <span style={styles.mobileBadge}>{totalItems}</span>
                  )}
                </Link>
              </div>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" style={{...styles.mobileLink, color: '#DB4444', fontWeight: '600'}}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} style={styles.mobileLogout}>Logout</button>
                  <div style={{...styles.mobileLink, fontSize: '0.8rem', color: '#666'}}>
                    <FaUser size={14} /> Logged in as {user?.first_name || user?.username}
                  </div>
                </>
              ) : (
                <Link to="/login" style={styles.mobileLogin}>Login</Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav, .desktop-actions {
              display: none !important;
            }
            .mobile-menu-button {
              display: block !important;
            }
            .mobile-menu {
              display: block !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-button {
              display: none !important;
            }
            .mobile-menu {
              display: none !important;
            }
          }
          /* Smooth transition for mobile menu */
          .mobile-menu {
            animation: slideDown 0.3s ease-in-out;
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          /* Hover effects */
          .dropdown-item:hover {
            background-color: #F5F5F5;
          }
          .mobile-link:hover {
            color: #DB4444 !important;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;