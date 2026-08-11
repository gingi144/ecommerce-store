import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, 
  FaClock, FaCalendarAlt, FaPercentage,
  FaToggleOn, FaToggleOff, FaSearch,
  FaFilter, FaSortUp, FaSortDown,
  FaDollarSign, FaTag, FaBox
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api';

const AdminFlashSale = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    expired: 0
  });

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/flash-sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const salesData = Array.isArray(response.data) ? response.data : [];
      setFlashSales(salesData);
      
      // Calculate stats
      const now = new Date();
      const active = salesData.filter(s => 
        s.is_active && 
        new Date(s.start_date) <= now && 
        new Date(s.end_date) >= now
      ).length;
      
      const upcoming = salesData.filter(s => 
        new Date(s.start_date) > now
      ).length;
      
      const expired = salesData.filter(s => 
        new Date(s.end_date) < now
      ).length;
      
      setStats({
        total: salesData.length,
        active: active,
        upcoming: upcoming,
        expired: expired
      });
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      setFlashSales([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlashSaleStatus = async (saleId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/admin/flash-sales/${saleId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFlashSales();
    } catch (error) {
      console.error('Error toggling flash sale:', error);
      alert('Failed to update flash sale status');
    }
  };

  const deleteFlashSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this flash sale?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/admin/flash-sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteModal(false);
      fetchFlashSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      alert('Failed to delete flash sale');
    }
  };

  const getFilteredSales = () => {
    let filtered = flashSales;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    const now = new Date();
    if (filterStatus === 'active') {
      filtered = filtered.filter(s => 
        s.is_active && 
        new Date(s.start_date) <= now && 
        new Date(s.end_date) >= now
      );
    } else if (filterStatus === 'upcoming') {
      filtered = filtered.filter(s => new Date(s.start_date) > now);
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter(s => new Date(s.end_date) < now);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(s => !s.is_active);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'start_date' || sortField === 'end_date' || sortField === 'created_at') {
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

  const filteredSales = getFilteredSales();

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const getStatusColor = (sale) => {
    const now = new Date();
    const start = new Date(sale.start_date);
    const end = new Date(sale.end_date);
    
    if (!sale.is_active) {
      return { bg: '#F3F4F6', text: '#6B7280', label: 'Inactive' };
    } else if (now >= start && now <= end) {
      return { bg: '#D1FAE5', text: '#059669', label: 'Active' };
    } else if (now < start) {
      return { bg: '#DBEAFE', text: '#2563EB', label: 'Upcoming' };
    } else {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Expired' };
    }
  };

  const getStatusBadgeStyle = (sale) => {
    const colors = getStatusColor(sale);
    return {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: colors.bg,
      color: colors.text,
      textTransform: 'capitalize',
    };
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
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
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap',
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
      alignItems: 'center',
      gap: '0.5rem',
    },
    filterLabel: {
      fontSize: '0.875rem',
      color: '#666666',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    filterSelect: {
      padding: '0.4rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.875rem',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
    },
    addButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1.25rem',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
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
    loadingText: {
      textAlign: 'center',
      padding: '2rem',
      color: '#666666',
    },
    noData: {
      textAlign: 'center',
      padding: '2rem',
      color: '#999999',
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
    saleTitle: {
      fontWeight: '600',
      color: '#000000',
    },
    saleDescription: {
      fontSize: '0.8rem',
      color: '#666666',
      display: 'block',
      marginTop: '0.25rem',
    },
    discountBadge: {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: '#FEF3C7',
      color: '#D97706',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    actionButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },
    actionView: {
      color: '#8B5CF6',
    },
    actionEdit: {
      color: '#3B82F6',
    },
    actionToggle: {
      color: '#F59E0B',
    },
    actionDelete: {
      color: '#DC2626',
    },
    // Modal styles
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
      padding: '1rem',
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '2rem',
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
    detailModal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '2rem',
    },
    detailHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #E5E5E5',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#999999',
      transition: 'color 0.3s ease',
    },
    detailGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    detailItem: {
      padding: '0.5rem 0',
    },
    detailLabel: {
      fontSize: '0.8rem',
      color: '#666666',
      display: 'block',
      marginBottom: '0.25rem',
    },
    detailValue: {
      fontSize: '0.95rem',
      color: '#000000',
      fontWeight: '500',
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

  const handleFilterFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.1)';
  };

  const handleFilterBlur = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.boxShadow = 'none';
  };

  const handleRowHover = (e) => {
    e.currentTarget.style.backgroundColor = '#FAFAFA';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleActionHover = (e, color) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
  };

  const handleActionLeave = (e, color) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleAddHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleAddLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  return (
    <div style={styles.pageContainer}>
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Flash Sales</h1>
            <div style={styles.headerActions}>
              <div style={styles.searchWrapper}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search flash sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
              </div>
              <div style={styles.filterWrapper}>
                <span style={styles.filterLabel}>
                  <FaFilter /> Filter:
                </span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.filterSelect}
                  onFocus={handleFilterFocus}
                  onBlur={handleFilterBlur}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <Link 
                to="/admin/flash-sales/new" 
                style={styles.addButton}
                onMouseEnter={handleAddHover}
                onMouseLeave={handleAddLeave}
              >
                <FaPlus /> Add Flash Sale
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <FaTag style={styles.statIcon} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.total}</span>
                <span style={styles.statLabel}>Total Flash Sales</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaClock style={{...styles.statIcon, color: '#059669'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.active}</span>
                <span style={styles.statLabel}>Active</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaCalendarAlt style={{...styles.statIcon, color: '#2563EB'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.upcoming}</span>
                <span style={styles.statLabel}>Upcoming</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaClock style={{...styles.statIcon, color: '#DC2626'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.expired}</span>
                <span style={styles.statLabel}>Expired</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingText}>Loading...</div>
          ) : filteredSales.length === 0 ? (
            <div style={styles.noData}>
              {flashSales.length === 0 ? 'No flash sales found' : 'No flash sales match the selected filter'}
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th} onClick={() => handleSort('title')}>
                        <div style={styles.thContent}>
                          Title
                          {sortField === 'title' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('discount_percentage')}>
                        <div style={styles.thContent}>
                          Discount
                          {sortField === 'discount_percentage' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('start_date')}>
                        <div style={styles.thContent}>
                          Start Date
                          {sortField === 'start_date' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('end_date')}>
                        <div style={styles.thContent}>
                          End Date
                          {sortField === 'end_date' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('is_active')}>
                        <div style={styles.thContent}>
                          Status
                          {sortField === 'is_active' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(sale => (
                      <tr 
                        key={sale.id || Math.random()} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>
                          <span style={styles.saleTitle}>{sale.title || 'N/A'}</span>
                          {sale.description && (
                            <span style={styles.saleDescription}>{sale.description}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.discountBadge}>
                            {sale.discount_percentage || 0}% OFF
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt size={14} color="#999" />
                            <span style={{ fontSize: '0.8rem' }}>
                              {formatDate(sale.start_date)}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt size={14} color="#999" />
                            <span style={{ fontSize: '0.8rem' }}>
                              {formatDate(sale.end_date)}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(sale)}>
                            {getStatusColor(sale).label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button 
                              style={{...styles.actionButton, ...styles.actionView}}
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowDetailModal(true);
                              }}
                              onMouseEnter={(e) => handleActionHover(e, '#6D28D9')}
                              onMouseLeave={(e) => handleActionLeave(e, '#8B5CF6')}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              style={{...styles.actionButton, ...styles.actionToggle}}
                              onClick={() => toggleFlashSaleStatus(sale.id, sale.is_active)}
                              onMouseEnter={(e) => handleActionHover(e, '#B45309')}
                              onMouseLeave={(e) => handleActionLeave(e, '#F59E0B')}
                              title={sale.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {sale.is_active ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <Link 
                              to={`/admin/flash-sales/${sale.id}`}
                              style={{...styles.actionButton, ...styles.actionEdit}}
                              onMouseEnter={(e) => handleActionHover(e, '#1D4ED8')}
                              onMouseLeave={(e) => handleActionLeave(e, '#3B82F6')}
                              title="Edit"
                            >
                              <FaEdit />
                            </Link>
                            <button 
                              style={{...styles.actionButton, ...styles.actionDelete}}
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowDeleteModal(true);
                              }}
                              onMouseEnter={(e) => handleActionHover(e, '#B91C1C')}
                              onMouseLeave={(e) => handleActionLeave(e, '#DC2626')}
                              title="Delete"
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
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSale && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Flash Sale</h2>
            <div style={styles.modalBody}>
              <p>Are you sure you want to delete the flash sale <strong>"{selectedSale.title}"</strong>?</p>
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
                onClick={() => deleteFlashSale(selectedSale.id)}
              >
                Delete Flash Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSale && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#000000' }}>
                Flash Sale Details
              </h2>
              <button style={styles.closeButton} onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>
            
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Title</span>
                <span style={styles.detailValue}>{selectedSale.title || 'N/A'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Discount</span>
                <span style={{...styles.detailValue, color: '#D97706'}}>
                  {selectedSale.discount_percentage || 0}% OFF
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <span style={getStatusBadgeStyle(selectedSale)}>
                  {getStatusColor(selectedSale).label}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Active</span>
                <span style={{...styles.detailValue, color: selectedSale.is_active ? '#059669' : '#DC2626'}}>
                  {selectedSale.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div style={{...styles.detailItem, gridColumn: '1 / -1'}}>
                <span style={styles.detailLabel}>Description</span>
                <span style={styles.detailValue}>
                  {selectedSale.description || 'No description provided'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Start Date</span>
                <span style={styles.detailValue}>{formatDate(selectedSale.start_date)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>End Date</span>
                <span style={styles.detailValue}>{formatDate(selectedSale.end_date)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Created At</span>
                <span style={styles.detailValue}>{formatDate(selectedSale.created_at)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Last Updated</span>
                <span style={styles.detailValue}>{formatDate(selectedSale.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSale;
