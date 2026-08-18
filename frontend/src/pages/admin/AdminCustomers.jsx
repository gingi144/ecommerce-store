// src/pages/admin/AdminCustomers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaEdit, FaTrash, FaEye, 
  FaUserCheck, FaUserTimes, FaSearch,
  FaSortUp, FaSortDown, FaFilter,
  FaUser, FaEnvelope, FaPhone, 
  FaCalendarAlt, FaPhoneAlt, FaPhoneSlash,
  FaHistory, FaClock, FaCheckCircle,
  FaTimesCircle, FaExclamationCircle,
  FaUserPlus, FaUserClock, FaUserFriends
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api';

const AdminCustomers = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('idle');
  const [callHistory, setCallHistory] = useState([]);
  const [callNotes, setCallNotes] = useState('');
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
    if (isAdmin) {
      fetchCustomers();
      fetchCallHistory();
    }
  }, [isAdmin, authLoading]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the same endpoint as AdminUsers - /api/admin/users
      const response = await api.get('/api/admin/users', {
        headers: { Authorization: 'Bearer ' + token }
      });
      
      // Filter to only get customers (non-admin users)
      const allUsers = response.data || [];
      const customerData = allUsers.filter(user => !user.is_admin);
      
      setCustomers(customerData);
      
      // Calculate stats
      const active = customerData.filter(c => c.status === 'active').length;
      const inactive = customerData.filter(c => c.status === 'inactive' || c.status === 'blocked').length;
      const now = new Date();
      const thisMonth = customerData.filter(c => {
        const created = new Date(c.created_at);
        return created.getMonth() === now.getMonth() && 
               created.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        total: customerData.length,
        active: active,
        inactive: inactive,
        newThisMonth: thisMonth
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/call-history', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setCallHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  const handleCall = (customer) => {
    setSelectedCustomer(customer);
    setShowCallModal(true);
    setCallStatus('calling');
    setCallDuration(0);
    
    // Simulate call connection
    setTimeout(() => {
      setCallStatus('active');
    }, 2000);
  };

  const handleEndCall = async () => {
    setCallStatus('ended');
    
    // Save call log
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/admin/call-log', {
        customer_id: selectedCustomer.id,
        duration: callDuration,
        notes: callNotes,
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh call history
      fetchCallHistory();
    } catch (error) {
      console.error('Error saving call log:', error);
    }
    
    setTimeout(() => {
      setShowCallModal(false);
      setSelectedCustomer(null);
      setCallStatus('idle');
      setCallDuration(0);
      setCallNotes('');
    }, 1000);
  };

  const handleCallCustomer = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('No phone number available for this customer');
    }
  };

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/api/admin/users/${customerId}/status`, 
        { status: newStatus },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/admin/users/${customerId}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const getFilteredCustomers = () => {
    let filtered = customers;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.username?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.first_name?.toLowerCase().includes(term) ||
        c.last_name?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (customer) => {
    if (customer.first_name && customer.last_name) {
      return (customer.first_name[0] + customer.last_name[0]).toUpperCase();
    }
    return (customer.username?.[0] || 'C').toUpperCase();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { color: '#10B981', icon: <FaUserCheck />, text: 'Active' },
      'inactive': { color: '#6B7280', icon: <FaUserClock />, text: 'Inactive' },
      'blocked': { color: '#EF4444', icon: <FaUserTimes />, text: 'Blocked' },
      'pending': { color: '#F59E0B', icon: <FaExclamationCircle />, text: 'Pending' }
    };
    return badges[status?.toLowerCase()] || badges['inactive'];
  };

  const getCallStatusBadge = (status) => {
    const badges = {
      'completed': { color: '#10B981', text: 'Completed' },
      'missed': { color: '#EF4444', text: 'Missed' },
      'voicemail': { color: '#F59E0B', text: 'Voicemail' },
      'no-answer': { color: '#6B7280', text: 'No Answer' }
    };
    return badges[status?.toLowerCase()] || badges['missed'];
  };

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      margin: 0,
    },
    headerActions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      fontSize: '2rem',
      color: '#DB4444',
      opacity: 0.7,
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    statNumber: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      padding: '0.25rem 0.75rem',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      padding: '0.5rem',
      fontSize: '0.875rem',
      width: '200px',
      backgroundColor: 'transparent',
      color: '#000000',
    },
    searchIcon: {
      color: '#999999',
    },
    filterWrapper: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    filterIcon: {
      color: '#999999',
    },
    filterSelect: {
      padding: '0.5rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      cursor: 'pointer',
    },
    refreshButton: {
      backgroundColor: '#F3F4F6',
      color: '#000000',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid #E5E5E5',
      cursor: 'pointer',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
    },
    tableCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#666666',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #E5E5E5',
      backgroundColor: '#FAFAFA',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    thContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    tr: {
      borderBottom: '1px solid #F0F0F0',
      transition: 'background-color 0.2s ease',
    },
    td: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      color: '#000000',
      verticalAlign: 'middle',
    },
    customerCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    customerAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      fontWeight: '600',
      flexShrink: 0,
    },
    customerName: {
      fontWeight: '500',
      color: '#000000',
    },
    customerEmail: {
      fontSize: '0.8rem',
      color: '#666666',
    },
    statusBadge: {
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    actionView: {
      backgroundColor: '#8B5CF6',
      color: '#FFFFFF',
    },
    actionCall: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    actionStatus: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
    },
    actionDelete: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 0',
    },
    emptyIcon: {
      fontSize: '3rem',
      color: '#E5E5E5',
      marginBottom: '1rem',
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    emptyText: {
      color: '#666666',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    modalBody: {
      marginBottom: '1.5rem',
    },
    modalFooter: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    modalButton: {
      padding: '0.5rem 1.5rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'background-color 0.3s ease',
    },
    modalButtonDanger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
    modalButtonSecondary: {
      backgroundColor: '#F3F4F6',
      color: '#000000',
      border: '1px solid #E5E5E5',
    },
    modalButtonPrimary: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '4rem 0',
    },
    spinner: {
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '4px solid #E5E5E5',
      borderTop: '4px solid #DB4444',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    callModal: {
      maxWidth: '500px',
    },
    callDisplay: {
      textAlign: 'center',
      padding: '2rem 0',
    },
    callAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      fontSize: '2.5rem',
      color: '#999999',
    },
    callName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#000000',
    },
    callPhone: {
      fontSize: '0.875rem',
      color: '#666666',
      marginTop: '0.25rem',
    },
    callTimer: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#DB4444',
      marginTop: '1rem',
    },
    callStatus: {
      fontSize: '0.875rem',
      color: '#666666',
      marginTop: '0.5rem',
    },
    callActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    callButton: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      transition: 'all 0.3s ease',
    },
    callButtonEnd: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
    callButtonCall: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    callNotes: {
      marginTop: '1.5rem',
    },
    callNotesInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      minHeight: '80px',
      resize: 'vertical',
      outline: 'none',
    },
    callHistorySection: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '2rem',
    },
    callHistoryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #F5F5F5',
    },
    callHistoryName: {
      fontWeight: '500',
      color: '#000000',
    },
    callHistoryPhone: {
      fontSize: '0.8rem',
      color: '#666666',
    },
  };

  const handleSearchFocus = (e) => {
    e.currentTarget.parentElement.style.borderColor = '#DB4444';
    e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.1)';
  };

  const handleSearchBlur = (e) => {
    e.currentTarget.parentElement.style.borderColor = '#E5E5E5';
    e.currentTarget.parentElement.style.boxShadow = 'none';
  };

  const handleRowHover = (e) => {
    e.currentTarget.style.backgroundColor = '#FAFAFA';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleActionHover = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleActionLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCustomers();
    fetchCallHistory();
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '1rem', color: '#666666' }}>Loading customers...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Customers</h1>
          <div style={styles.headerActions}>
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
            >
              <FaUserFriends /> Refresh
            </button>
            <button 
              style={{...styles.refreshButton, backgroundColor: '#10B981', color: '#FFFFFF', borderColor: '#10B981'}}
              onClick={() => setShowCallHistory(!showCallHistory)}
            >
              <FaHistory /> Call History
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FaUserFriends style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.total}</span>
              <span style={styles.statLabel}>Total Customers</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaUserCheck style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.active}</span>
              <span style={styles.statLabel}>Active</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaUserTimes style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.inactive}</span>
              <span style={styles.statLabel}>Inactive</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaCalendarAlt style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.newThisMonth}</span>
              <span style={styles.statLabel}>New This Month</span>
            </div>
          </div>
        </div>

        {/* Call History Section */}
        {showCallHistory && (
          <div style={styles.callHistorySection}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              <FaHistory /> Recent Call History
            </h3>
            {callHistory.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No call history available</p>
              </div>
            ) : (
              callHistory.slice(0, 10).map((call, index) => {
                const statusBadge = getCallStatusBadge(call.status);
                return (
                  <div key={index} style={styles.callHistoryItem}>
                    <div>
                      <div style={styles.callHistoryName}>
                        {call.customer_name || 'Unknown Customer'}
                      </div>
                      <div style={styles.callHistoryPhone}>
                        <FaPhone style={{ marginRight: '0.25rem' }} />
                        {call.customer_phone || 'No phone'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusBadge.color + '20',
                        color: statusBadge.color,
                      }}>
                        {statusBadge.text}
                      </span>
                      {call.duration && (
                        <span style={{ fontSize: '0.75rem', color: '#999999' }}>
                          {call.duration}s
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#999999' }}>
                        {formatDate(call.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </div>
          <div style={styles.filterWrapper}>
            <FaFilter style={styles.filterIcon} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => handleSort('first_name')}>
                    <div style={styles.thContent}>
                      Customer
                      {sortField === 'first_name' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th style={styles.th} onClick={() => handleSort('email')}>
                    <div style={styles.thContent}>
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th style={styles.th} onClick={() => handleSort('phone')}>
                    <div style={styles.thContent}>
                      Phone
                      {sortField === 'phone' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th style={styles.th} onClick={() => handleSort('status')}>
                    <div style={styles.thContent}>
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th style={styles.th} onClick={() => handleSort('created_at')}>
                    <div style={styles.thContent}>
                      Joined
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const statusBadge = getStatusBadge(customer.status);
                  return (
                    <tr 
                      key={customer.id} 
                      style={styles.tr}
                      onMouseEnter={handleRowHover}
                      onMouseLeave={handleRowLeave}
                    >
                      <td style={styles.td}>
                        <div style={styles.customerCell}>
                          <div style={styles.customerAvatar}>
                            {getInitials(customer)}
                          </div>
                          <div>
                            <div style={styles.customerName}>
                              {customer.first_name || ''} {customer.last_name || ''}
                            </div>
                            <div style={styles.customerEmail}>
                              @{customer.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaEnvelope size={14} color="#999" />
                          {customer.email}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaPhone size={14} color="#999" />
                          {customer.phone || 'N/A'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: statusBadge.color + '20',
                          color: statusBadge.color,
                        }}>
                          {statusBadge.icon} {statusBadge.text}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaCalendarAlt size={14} color="#999" />
                          {formatDate(customer.created_at)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button 
                            style={{ ...styles.actionButton, ...styles.actionCall }}
                            onClick={() => handleCall(customer)}
                            title="Call Customer"
                            onMouseEnter={handleActionHover}
                            onMouseLeave={handleActionLeave}
                          >
                            <FaPhoneAlt /> Call
                          </button>
                          <button 
                            style={{ ...styles.actionButton, ...styles.actionView }}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerModal(true);
                            }}
                            title="View Customer"
                            onMouseEnter={handleActionHover}
                            onMouseLeave={handleActionLeave}
                          >
                            <FaEye /> View
                          </button>
                          <button 
                            style={{ ...styles.actionButton, ...styles.actionStatus }}
                            onClick={() => toggleCustomerStatus(customer.id, customer.status)}
                            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                            onMouseEnter={handleActionHover}
                            onMouseLeave={handleActionLeave}
                          >
                            {customer.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                          </button>
                          <button 
                            style={{ ...styles.actionButton, ...styles.actionDelete }}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Customer"
                            onMouseEnter={handleActionHover}
                            onMouseLeave={handleActionLeave}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredCustomers.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><FaUserFriends /></div>
              <h3 style={styles.emptyTitle}>No customers found</h3>
              <p style={styles.emptyText}>
                {searchTerm ? 'Try adjusting your search' : 'No customers registered yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div style={styles.modalOverlay} onClick={() => setShowCustomerModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Customer Details</h2>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ ...styles.customerAvatar, width: '60px', height: '60px', fontSize: '1.5rem' }}>
                  {getInitials(selectedCustomer)}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {selectedCustomer.first_name || ''} {selectedCustomer.last_name || ''}
                  </div>
                  <div style={{ color: '#666666' }}>@{selectedCustomer.username}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div><strong>Email:</strong> {selectedCustomer.email}</div>
                <div><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</div>
                <div><strong>Status:</strong> {selectedCustomer.status || 'Active'}</div>
                <div><strong>Joined:</strong> {formatDate(selectedCustomer.created_at)}</div>
                <div><strong>Total Orders:</strong> {selectedCustomer.order_count || 0}</div>
                <div><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</div>
                <div><strong>City:</strong> {selectedCustomer.city || 'N/A'}</div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ ...styles.modalButton, ...styles.modalButtonPrimary }}
                onClick={() => {
                  setShowCustomerModal(false);
                  handleCall(selectedCustomer);
                }}
              >
                <FaPhoneAlt /> Call Customer
              </button>
              <button 
                style={{ ...styles.modalButton, ...styles.modalButtonSecondary }}
                onClick={() => setShowCustomerModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Customer</h2>
            <div style={styles.modalBody}>
              <p>Are you sure you want to delete customer <strong>{selectedCustomer.username}</strong>?</p>
              <p style={{ color: '#666666', marginTop: '0.5rem' }}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ ...styles.modalButton, ...styles.modalButtonSecondary }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{ ...styles.modalButton, ...styles.modalButtonDanger }}
                onClick={() => deleteCustomer(selectedCustomer.id)}
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && selectedCustomer && (
        <div style={styles.modalOverlay} onClick={() => {
          if (callStatus === 'calling' || callStatus === 'active') {
            if (window.confirm('Are you sure you want to end this call?')) {
              handleEndCall();
            }
          } else {
            setShowCallModal(false);
            setSelectedCustomer(null);
          }
        }}>
          <div style={{...styles.modal, ...styles.callModal}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <FaPhoneAlt style={{ marginRight: '0.5rem', color: '#DB4444' }} />
                Calling Customer
              </h2>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999999' }}
                onClick={() => {
                  if (callStatus === 'calling' || callStatus === 'active') {
                    if (window.confirm('Are you sure you want to end this call?')) {
                      handleEndCall();
                    }
                  } else {
                    setShowCallModal(false);
                    setSelectedCustomer(null);
                  }
                }}
              >
                <FaTimesCircle />
              </button>
            </div>

            <div style={styles.callDisplay}>
              <div style={styles.callAvatar}>
                <FaUser />
              </div>
              <div style={styles.callName}>
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </div>
              <div style={styles.callPhone}>
                <FaPhone style={{ marginRight: '0.25rem' }} />
                {selectedCustomer.phone || 'No phone number available'}
              </div>
              
              {callStatus === 'calling' && (
                <>
                  <div style={styles.callTimer}>Connecting...</div>
                  <div style={styles.callStatus}>Dialing {selectedCustomer.phone}</div>
                </>
              )}
              
              {callStatus === 'active' && (
                <>
                  <div style={styles.callTimer}>
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                  </div>
                  <div style={styles.callStatus}>Call in progress</div>
                </>
              )}
              
              {callStatus === 'ended' && (
                <>
                  <div style={{...styles.callTimer, color: '#666666'}}>
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                  </div>
                  <div style={{...styles.callStatus, color: '#10B981'}}>Call ended</div>
                </>
              )}
            </div>

            <div style={styles.callNotes}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#000000', display: 'block', marginBottom: '0.25rem' }}>
                Call Notes
              </label>
              <textarea
                style={styles.callNotesInput}
                placeholder="Add notes about this call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                disabled={callStatus === 'calling'}
              />
            </div>

            <div style={styles.callActions}>
              {callStatus === 'calling' && (
                <button
                  style={{
                    ...styles.callButton,
                    ...styles.callButtonCall,
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#10B981'; e.target.style.transform = 'scale(1)'; }}
                  onClick={() => handleCallCustomer(selectedCustomer.phone)}
                >
                  <FaPhone />
                </button>
              )}
              
              {(callStatus === 'calling' || callStatus === 'active') && (
                <button
                  style={{
                    ...styles.callButton,
                    ...styles.callButtonEnd,
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#DC2626'; e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#EF4444'; e.target.style.transform = 'scale(1)'; }}
                  onClick={handleEndCall}
                >
                  <FaPhoneSlash />
                </button>
              )}
              
              {callStatus === 'ended' && (
                <button
                  style={{
                    ...styles.callButton,
                    ...styles.callButtonCall,
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#10B981'; e.target.style.transform = 'scale(1)'; }}
                  onClick={() => {
                    setShowCallModal(false);
                    setSelectedCustomer(null);
                    setCallStatus('idle');
                    setCallDuration(0);
                    setCallNotes('');
                  }}
                >
                  <FaCheckCircle />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;