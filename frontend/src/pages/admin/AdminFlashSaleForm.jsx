import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaSave, FaTimes, FaTag, 
  FaCalendarAlt, FaClock, FaPercentage,
  FaBox, FaInfoCircle, FaCheck
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

const AdminFlashSaleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    is_active: true,
    products: []
  });

  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchFlashSale();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([]);
    }
  };

  const fetchFlashSale = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/flash-sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      // Split datetime into date and time
      const startDate = data.start_date ? new Date(data.start_date) : null;
      const endDate = data.end_date ? new Date(data.end_date) : null;
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        discount_percentage: data.discount_percentage || '',
        start_date: startDate ? startDate.toISOString().split('T')[0] : '',
        start_time: startDate ? startDate.toTimeString().slice(0, 5) : '',
        end_date: endDate ? endDate.toISOString().split('T')[0] : '',
        end_time: endDate ? endDate.toTimeString().slice(0, 5) : '',
        is_active: data.is_active || false,
        products: data.products || []
      });
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching flash sale:', error);
      alert('Failed to load flash sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    const product = availableProducts.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    // Check if product already added
    if (products.some(p => p.id === product.id)) {
      alert('Product already added to this flash sale');
      return;
    }
    
    setProducts([...products, product]);
    setSelectedProduct('');
  };

  const handleRemoveProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.discount_percentage) {
      newErrors.discount_percentage = 'Discount percentage is required';
    } else if (parseFloat(formData.discount_percentage) < 0 || parseFloat(formData.discount_percentage) > 100) {
      newErrors.discount_percentage = 'Discount must be between 0 and 100';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date) {
      const start = new Date(`${formData.start_date}T${formData.start_time || '00:00'}`);
      const end = new Date(`${formData.end_date}T${formData.end_time || '23:59'}`);
      
      if (end <= start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    if (products.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Combine date and time
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time || '00:00'}`).toISOString();
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time || '23:59'}`).toISOString();
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        discount_percentage: parseFloat(formData.discount_percentage),
        start_date: startDateTime,
        end_date: endDateTime,
        is_active: formData.is_active,
        product_ids: products.map(p => p.id)
      };
      
      let response;
      if (isEditMode) {
        response = await axios.put(`http://localhost:5000/api/admin/flash-sales/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post('http://localhost:5000/api/admin/flash-sales', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccessMessage(isEditMode ? 'Flash sale updated successfully!' : 'Flash sale created successfully!');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin/flash-sales');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving flash sale:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Failed to save flash sale');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    backButton: {
      color: '#666666',
      textDecoration: 'none',
      fontSize: '1.25rem',
      padding: '0.5rem',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
    },
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      margin: 0,
    },
    formCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '2rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    formLabelRequired: {
      color: '#DC2626',
      marginLeft: '0.25rem',
    },
    formControl: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      outline: 'none',
    },
    formControlError: {
      borderColor: '#DC2626',
    },
    formControlFocus: {
      borderColor: '#DB4444',
      boxShadow: '0 0 0 3px rgba(219, 68, 68, 0.1)',
    },
    errorMessage: {
      color: '#DC2626',
      fontSize: '0.8rem',
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#DB4444',
    },
    checkboxLabel: {
      fontSize: '0.95rem',
      color: '#000000',
      cursor: 'pointer',
    },
    productSection: {
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      padding: '1rem',
    },
    productAddRow: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    productSelect: {
      flex: 1,
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    addProductButton: {
      padding: '0.6rem 1.25rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
    },
    productList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    productItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.6rem 0.75rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '6px',
      border: '1px solid #E5E5E5',
    },
    productInfo: {
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
    productPrice: {
      fontSize: '0.8rem',
      color: '#666666',
    },
    removeProductButton: {
      color: '#DC2626',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      transition: 'background-color 0.3s ease',
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #E5E5E5',
    },
    saveButton: {
      padding: '0.6rem 2rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    saveButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    cancelButton: {
      padding: '0.6rem 2rem',
      backgroundColor: '#F3F4F6',
      color: '#000000',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    successBanner: {
      backgroundColor: '#D1FAE5',
      color: '#059669',
      padding: '0.75rem 1rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    loadingText: {
      textAlign: 'center',
      padding: '2rem',
      color: '#666666',
    },
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#DB4444';
    e.target.style.boxShadow = '0 0 0 3px rgba(219, 68, 68, 0.1)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#E5E5E5';
    e.target.style.boxShadow = 'none';
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <AdminLayout>
          <div style={styles.container}>
            <div style={styles.loadingText}>Loading...</div>
          </div>
        </AdminLayout>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <Link 
                to="/admin/flash-sales" 
                style={styles.backButton}
                onMouseEnter={(e) => e.target.style.color = '#DB4444'}
                onMouseLeave={(e) => e.target.style.color = '#666666'}
              >
                <FaArrowLeft />
              </Link>
              <h1 style={styles.pageTitle}>
                {isEditMode ? 'Edit Flash Sale' : 'Create Flash Sale'}
              </h1>
            </div>
          </div>

          {successMessage && (
            <div style={styles.successBanner}>
              <FaCheck />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.formCard}>
            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Title <span style={styles.formLabelRequired}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{
                  ...styles.formControl,
                  ...(errors.title ? styles.formControlError : {})
                }}
                placeholder="e.g., Weekend Flash Sale"
              />
              {errors.title && (
                <div style={styles.errorMessage}>
                  <FaInfoCircle size={12} /> {errors.title}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{
                  ...styles.formControl,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Describe the flash sale promotion"
                rows="3"
              />
            </div>

            {/* Discount Percentage */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Discount Percentage <span style={styles.formLabelRequired}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FaPercentage 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#999999'
                  }} 
                />
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    ...styles.formControl,
                    paddingLeft: '2.25rem',
                    ...(errors.discount_percentage ? styles.formControlError : {})
                  }}
                  placeholder="e.g., 25"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
              {errors.discount_percentage && (
                <div style={styles.errorMessage}>
                  <FaInfoCircle size={12} /> {errors.discount_percentage}
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Start Date <span style={styles.formLabelRequired}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaCalendarAlt 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#999999'
                    }} 
                  />
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={{
                      ...styles.formControl,
                      paddingLeft: '2.25rem',
                      ...(errors.start_date ? styles.formControlError : {})
                    }}
                  />
                </div>
                {errors.start_date && (
                  <div style={styles.errorMessage}>
                    <FaInfoCircle size={12} /> {errors.start_date}
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Start Time</label>
                <div style={{ position: 'relative' }}>
                  <FaClock 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#999999'
                    }} 
                  />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={{
                      ...styles.formControl,
                      paddingLeft: '2.25rem'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  End Date <span style={styles.formLabelRequired}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaCalendarAlt 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#999999'
                    }} 
                  />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={{
                      ...styles.formControl,
                      paddingLeft: '2.25rem',
                      ...(errors.end_date ? styles.formControlError : {})
                    }}
                  />
                </div>
                {errors.end_date && (
                  <div style={styles.errorMessage}>
                    <FaInfoCircle size={12} /> {errors.end_date}
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>End Time</label>
                <div style={{ position: 'relative' }}>
                  <FaClock 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#999999'
                    }} 
                  />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={{
                      ...styles.formControl,
                      paddingLeft: '2.25rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div style={styles.formGroup}>
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                  id="is_active"
                />
                <label htmlFor="is_active" style={styles.checkboxLabel}>
                  Active (visible to customers)
                </label>
              </div>
            </div>

            {/* Products */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Products <span style={styles.formLabelRequired}>*</span>
              </label>
              <div style={styles.productSection}>
                <div style={styles.productAddRow}>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    style={styles.productSelect}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  >
                    <option value="">Select a product to add...</option>
                    {availableProducts
                      .filter(p => !products.some(selected => selected.id === p.id))
                      .map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    style={styles.addProductButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#B33A3A'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#DB4444'}
                  >
                    <FaBox /> Add
                  </button>
                </div>

                {products.length > 0 ? (
                  <div style={styles.productList}>
                    {products.map(product => (
                      <div key={product.id} style={styles.productItem}>
                        <div style={styles.productInfo}>
                          <img 
                            src={product.images?.[0]?.image_url || '/api/placeholder/40/40'}
                            alt={product.name}
                            style={styles.productImage}
                            onError={(e) => {
                              e.target.src = '/api/placeholder/40/40';
                            }}
                          />
                          <div>
                            <div style={styles.productName}>{product.name}</div>
                            <div style={styles.productPrice}>{formatPrice(product.price)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          style={styles.removeProductButton}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#999999' }}>
                    No products added yet. Select products above.
                  </div>
                )}
              </div>
              {errors.products && (
                <div style={styles.errorMessage}>
                  <FaInfoCircle size={12} /> {errors.products}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.saveButton,
                  ...(saving ? styles.saveButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#B33A3A';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#DB4444';
                }}
              >
                <FaSave />
                {saving ? 'Saving...' : isEditMode ? 'Update Flash Sale' : 'Create Flash Sale'}
              </button>
              <Link 
                to="/admin/flash-sales" 
                style={styles.cancelButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              >
                <FaTimes /> Cancel
              </Link>
            </div>
          </form>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminFlashSaleForm;