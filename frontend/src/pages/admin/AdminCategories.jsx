import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, 
  FaSearch, FaFilter, FaSortUp, FaSortDown,
  FaToggleOn, FaToggleOff, FaFolder,
  FaFolderOpen, FaImage, FaTag
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { getImageUrl } from '../../utils/imageHelper';
import api from '../../api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
      
      // Calculate stats
      const active = categoriesData.filter(c => c.is_active).length;
      const inactive = categoriesData.filter(c => !c.is_active).length;
      const withProducts = categoriesData.filter(c => (c.product_count || 0) > 0).length;
      
      setStats({
        total: categoriesData.length,
        active: active,
        inactive: inactive,
        withProducts: withProducts
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/admin/categories/${categoryId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      alert('Failed to update category status');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const getFilteredCategories = () => {
    let filtered = categories;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'created_at' || sortField === 'updated_at') {
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

  const filteredCategories = getFilteredCategories();

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

  const getStatusBadgeStyle = (isActive) => {
    return {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: isActive ? '#D1FAE5' : '#FEE2E2',
      color: isActive ? '#059669' : '#DC2626',
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
    categoryCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    categoryImage: {
      width: '40px',
      height: '40px',
      objectFit: 'cover',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    categoryName: {
      fontWeight: '600',
      color: '#000000',
    },
    categorySlug: {
      fontSize: '0.8rem',
      color: '#666666',
      display: 'block',
      marginTop: '0.25rem',
    },
    productCount: {
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: '#DBEAFE',
      color: '#2563EB',
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
      maxWidth: '500px',
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
      maxWidth: '600px',
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
    detailImage: {
      width: '100%',
      maxHeight: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '1rem',
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
            <h1 style={styles.pageTitle}>Categories</h1>
            <div style={styles.headerActions}>
              <div style={styles.searchWrapper}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
              </div>
              <Link 
                to="/admin/categories/new" 
                style={styles.addButton}
                onMouseEnter={handleAddHover}
                onMouseLeave={handleAddLeave}
              >
                <FaPlus /> Add Category
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <FaFolder style={styles.statIcon} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.total}</span>
                <span style={styles.statLabel}>Total Categories</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaFolderOpen style={{...styles.statIcon, color: '#059669'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.active}</span>
                <span style={styles.statLabel}>Active</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaFolder style={{...styles.statIcon, color: '#DC2626'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.inactive}</span>
                <span style={styles.statLabel}>Inactive</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <FaTag style={{...styles.statIcon, color: '#2563EB'}} />
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{stats.withProducts}</span>
                <span style={styles.statLabel}>With Products</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingText}>Loading...</div>
          ) : filteredCategories.length === 0 ? (
            <div style={styles.noData}>
              {categories.length === 0 ? 'No categories found' : 'No categories match your search'}
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th} onClick={() => handleSort('name')}>
                        <div style={styles.thContent}>
                          Category
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('slug')}>
                        <div style={styles.thContent}>
                          Slug
                          {sortField === 'slug' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th} onClick={() => handleSort('product_count')}>
                        <div style={styles.thContent}>
                          Products
                          {sortField === 'product_count' && (
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
                      <th style={styles.th} onClick={() => handleSort('created_at')}>
                        <div style={styles.thContent}>
                          Created
                          {sortField === 'created_at' && (
                            sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </div>
                      </th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map(category => (
                      <tr 
                        key={category.id} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>
                          <div style={styles.categoryCell}>
                            <img 
                              src={getImageUrl(category.image_url)}
                              alt={category.name}
                              style={styles.categoryImage}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/40/40';
                              }}
                            />
                            <div>
                              <div style={styles.categoryName}>{category.name}</div>
                              {category.description && (
                                <div style={styles.categorySlug}>
                                  {category.description.length > 50 
                                    ? category.description.substring(0, 50) + '...' 
                                    : category.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#666666', fontSize: '0.85rem' }}>
                            /{category.slug}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.productCount}>
                            {category.product_count || 0}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(category.is_active)}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#666666', fontSize: '0.85rem' }}>
                            {formatDate(category.created_at)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button 
                              style={{...styles.actionButton, ...styles.actionView}}
                              onClick={() => {
                                setSelectedCategory(category);
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
                              onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                              onMouseEnter={(e) => handleActionHover(e, '#B45309')}
                              onMouseLeave={(e) => handleActionLeave(e, '#F59E0B')}
                              title={category.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {category.is_active ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <Link 
                              to={`/admin/categories/${category.id}`}
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
                                setSelectedCategory(category);
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
      {showDeleteModal && selectedCategory && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Category</h2>
            <div style={styles.modalBody}>
              <p>Are you sure you want to delete the category <strong>"{selectedCategory.name}"</strong>?</p>
              {(selectedCategory.product_count || 0) > 0 && (
                <p style={{ color: '#DC2626', marginTop: '0.5rem' }}>
                  Warning: This category has {selectedCategory.product_count} product(s) associated with it.
                </p>
              )}
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
                onClick={() => deleteCategory(selectedCategory.id)}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCategory && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#000000' }}>
                Category Details
              </h2>
              <button style={styles.closeButton} onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>
            
            {selectedCategory.image_url && (
              <img 
                src={getImageUrl(selectedCategory.image_url)}
                alt={selectedCategory.name}
                style={styles.detailImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{selectedCategory.name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Slug</span>
                <span style={styles.detailValue}>/{selectedCategory.slug}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <span style={getStatusBadgeStyle(selectedCategory.is_active)}>
                  {selectedCategory.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Products</span>
                <span style={{...styles.detailValue, color: '#2563EB'}}>
                  {selectedCategory.product_count || 0}
                </span>
              </div>
              <div style={{...styles.detailItem, gridColumn: '1 / -1'}}>
                <span style={styles.detailLabel}>Description</span>
                <span style={styles.detailValue}>
                  {selectedCategory.description || 'No description provided'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Created At</span>
                <span style={styles.detailValue}>{formatDate(selectedCategory.created_at)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Last Updated</span>
                <span style={styles.detailValue}>{formatDate(selectedCategory.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
