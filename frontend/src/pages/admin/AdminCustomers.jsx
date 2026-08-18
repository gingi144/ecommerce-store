// src/pages/admin/AdminCustomers.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaPhone, 
  FaEnvelope, 
  FaUser, 
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaPhoneAlt,
  FaPhoneSlash,
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaUserPlus,
  FaUserCheck,
  FaUserClock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import api from '../../api';

const AdminCustomers = () => {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, active, ended
  const [callHistory, setCallHistory] = useState([]);
  const [callNotes, setCallNotes] = useState('');
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }
    fetchCustomers();
    fetchCallHistory();
  }, [isAdmin]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data || []);
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
        headers: { Authorization: `Bearer ${token}` }
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { color: '#10B981', icon: <FaCheckCircle />, text: 'Active' },
      'inactive': { color: '#6B7280', icon: <FaUserClock />, text: 'Inactive' },
      'blocked': { color: '#EF4444', icon: <FaTimesCircle />, text: 'Blocked' },
      'pending': { color: '#F59E0B', icon: <FaExclamationCircle />, text: 'Pending' }
    };
    const badge = badges[status?.toLowerCase()] || badges['inactive'];
    return badge;
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

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#F8F9FA',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
    },
    titleSub: {
      fontSize: '0.875rem',
      color: '#666666',
      fontWeight: '400',
      display: 'block',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E5E5',
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#999999',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginTop: '0.25rem',
    },
    statChange: {
      fontSize: '0.75rem',
      color: '#10B981',
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
      backgroundColor: '#FFFFFF',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #E5E5E5',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: '1',
      maxWidth: '400px',
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    filterContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterSelect: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: '#FFFFFF',
      outline: 'none',
      cursor: 'pointer',
    },
    tableContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #E5E5E5',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      backgroundColor: '#F8F9FA',
      borderBottom: '2px solid #E5E5E5',
      fontWeight: '600',
      color: '#000000',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    td: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #F5F5F5',
      fontSize: '0.875rem',
      color: '#333333',
      verticalAlign: 'middle',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600',
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
      marginRight: '0.25rem',
    },
    phoneButton: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    phoneButtonHover: {
      backgroundColor: '#059669',
    },
    viewButton: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
    },
    viewButtonHover: {
      backgroundColor: '#2563EB',
    },
    editButton: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
    },
    editButtonHover: {
      backgroundColor: '#D97706',
    },
    deleteButton: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
    deleteButtonHover: {
      backgroundColor: '#DC2626',
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
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#999999',
      padding: '0.25rem',
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
    callButtonEndHover: {
      backgroundColor: '#DC2626',
      transform: 'scale(1.05)',
    },
    callButtonCall: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    callButtonCallHover: {
      backgroundColor: '#059669',
      transform: 'scale(1.05)',
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
    loadingText: {
      textAlign: 'center',
      padding: '2rem 0',
      color: '#999999',
    },
    noDataText: {
      textAlign: 'center',
      padding: '2rem 0',
      color: '#999999',
    },
    callHistoryList: {
      marginTop: '1rem',
    },
    callHistoryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #F5F5F5',
    },
    customerName: {
      fontWeight: '600',
      color: '#000000',
    },
    customerEmail: {
      fontSize: '0.75rem',
      color: '#999999',
    },
    customerPhone: {
      fontSize: '0.875rem',
      color: '#000000',
    },
  };

  if (!isAdmin) {
    return null;
  }

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const newCustomers = customers.filter(c => {
    const joined = new Date(c.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Customer Management
              <span style={styles.titleSub}>Manage and call your customers</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              style={{...styles.actionButton, ...styles.phoneButton, padding: '0.5rem 1rem'}}
              onClick={() => setShowCallHistory(!showCallHistory)}
            >
              <FaHistory /> Call History
            </button>
            <button 
              style={{...styles.actionButton, ...styles.editButton, padding: '0.5rem 1rem'}}
              onClick={() => {/* Export functionality */}}
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Customers</div>
            <div style={styles.statValue}>{totalCustomers}</div>
            <div style={styles.statChange}>
              <FaUser /> All registered users
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Customers</div>
            <div style={styles.statValue}>{activeCustomers}</div>
            <div style={{...styles.statChange, color: '#10B981'}}>
              <FaUserCheck /> Active accounts
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>New Customers (30 days)</div>
            <div style={styles.statValue}>{newCustomers}</div>
            <div style={{...styles.statChange, color: '#3B82F6'}}>
              <FaUserPlus /> New signups
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Calls Made</div>
            <div style={styles.statValue}>{callHistory.length}</div>
            <div style={{...styles.statChange, color: '#8B5CF6'}}>
              <FaPhoneAlt /> Call history
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchContainer}>
            <FaSearch style={{ color: '#999999' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterContainer}>
            <FaFilter style={{ color: '#999999' }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Call History Section */}
        {showCallHistory && (
          <div style={{...styles.statCard, marginBottom: '1.5rem'}}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              <FaHistory /> Recent Call History
            </h3>
            {callHistory.length === 0 ? (
              <div style={styles.noDataText}>No call history available</div>
            ) : (
              <div style={styles.callHistoryList}>
                {callHistory.slice(0, 10).map((call, index) => {
                  const statusBadge = getCallStatusBadge(call.status);
                  return (
                    <div key={index} style={styles.callHistoryItem}>
                      <div>
                        <div style={styles.customerName}>
                          {call.customer_name || 'Unknown Customer'}
                        </div>
                        <div style={styles.customerEmail}>{call.customer_phone || 'No phone'}</div>
                      </div>
                      <div>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: statusBadge.color + '20',
                          color: statusBadge.color,
                        }}>
                          {statusBadge.text}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999999', marginLeft: '0.5rem' }}>
                          {call.duration ? `${call.duration}s` : ''}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999999', marginLeft: '0.5rem' }}>
                          {formatDate(call.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customer Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingText}>Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div style={styles.noDataText}>No customers found</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Orders</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const statusBadge = getStatusBadge(customer.status);
                  return (
                    <tr key={customer.id}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#F5F5F5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#666666',
                          }}>
                            {(customer.first_name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#000000' }}>
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#999999' }}>
                              @{customer.username || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#000000' }}>
                            {customer.phone || 'No phone'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#999999' }}>
                            <FaEnvelope style={{ marginRight: '0.25rem' }} />
                            {customer.email}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.875rem' }}>
                          {formatDate(customer.created_at)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: '600', color: '#000000' }}>
                          {customer.order_count || 0}
                        </span>
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
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button
                            style={{...styles.actionButton, ...styles.phoneButton}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
                            onClick={() => handleCall(customer)}
                            title="Call Customer"
                          >
                            <FaPhone /> Call
                          </button>
                          <button
                            style={{...styles.actionButton, ...styles.viewButton}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
                            onClick={() => {/* View customer details */}}
                            title="View Customer"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            style={{...styles.actionButton, ...styles.editButton}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#D97706'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#F59E0B'}
                            onClick={() => {/* Edit customer */}}
                            title="Edit Customer"
                          >
                            <FaEdit /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <FaPhoneAlt style={{ marginRight: '0.5rem', color: '#DB4444' }} />
                Calling Customer
              </h2>
              <button style={styles.modalClose} onClick={() => {
                if (callStatus === 'calling' || callStatus === 'active') {
                  if (window.confirm('Are you sure you want to end this call?')) {
                    handleEndCall();
                  }
                } else {
                  setShowCallModal(false);
                  setSelectedCustomer(null);
                }
              }}>
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

      <Footer />
    </div>
  );
};

export default AdminCustomers;