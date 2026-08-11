import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaEdit, FaTrash, FaEye, 
  FaUserCheck, FaUserTimes, FaSearch,
  FaSortUp, FaSortDown, FaFilter,
  FaShieldAlt, FaUser, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

const AdminUsers = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    customers: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, authLoading]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: 'Bearer ' + token }
      });
      
      const userData = response.data || [];
      setUsers(userData);
      
      // Calculate stats
      const admins = userData.filter(u => u.is_admin).length;
      const now = new Date();
      const thisMonth = userData.filter(u => {
        const created = new Date(u.created_at);
        return created.getMonth() === now.getMonth() && 
               created.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        total: userData.length,
        admins: admins,
        customers: userData.length - admins,
        newThisMonth: thisMonth
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
        { is_admin: !currentRole },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user role:', error);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.first_name?.toLowerCase().includes(term) ||
        u.last_name?.toLowerCase().includes(term) ||
        u.phone?.includes(term)
      );
    }
    
    // Role filter
    if (filterRole === 'admin') {
      filtered = filtered.filter(u => u.is_admin);
    } else if (filterRole === 'customer') {
      filtered = filtered.filter(u => !u.is_admin);
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

  const filteredUsers = getFilteredUsers();

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

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    return (user.username?.[0] || 'U').toUpperCase();
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
    userCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    userAvatar: {
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
    userName: {
      fontWeight: '500',
      color: '#000000',
    },
    userEmail: {
      fontSize: '0.8rem',
      color: '#666666',
    },
    roleBadge: {
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    roleAdmin: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    roleCustomer: {
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
    },
    actionButton: {
      padding: '0.25rem',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      transition: 'color 0.3s ease, transform 0.2s ease',
      fontSize: '1rem',
      borderRadius: '4px',
    },
    actionView: {
      color: '#8B5CF6',
    },
    actionEdit: {
      color: '#3B82F6',
    },
    actionRole: {
      color: '#F59E0B',
    },
    actionDelete: {
      color: '#DC2626',
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
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleActionLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchUsers();
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '1rem', color: '#666666' }}>Loading users...</p>
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
          <h1 style={styles.pageTitle}>Users</h1>
          <div style={styles.headerActions}>
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
            >
              <FaUsers /> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FaUsers style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.total}</span>
              <span style={styles.statLabel}>Total Users</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaShieldAlt style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.admins}</span>
              <span style={styles.statLabel}>Admins</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaUser style={styles.statIcon} />
            <div style={styles.statContent}>
              <span style={styles.statNumber}>{stats.customers}</span>
              <span style={styles.statLabel}>Customers</span>
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

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
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
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="customer">Customers</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => handleSort('first_name')}>
                    <div style={styles.thContent}>
                      User
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
                  <th style={styles.th} onClick={() => handleSort('is_admin')}>
                    <div style={styles.thContent}>
                      Role
                      {sortField === 'is_admin' && (
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
                {filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    style={styles.tr}
                    onMouseEnter={handleRowHover}
                    onMouseLeave={handleRowLeave}
                  >
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.userAvatar}>
                          {getInitials(user)}
                        </div>
                        <div>
                          <div style={styles.userName}>
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                          <div style={styles.userEmail}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaEnvelope size={14} color="#999" />
                        {user.email}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPhone size={14} color="#999" />
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        ...(user.is_admin ? styles.roleAdmin : styles.roleCustomer)
                      }}>
                        {user.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCalendarAlt size={14} color="#999" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{ ...styles.actionButton, ...styles.actionView }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          title="View User"
                          onMouseEnter={handleActionHover}
                          onMouseLeave={handleActionLeave}
                        >
                          <FaEye />
                        </button>
                        <button 
                          style={{ ...styles.actionButton, ...styles.actionRole }}
                          onClick={() => toggleUserRole(user.id, user.is_admin)}
                          title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          onMouseEnter={handleActionHover}
                          onMouseLeave={handleActionLeave}
                        >
                          <FaShieldAlt />
                        </button>
                        <button 
                          style={{ ...styles.actionButton, ...styles.actionDelete }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          title="Delete User"
                          onMouseEnter={handleActionHover}
                          onMouseLeave={handleActionLeave}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><FaUsers /></div>
              <h3 style={styles.emptyTitle}>No users found</h3>
              <p style={styles.emptyText}>
                {searchTerm ? 'Try adjusting your search' : 'No users registered yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>User Details</h2>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ ...styles.userAvatar, width: '60px', height: '60px', fontSize: '1.5rem' }}>
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {selectedUser.first_name || ''} {selectedUser.last_name || ''}
                  </div>
                  <div style={{ color: '#666666' }}>@{selectedUser.username}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
                <div><strong>Role:</strong> {selectedUser.is_admin ? 'Admin' : 'Customer'}</div>
                <div><strong>Joined:</strong> {formatDate(selectedUser.created_at)}</div>
                <div><strong>Address:</strong> {selectedUser.address || 'N/A'}</div>
                <div><strong>City:</strong> {selectedUser.city || 'N/A'}</div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{ ...styles.modalButton, ...styles.modalButtonSecondary }}
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete User</h2>
            <div style={styles.modalBody}>
              <p>Are you sure you want to delete user <strong>{selectedUser.username}</strong>?</p>
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
                onClick={() => deleteUser(selectedUser.id)}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;