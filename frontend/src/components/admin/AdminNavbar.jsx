import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaSignOutAlt, FaStore } from 'react-icons/fa';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    navigate('/login');
  };

  const styles = {
    navbar: {
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      borderBottom: '1px solid #333333',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    navWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
    },
    logo: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#FFFFFF',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    navLink: {
      color: '#CCCCCC',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'color 0.2s ease',
    },
    logoutButton: {
      background: 'none',
      border: 'none',
      color: '#CCCCCC',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'color 0.2s ease',
    },
    mobileMenuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: '#FFFFFF',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
    mobileMenu: {
      display: 'none',
      padding: '1rem 0',
      borderTop: '1px solid #333333',
    },
    mobileLink: {
      display: 'block',
      padding: '0.5rem 0',
      color: '#CCCCCC',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s ease',
    },
    mobileLogout: {
      background: 'none',
      border: 'none',
      color: '#CCCCCC',
      fontSize: '0.875rem',
      cursor: 'pointer',
      padding: '0.5rem 0',
      display: 'block',
      transition: 'color 0.2s ease',
    },
  };

  const handleLinkHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleLinkLeave = (e) => {
    e.target.style.color = '#CCCCCC';
  };

  const handleLogoutHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleLogoutLeave = (e) => {
    e.target.style.color = '#CCCCCC';
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.navWrapper}>
          {/* Logo */}
          <Link to="/admin" style={styles.logo}>
            <FaStore /> Admin Panel
          </Link>

          {/* Desktop Navigation */}
          <div style={styles.navLinks}>
            <Link 
              to="/admin" 
              style={styles.navLink}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              <FaHome /> Dashboard
            </Link>
            <Link 
              to="/admin/products" 
              style={styles.navLink}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              <FaBox /> Products
            </Link>
            <Link 
              to="/admin/orders" 
              style={styles.navLink}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              <FaShoppingCart /> Orders
            </Link>
            <Link 
              to="/admin/users" 
              style={styles.navLink}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              <FaUsers /> Users
            </Link>
            <button 
              onClick={handleLogout} 
              style={styles.logoutButton}
              onMouseEnter={handleLogoutHover}
              onMouseLeave={handleLogoutLeave}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            style={styles.mobileMenuButton}
            onClick={() => {
              const menu = document.getElementById('adminMobileMenu');
              if (menu) {
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
              }
            }}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="adminMobileMenu" style={styles.mobileMenu}>
          <Link to="/admin" style={styles.mobileLink} onClick={() => {
            document.getElementById('adminMobileMenu').style.display = 'none';
          }}>
            <FaHome /> Dashboard
          </Link>
          <Link to="/admin/products" style={styles.mobileLink} onClick={() => {
            document.getElementById('adminMobileMenu').style.display = 'none';
          }}>
            <FaBox /> Products
          </Link>
          <Link to="/admin/orders" style={styles.mobileLink} onClick={() => {
            document.getElementById('adminMobileMenu').style.display = 'none';
          }}>
            <FaShoppingCart /> Orders
          </Link>
          <Link to="/admin/users" style={styles.mobileLink} onClick={() => {
            document.getElementById('adminMobileMenu').style.display = 'none';
          }}>
            <FaUsers /> Users
          </Link>
          <button 
            onClick={handleLogout} 
            style={styles.mobileLogout}
            onMouseEnter={handleLogoutHover}
            onMouseLeave={handleLogoutLeave}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .admin-nav-links {
              display: none !important;
            }
            .admin-mobile-menu-button {
              display: block !important;
            }
            .admin-mobile-menu {
              display: block !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default AdminNavbar;