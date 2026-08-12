import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaSignOutAlt, FaStore, FaBars, FaTimes } from 'react-icons/fa';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Navbar Container ----- */
        .admin-navbar {
          background-color: #1A1A1A;
          color: #FFFFFF;
          border-bottom: 1px solid #333333;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .admin-navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .admin-navbar-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        /* ----- Logo ----- */
        .admin-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }
        .admin-logo:hover {
          color: #DB4444;
        }
        .admin-logo-icon {
          color: #DB4444;
        }

        /* ----- Desktop Navigation ----- */
        .admin-nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .admin-nav-link {
          color: #CCCCCC;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: color 0.2s ease;
          padding: 0.25rem 0;
          border-bottom: 2px solid transparent;
        }
        .admin-nav-link:hover {
          color: #DB4444;
          border-bottom-color: #DB4444;
        }
        .admin-nav-link-active {
          color: #DB4444;
          border-bottom-color: #DB4444;
        }
        .admin-logout-button {
          background: none;
          border: none;
          color: #CCCCCC;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: color 0.2s ease;
          padding: 0.25rem 0;
          border-bottom: 2px solid transparent;
        }
        .admin-logout-button:hover {
          color: #DB4444;
          border-bottom-color: #DB4444;
        }

        /* ----- Mobile Menu Button ----- */
        .admin-mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          transition: color 0.3s ease;
        }
        .admin-mobile-toggle:hover {
          color: #DB4444;
        }

        /* ----- Mobile Menu ----- */
        .admin-mobile-menu {
          display: none;
          padding: 1rem 0;
          border-top: 1px solid #333333;
          background-color: #1A1A1A;
        }
        .admin-mobile-menu-open {
          display: block;
        }
        .admin-mobile-link {
          display: block;
          padding: 0.75rem 0;
          color: #CCCCCC;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
          border-bottom: 1px solid #2A2A2A;
        }
        .admin-mobile-link:hover {
          color: #DB4444;
        }
        .admin-mobile-link:last-child {
          border-bottom: none;
        }
        .admin-mobile-logout {
          background: none;
          border: none;
          color: #CCCCCC;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.75rem 0;
          display: block;
          transition: color 0.2s ease;
          width: 100%;
          text-align: left;
          border-bottom: 1px solid #2A2A2A;
        }
        .admin-mobile-logout:hover {
          color: #DB4444;
        }
        .admin-mobile-link-icon {
          margin-right: 0.5rem;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        @media (max-width: 768px) {
          .admin-nav-links {
            display: none !important;
          }
          .admin-mobile-toggle {
            display: block !important;
          }
        }

        @media (max-width: 480px) {
          .admin-navbar-container {
            padding: 0 0.75rem;
          }
          .admin-logo {
            font-size: 1rem;
          }
          .admin-logo-icon {
            font-size: 0.9rem;
          }
          .admin-mobile-toggle {
            font-size: 1.25rem;
          }
          .admin-mobile-menu {
            padding: 0.75rem 0;
          }
          .admin-mobile-link {
            padding: 0.6rem 0;
            font-size: 0.8rem;
          }
          .admin-mobile-logout {
            padding: 0.6rem 0;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 360px) {
          .admin-logo {
            font-size: 0.85rem;
          }
          .admin-mobile-link {
            font-size: 0.75rem;
            padding: 0.5rem 0;
          }
          .admin-mobile-logout {
            font-size: 0.75rem;
            padding: 0.5rem 0;
          }
        }
      `}</style>

      <nav className="admin-navbar">
        <div className="admin-navbar-container">
          <div className="admin-navbar-wrapper">
            {/* Logo */}
            <Link to="/admin" className="admin-logo">
              <FaStore className="admin-logo-icon" /> Admin Panel
            </Link>

            {/* Desktop Navigation */}
            <div className="admin-nav-links">
              <Link to="/admin" className="admin-nav-link">
                <FaHome /> Dashboard
              </Link>
              <Link to="/admin/products" className="admin-nav-link">
                <FaBox /> Products
              </Link>
              <Link to="/admin/orders" className="admin-nav-link">
                <FaShoppingCart /> Orders
              </Link>
              <Link to="/admin/users" className="admin-nav-link">
                <FaUsers /> Users
              </Link>
              <button onClick={handleLogout} className="admin-logout-button">
                <FaSignOutAlt /> Logout
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="admin-mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`admin-mobile-menu ${isMobileMenuOpen ? 'admin-mobile-menu-open' : ''}`}>
            <Link to="/admin" className="admin-mobile-link" onClick={closeMobileMenu}>
              <FaHome className="admin-mobile-link-icon" /> Dashboard
            </Link>
            <Link to="/admin/products" className="admin-mobile-link" onClick={closeMobileMenu}>
              <FaBox className="admin-mobile-link-icon" /> Products
            </Link>
            <Link to="/admin/orders" className="admin-mobile-link" onClick={closeMobileMenu}>
              <FaShoppingCart className="admin-mobile-link-icon" /> Orders
            </Link>
            <Link to="/admin/users" className="admin-mobile-link" onClick={closeMobileMenu}>
              <FaUsers className="admin-mobile-link-icon" /> Users
            </Link>
            <button onClick={handleLogout} className="admin-mobile-logout">
              <FaSignOutAlt className="admin-mobile-link-icon" /> Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
