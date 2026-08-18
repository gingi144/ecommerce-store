import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaBox, FaShoppingCart, FaUsers, 
  FaSignOutAlt, FaStore, FaTags, FaCog,
  FaChartBar, FaBars, FaTimes, FaChevronDown,
  FaChevronRight, FaTachometerAlt, FaGift,
  FaUserFriends, FaPhoneAlt
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(['products', 'orders', 'users']);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev =>
      prev.includes(menu)
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const styles = {
    adminContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
    },
    sidebar: {
      width: isSidebarOpen ? '260px' : '70px',
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      minHeight: '100vh',
      transition: 'width 0.3s ease',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 1000,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderBottom: '1px solid #333333',
      minHeight: '64px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#FFFFFF',
      textDecoration: 'none',
      fontSize: isSidebarOpen ? '1.1rem' : '0',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    logoIcon: {
      fontSize: '1.5rem',
      color: '#DB4444',
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      color: '#FFFFFF',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '0.25rem',
    },
    sidebarNav: {
      flex: 1,
      padding: '0.5rem 0',
      overflowY: 'auto',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      color: '#CCCCCC',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
      gap: '0.75rem',
      whiteSpace: 'nowrap',
    },
    navItemActive: {
      backgroundColor: 'rgba(219, 68, 68, 0.15)',
      color: '#DB4444',
      borderRight: '3px solid #DB4444',
    },
    navItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    navIcon: {
      fontSize: '1.2rem',
      minWidth: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navText: {
      flex: 1,
      fontSize: '0.9rem',
      overflow: 'hidden',
    },
    navArrow: {
      fontSize: '0.7rem',
      transition: 'transform 0.3s ease',
    },
    navArrowOpen: {
      transform: 'rotate(90deg)',
    },
    subNav: {
      paddingLeft: '1.5rem',
    },
    subNavItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 1rem 0.5rem 2.5rem',
      color: '#AAAAAA',
      textDecoration: 'none',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      gap: '0.5rem',
      whiteSpace: 'nowrap',
    },
    subNavItemActive: {
      color: '#DB4444',
    },
    sidebarFooter: {
      padding: '1rem',
      borderTop: '1px solid #333333',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      color: '#CCCCCC',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: '6px',
      width: '100%',
      background: 'none',
      border: 'none',
      fontSize: '0.9rem',
    },
    content: {
      flex: 1,
      marginLeft: isSidebarOpen ? '260px' : '70px',
      padding: '1.5rem',
      transition: 'margin-left 0.3s ease',
      minHeight: '100vh',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #E5E5E5',
    },
    topBarTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#000000',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#666666',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    mobileOverlay: {
      display: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999,
    },
  };

  const navItems = [
    {
      path: '/admin',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      exact: true,
    },
    {
      path: '/admin/products',
      icon: <FaBox />,
      label: 'Products',
      menu: 'products',
      subItems: [
        { path: '/admin/products', label: 'All Products' },
        { path: '/admin/products/new', label: 'Add Product' },
      ],
    },
    {
      path: '/admin/orders',
      icon: <FaShoppingCart />,
      label: 'Orders',
      menu: 'orders',
      subItems: [
        { path: '/admin/orders', label: 'All Orders' },
      ],
    },
    {
      path: '/admin/users',
      icon: <FaUsers />,
      label: 'Users',
      menu: 'users',
      subItems: [
        { path: '/admin/users', label: 'All Users' },
      ],
    },
    {
      path: '/admin/customers',
      icon: <FaUserFriends />,
      label: 'Customers',
      menu: 'customers',
      subItems: [
        { path: '/admin/customers', label: 'All Customers' },
      ],
    },
    {
      path: '/admin/flash-sale',
      icon: <FaGift />,
      label: 'Flash Sales',
      menu: 'flash-sale',
      subItems: [
        { path: '/admin/flash-sale', label: 'Settings' },
      ],
    },
    {
      path: '/admin/categories',
      icon: <FaTags />,
      label: 'Categories',
      menu: 'categories',
      subItems: [
        { path: '/admin/categories', label: 'All Categories' },
      ],
    },
    {
      path: '/admin/settings',
      icon: <FaCog />,
      label: 'Settings',
      menu: 'settings',
      subItems: [
        { path: '/admin/settings', label: 'General' },
        { path: '/admin/settings/payment', label: 'Payment' },
      ],
    },
  ];

  return (
    <div style={styles.adminContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar} className="admin-sidebar">
        <div style={styles.sidebarHeader}>
          <Link to="/admin" style={styles.logo}>
            <span style={styles.logoIcon}><FaStore /></span>
            {isSidebarOpen && 'Admin Panel'}
          </Link>
          <button style={styles.toggleButton} onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav style={styles.sidebarNav}>
          {navItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isItemActive = isActive(item.path);
            const isExpanded = expandedMenus.includes(item.menu);

            if (hasSubItems) {
              return (
                <div key={item.path}>
                  <div
                    style={{
                      ...styles.navItem,
                      ...(isItemActive ? styles.navItemActive : {}),
                    }}
                    onClick={() => toggleMenu(item.menu)}
                    onMouseEnter={(e) => {
                      if (!isItemActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isItemActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={styles.navIcon}>{item.icon}</span>
                    {isSidebarOpen && (
                      <>
                        <span style={styles.navText}>{item.label}</span>
                        <span style={{
                          ...styles.navArrow,
                          ...(isExpanded ? styles.navArrowOpen : {}),
                        }}>
                          <FaChevronRight />
                        </span>
                      </>
                    )}
                  </div>
                  {isExpanded && isSidebarOpen && (
                    <div style={styles.subNav}>
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          style={{
                            ...styles.subNavItem,
                            ...(isActive(sub.path) ? styles.subNavItemActive : {}),
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(sub.path)) {
                              e.currentTarget.style.color = '#AAAAAA';
                            }
                          }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(isItemActive ? styles.navItemActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isItemActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isItemActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {isSidebarOpen && <span style={styles.navText}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#DB4444';
              e.currentTarget.style.backgroundColor = 'rgba(219, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#CCCCCC';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={styles.navIcon}><FaSignOutAlt /></span>
            {isSidebarOpen && <span style={styles.navText}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div 
        className="admin-overlay"
        style={styles.mobileOverlay} 
        onClick={() => setIsSidebarOpen(true)}
      ></div>

      {/* Main Content */}
      <div style={styles.content} className="admin-content">
        <div style={styles.topBar}>
          <h1 style={styles.topBarTitle}>
            {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h1>
          <div style={styles.topBarRight}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>A</div>
              <span>Admin</span>
            </div>
          </div>
        </div>
        {children}
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .admin-sidebar {
              width: ${isSidebarOpen ? '260px' : '0px'} !important;
              transform: ${isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            }
            .admin-content {
              margin-left: 0 !important;
              padding: 1rem !important;
            }
            .admin-overlay {
              display: ${isSidebarOpen ? 'block' : 'none'} !important;
            }
          }
          @media (max-width: 480px) {
            .admin-content {
              padding: 0.75rem !important;
            }
          }
          /* Scrollbar styling */
          .admin-sidebar::-webkit-scrollbar {
            width: 4px;
          }
          .admin-sidebar::-webkit-scrollbar-track {
            background: #1A1A1A;
          }
          .admin-sidebar::-webkit-scrollbar-thumb {
            background: #444444;
            border-radius: 2px;
          }
          .admin-sidebar::-webkit-scrollbar-thumb:hover {
            background: #666666;
          }
        `}
      </style>
    </div>
  );
};

export default AdminLayout;