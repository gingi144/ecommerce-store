import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { getImageUrl } from '../../utils/imageHelper';
import api from '../api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/admin/products/${productId}`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    },
    tr: {
      borderBottom: '1px solid #F0F0F0',
      transition: 'background-color 0.2s ease',
    },
    td: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      color: '#000000',
    },
    productCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    productImage: {
      width: '40px',
      height: '40px',
      objectFit: 'cover',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    productName: {
      fontWeight: '500',
      color: '#000000',
    },
    stockBadge: {
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    stockIn: {
      color: '#16A34A',
      backgroundColor: '#F0FDF4',
    },
    stockOut: {
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
    },
    statusBadge: {
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    statusActive: {
      color: '#16A34A',
      backgroundColor: '#F0FDF4',
    },
    statusInactive: {
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    actionView: {
      color: '#8B5CF6',
      textDecoration: 'none',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    actionEdit: {
      color: '#3B82F6',
      textDecoration: 'none',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    actionToggle: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    actionToggleActive: {
      color: '#16A34A',
    },
    actionToggleInactive: {
      color: '#9CA3AF',
    },
    actionDelete: {
      color: '#DC2626',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
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

  const handleAddHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleAddLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  const handleRowHover = (e) => {
    e.currentTarget.style.backgroundColor = '#FAFAFA';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Products</h1>
          <div style={styles.headerActions}>
            <div style={styles.searchWrapper}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </div>
            <Link 
              to="/admin/products/new" 
              style={styles.addButton}
              onMouseEnter={handleAddHover}
              onMouseLeave={handleAddLeave}
            >
              <FaPlus /> Add Product
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div style={styles.loadingText}>Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.noData}>
            {products.length === 0 ? 'No products found' : 'No products match your search'}
          </div>
        ) : (
          <div style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const imageUrl = getImageUrl(product.images?.[0]?.image_url);
                    
                    return (
                      <tr 
                        key={product.id || Math.random()} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <img 
                              src={imageUrl}
                              alt={product.name || 'Product'} 
                              style={styles.productImage}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/40/40';
                              }}
                            />
                            <span style={styles.productName}>{product.name || 'Unnamed Product'}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{formatPrice(product.price)}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.stockBadge,
                            ...((product.stock_quantity || 0) > 0 ? styles.stockIn : styles.stockOut)
                          }}>
                            {product.stock_quantity || 0}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(product.is_active ? styles.statusActive : styles.statusInactive)
                          }}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <Link to={`/product/${product.slug || ''}`} style={styles.actionView} title="View">
                              <FaEye />
                            </Link>
                            <Link to={`/admin/products/${product.id}`} style={styles.actionEdit} title="Edit">
                              <FaEdit />
                            </Link>
                            <button 
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              style={{
                                ...styles.actionToggle,
                                ...(product.is_active ? styles.actionToggleActive : styles.actionToggleInactive)
                              }}
                              title={product.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {product.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              style={styles.actionDelete}
                              title="Delete"
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;