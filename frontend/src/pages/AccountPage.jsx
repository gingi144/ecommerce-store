// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaBox, FaHeart, FaTimes, FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { getImageUrl } from '../utils/imageHelper';
import api from '../api';

const AccountPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [editing, setEditing] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: ''
  });
  
  // Change password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Kenya',
    is_default: false
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user profile
      const profileRes = await api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = profileRes.data;
      setProfileData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        username: userData.username || ''
      });
      
      // Fetch orders
      const ordersRes = await api.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersRes.data || []);
      
      // Fetch addresses
      const addressesRes = await api.get('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addressesRes.data || []);
      
      // Fetch wishlist
      const wishlistRes = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlistRes.data || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (editingAddressId) {
        await api.put(`/api/addresses/${editingAddressId}`, addressForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/addresses', addressForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Kenya',
        is_default: false
      });
      // Refresh addresses
      const addressesRes = await api.get('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addressesRes.data || []);
      alert('Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      alert('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Error deleting address. Please try again.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/addresses/${addressId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      alert('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Error updating default address. Please try again.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'processing': '#3B82F6',
      'shipped': '#8B5CF6',
      'delivered': '#10B981',
      'cancelled': '#EF4444',
      'refunded': '#6B7280'
    };
    return colors[status?.toLowerCase()] || '#6B7280';
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
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '2rem',
    },
    accountLayout: {
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: '2rem',
    },
    sidebar: {
      backgroundColor: '#F8F8F8',
      borderRadius: '8px',
      padding: '1.5rem',
      height: 'fit-content',
      position: 'sticky',
      top: '80px',
    },
    sidebarTitle: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '1rem',
    },
    sidebarSection: {
      marginBottom: '1.5rem',
    },
    sidebarLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#999999',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.5rem',
    },
    sidebarItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0.75rem',
      color: '#666666',
      textDecoration: 'none',
      fontSize: '0.875rem',
      borderRadius: '4px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left',
    },
    sidebarItemActive: {
      color: '#DB4444',
      backgroundColor: 'rgba(219, 68, 68, 0.08)',
      fontWeight: '600',
    },
    sidebarIcon: {
      width: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '1.5rem',
      border: '1px solid #E5E5E5',
    },
    contentTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.25rem',
    },
    formInput: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: '#000000',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      backgroundColor: '#FFFFFF',
    },
    formInputDisabled: {
      backgroundColor: '#F5F5F5',
      color: '#999999',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    formButton: {
      padding: '0.625rem 1.5rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    formButtonSecondary: {
      backgroundColor: 'transparent',
      color: '#666666',
      border: '1px solid #E5E5E5',
    },
    formButtonDanger: {
      backgroundColor: '#DC2626',
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
      flexWrap: 'wrap',
    },
    orderCard: {
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    orderId: {
      fontWeight: '700',
      color: '#000000',
    },
    orderDate: {
      fontSize: '0.875rem',
      color: '#999999',
    },
    orderStatus: {
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#FFFFFF',
    },
    orderItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    orderItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid #F5F5F5',
    },
    orderItemImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    orderItemDetails: {
      flex: 1,
    },
    orderItemName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#000000',
    },
    orderItemQty: {
      fontSize: '0.75rem',
      color: '#999999',
    },
    orderItemPrice: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#DB4444',
    },
    orderTotal: {
      textAlign: 'right',
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid #E5E5E5',
    },
    orderTotalLabel: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    orderTotalAmount: {
      fontSize: '1.125rem',
      fontWeight: '700',
      color: '#DB4444',
    },
    addressCard: {
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      position: 'relative',
    },
    addressDefault: {
      backgroundColor: '#F0FDF4',
      borderColor: '#10B981',
    },
    addressDefaultBadge: {
      position: 'absolute',
      top: '0.75rem',
      right: '0.75rem',
      backgroundColor: '#10B981',
      color: '#FFFFFF',
      fontSize: '0.625rem',
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      fontWeight: '600',
    },
    addressActions: {
      marginTop: '0.75rem',
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    addressActionButton: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#F5F5F5',
      color: '#666666',
    },
    addressActionButtonPrimary: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
    },
    addressActionButtonDanger: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 0',
    },
    emptyStateIcon: {
      fontSize: '3rem',
      color: '#E5E5E5',
      marginBottom: '1rem',
    },
    emptyStateTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.25rem',
    },
    emptyStateText: {
      fontSize: '0.875rem',
      color: '#999999',
    },
    wishlistGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    },
    wishlistItem: {
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      padding: '0.75rem',
      textAlign: 'center',
    },
    wishlistItemImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    wishlistItemName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#000000',
      marginTop: '0.5rem',
    },
    wishlistItemPrice: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#DB4444',
      marginTop: '0.25rem',
    },
    loadingText: {
      textAlign: 'center',
      padding: '2rem 0',
      color: '#999999',
    },
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'addresses':
        return renderAddressesTab();
      case 'orders':
        return renderOrdersTab();
      case 'wishlist':
        return renderWishlistTab();
      default:
        return null;
    }
  };

  const renderProfileTab = () => {
    return (
      <div>
        <h2 style={styles.contentTitle}>My Profile</h2>
        
        <form onSubmit={handleProfileUpdate}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>First Name</label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                disabled={!editing}
                style={{
                  ...styles.formInput,
                  ...(!editing ? styles.formInputDisabled : {})
                }}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Last Name</label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                disabled={!editing}
                style={{
                  ...styles.formInput,
                  ...(!editing ? styles.formInputDisabled : {})
                }}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              disabled={!editing}
              style={{
                ...styles.formInput,
                ...(!editing ? styles.formInputDisabled : {})
              }}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              disabled={!editing}
              style={{
                ...styles.formInput,
                ...(!editing ? styles.formInputDisabled : {})
              }}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              disabled={!editing}
              style={{
                ...styles.formInput,
                ...(!editing ? styles.formInputDisabled : {})
              }}
            />
          </div>
          
          <div style={styles.formActions}>
            {!editing ? (
              <button
                type="button"
                style={styles.formButton}
                onClick={() => setEditing(true)}
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  style={styles.formButton}
                  disabled={saving}
                >
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  style={{...styles.formButton, ...styles.formButtonSecondary}}
                  onClick={() => {
                    setEditing(false);
                    fetchUserData();
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
        
        <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '2rem 0' }} />
        
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#000000', marginBottom: '1rem' }}>
          Change Password
        </h3>
        
        <form onSubmit={handlePasswordChange}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Current Password</label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
              style={styles.formInput}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>New Password</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              style={styles.formInput}
              required
              minLength="6"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              style={styles.formInput}
              required
              minLength="6"
            />
          </div>
          
          <button
            type="submit"
            style={styles.formButton}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    );
  };

  const renderAddressesTab = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={styles.contentTitle}>Address Book</h2>
          <button
            style={styles.formButton}
            onClick={() => {
              setShowAddressForm(true);
              setEditingAddressId(null);
              setAddressForm({
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'Kenya',
                is_default: false
              });
            }}
          >
            Add New Address
          </button>
        </div>
        
        {showAddressForm && (
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#000000', marginBottom: '1rem' }}>
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </h3>
            
            <form onSubmit={handleAddressSave}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Address Line 1</label>
                <input
                  type="text"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})}
                  style={styles.formInput}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({...addressForm, address_line2: e.target.value})}
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>State / County</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Country</label>
                  <select
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    style={styles.formInput}
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                  />
                  Set as default address
                </label>
              </div>
              
              <div style={styles.formActions}>
                <button type="submit" style={styles.formButton} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  style={{...styles.formButton, ...styles.formButtonSecondary}}
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {addresses.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <FaMapMarkerAlt />
            </div>
            <p style={styles.emptyStateTitle}>No addresses saved</p>
            <p style={styles.emptyStateText}>Add your first address for faster checkout</p>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} style={{...styles.addressCard, ...(address.is_default ? styles.addressDefault : {})}}>
              {address.is_default && (
                <span style={styles.addressDefaultBadge}>Default</span>
              )}
              <p style={{ fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>
                {address.address_line1}
              </p>
              {address.address_line2 && (
                <p style={{ color: '#666666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {address.address_line2}
                </p>
              )}
              <p style={{ color: '#666666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p style={{ color: '#666666', fontSize: '0.875rem' }}>
                {address.country}
              </p>
              
              <div style={styles.addressActions}>
                {!address.is_default && (
                  <button
                    style={{...styles.addressActionButton, ...styles.addressActionButtonPrimary}}
                    onClick={() => handleSetDefaultAddress(address.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  style={styles.addressActionButton}
                  onClick={() => {
                    setEditingAddressId(address.id);
                    setAddressForm({
                      address_line1: address.address_line1,
                      address_line2: address.address_line2 || '',
                      city: address.city,
                      state: address.state || '',
                      postal_code: address.postal_code || '',
                      country: address.country,
                      is_default: address.is_default
                    });
                    setShowAddressForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  style={{...styles.addressActionButton, ...styles.addressActionButtonDanger}}
                  onClick={() => handleAddressDelete(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderOrdersTab = () => {
    return (
      <div>
        <h2 style={styles.contentTitle}>My Orders</h2>
        
        {loading ? (
          <div style={styles.loadingText}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <FaBox />
            </div>
            <p style={styles.emptyStateTitle}>No orders yet</p>
            <p style={styles.emptyStateText}>Start shopping to see your orders here</p>
            <Link to="/shop" style={{...styles.formButton, display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <span style={styles.orderId}>Order #{order.order_number || order.id}</span>
                  <span style={styles.orderDate}> • {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <span style={{
                  ...styles.orderStatus,
                  backgroundColor: getOrderStatusColor(order.status)
                }}>
                  {order.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              
              <div style={styles.orderItems}>
                {(order.items || []).map((item, index) => (
                  <div key={index} style={styles.orderItem}>
                    <img
                      src={getImageUrl(item.product?.images?.[0]?.image_url) || '/api/placeholder/60/60'}
                      alt={item.product?.name || item.name}
                      style={styles.orderItemImage}
                    />
                    <div style={styles.orderItemDetails}>
                      <div style={styles.orderItemName}>{item.product?.name || item.name}</div>
                      <div style={styles.orderItemQty}>Qty: {item.quantity}</div>
                    </div>
                    <div style={styles.orderItemPrice}>{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>
              
              <div style={styles.orderTotal}>
                <span style={styles.orderTotalLabel}>Total: </span>
                <span style={styles.orderTotalAmount}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWishlistTab = () => {
    return (
      <div>
        <h2 style={styles.contentTitle}>My Wishlist</h2>
        
        {loading ? (
          <div style={styles.loadingText}>Loading wishlist...</div>
        ) : wishlist.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <FaHeart />
            </div>
            <p style={styles.emptyStateTitle}>Your wishlist is empty</p>
            <p style={styles.emptyStateText}>Start adding items you love</p>
            <Link to="/shop" style={{...styles.formButton, display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={styles.wishlistGrid}>
            {wishlist.map(item => (
              <div key={item.id} style={styles.wishlistItem}>
                <img
                  src={getImageUrl(item.product?.images?.[0]?.image_url) || '/api/placeholder/200/150'}
                  alt={item.product?.name}
                  style={styles.wishlistItemImage}
                />
                <Link to={`/product/${item.product?.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.wishlistItemName}>{item.product?.name}</div>
                </Link>
                <div style={styles.wishlistItemPrice}>{formatPrice(item.product?.price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link 
            to="/" 
            style={styles.breadcrumbLink}
            onMouseEnter={(e) => e.target.style.color = '#DB4444'}
            onMouseLeave={(e) => e.target.style.color = '#999999'}
          >
            Home
          </Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>My Account</span>
        </div>

        <h1 style={styles.pageTitle}>My Account</h1>

        <div style={styles.accountLayout}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarSection}>
              <div style={styles.sidebarLabel}>Manage My Account</div>
              <button
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === 'profile' ? styles.sidebarItemActive : {})
                }}
                onClick={() => setActiveTab('profile')}
              >
                <span style={styles.sidebarIcon}><FaUser /></span>
                My Profile
              </button>
              <button
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === 'addresses' ? styles.sidebarItemActive : {})
                }}
                onClick={() => setActiveTab('addresses')}
              >
                <span style={styles.sidebarIcon}><FaMapMarkerAlt /></span>
                Address Book
              </button>
            </div>

            <div style={styles.sidebarSection}>
              <div style={styles.sidebarLabel}>My Orders</div>
              <button
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === 'orders' ? styles.sidebarItemActive : {})
                }}
                onClick={() => setActiveTab('orders')}
              >
                <span style={styles.sidebarIcon}><FaBox /></span>
                Orders
              </button>
            </div>

            <div style={styles.sidebarSection}>
              <div style={styles.sidebarLabel}>Favorites</div>
              <button
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === 'wishlist' ? styles.sidebarItemActive : {})
                }}
                onClick={() => setActiveTab('wishlist')}
              >
                <span style={styles.sidebarIcon}><FaHeart /></span>
                Wishlist
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '1rem 0' }} />

            <button
              style={{...styles.sidebarItem, color: '#DC2626'}}
              onClick={handleLogout}
            >
              <span style={styles.sidebarIcon}><FaTimes /></span>
              Logout
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {renderTabContent()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountPage;