import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaTrash, FaPlus } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    sku: '',
    category_id: '',
    stock_quantity: '',
    is_active: true,
    is_featured: false,
    is_on_sale: false,
    sale_percentage: '',
    flash_sale_start: '',
    flash_sale_end: '',
    material_type: '',
    weight_grams: '',
    care_instructions: '',
    color_options: []
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    } else {
      setFetching(false);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const product = response.data;
      
      let flashStart = '';
      let flashEnd = '';
      let isOnSale = false;
      let discount = '';
      
      if (product.flash_sale) {
        flashStart = product.flash_sale.start_time || '';
        flashEnd = product.flash_sale.end_time || '';
        isOnSale = product.flash_sale.is_active || false;
        discount = product.flash_sale.discount_percentage || '';
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        compare_price: product.compare_price || '',
        cost_price: product.cost_price || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        is_featured: product.is_featured || false,
        is_on_sale: isOnSale,
        sale_percentage: discount,
        flash_sale_start: flashStart,
        flash_sale_end: flashEnd,
        material_type: product.material_type || '',
        weight_grams: product.weight_grams || '',
        care_instructions: product.care_instructions || '',
        color_options: product.color_options || []
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product data');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const response = await api.post('/api/admin/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setImages([...images, ...response.data]);
      setSuccess(`${files.length} image(s) uploaded successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const allImages = [...existingImages, ...images];
      
      const data = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        sale_percentage: formData.sale_percentage ? parseInt(formData.sale_percentage) : null,
        weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        images: allImages,
        flash_sale: {
          is_active: formData.is_on_sale,
          start_time: formData.flash_sale_start,
          end_time: formData.flash_sale_end,
          discount_percentage: formData.sale_percentage ? parseInt(formData.sale_percentage) : null
        }
      };
const url = isEditing
  ? `/api/admin/products/${id}`
  : '/api/admin/products';

const method = isEditing ? 'put' : 'post';

await api[method](url, data, {
  headers: { Authorization: `Bearer ${token}` }
});

      setSuccess(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.error || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
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
    backLink: {
      color: '#666666',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      transition: 'color 0.3s ease',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '2rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    formGroupFull: {
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#000000',
    },
    input: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
    },
    textarea: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px',
    },
    select: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      width: '100%',
      cursor: 'pointer',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
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
    imageUploadSection: {
      gridColumn: '1 / -1',
      border: '2px dashed #E5E5E5',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'border-color 0.3s ease',
    },
    imageUploadLabel: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      color: '#666666',
    },
    imageUploadIcon: {
      fontSize: '2.5rem',
      color: '#DB4444',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    imageItem: {
      position: 'relative',
      borderRadius: '6px',
      overflow: 'hidden',
      aspectRatio: '1',
      backgroundColor: '#F5F5F5',
    },
    imageThumb: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    imageRemove: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      backgroundColor: 'rgba(220, 38, 38, 0.9)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s ease',
    },
    errorBox: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    successBox: {
      backgroundColor: '#F0FDF4',
      color: '#16A34A',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #E5E5E5',
    },
    saveButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.6rem 2rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    cancelButton: {
      backgroundColor: '#F3F4F6',
      color: '#000000',
      padding: '0.6rem 2rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    loadingText: {
      textAlign: 'center',
      padding: '2rem',
      color: '#666666',
    },
    uploadingText: {
      textAlign: 'center',
      padding: '0.5rem',
      color: '#666666',
      fontSize: '0.875rem',
    },
    flashSaleSection: {
      gridColumn: '1 / -1',
      backgroundColor: '#FFF5F5',
      padding: '1rem',
      borderRadius: '6px',
      border: '1px solid #FECACA',
    },
    flashSaleTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#DB4444',
      marginBottom: '0.5rem',
    },
    dateInput: {
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      width: '100%',
    },
    addVariantButton: {
      backgroundColor: '#F3F4F6',
      color: '#000000',
      padding: '0.5rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'background-color 0.3s ease',
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

  if (fetching) {
    return (
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.loadingText}>Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <Link 
            to="/admin/products" 
            style={styles.backLink}
            onMouseEnter={(e) => e.target.style.color = '#DB4444'}
            onMouseLeave={(e) => e.target.style.color = '#666666'}
          >
            <FaTimes /> Back to Products
          </Link>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {/* Product Name */}
              <div style={styles.formGroupFull}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>

              {/* Description */}
              <div style={styles.formGroupFull}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  rows="4"
                />
              </div>

              {/* Image Upload */}
              <div style={styles.imageUploadSection}>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <label htmlFor="imageUpload" style={styles.imageUploadLabel}>
                  <FaImage style={styles.imageUploadIcon} />
                  <span>
                    {uploading ? 'Uploading...' : 'Click or drag to upload product images'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#999999' }}>
                    PNG, JPG, WEBP up to 5MB
                  </span>
                  {uploading && <div style={styles.uploadingText}>Uploading images...</div>}
                </label>
              </div>

              {/* Image Preview */}
              <div style={styles.formGroupFull}>
                {(existingImages.length > 0 || images.length > 0) && (
                  <div style={styles.imageGrid}>
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} style={styles.imageItem}>
                        <img 
                          src={getImageUrl(img.image_url)} 
                          alt={`Product ${index + 1}`} 
                          style={styles.imageThumb}
                          onError={(e) => e.target.src = '/api/placeholder/100/100'}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          style={styles.imageRemove}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                    {images.map((img, index) => (
                      <div key={`new-${index}`} style={styles.imageItem}>
                        <img 
                          src={img.image_url || URL.createObjectURL(img)} 
                          alt={`Upload ${index + 1}`} 
                          style={styles.imageThumb}
                          onError={(e) => e.target.src = '/api/placeholder/100/100'}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          style={styles.imageRemove}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Fields */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (KES) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Compare Price (KES)</label>
                <input
                  type="number"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Flash Sale Section */}
              <div style={styles.flashSaleSection}>
                <h4 style={styles.flashSaleTitle}>Flash Sale</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={styles.label}>Flash Sale Start</label>
                    <input
                      type="datetime-local"
                      name="flash_sale_start"
                      value={formData.flash_sale_start}
                      onChange={handleChange}
                      style={styles.dateInput}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Flash Sale End</label>
                    <input
                      type="datetime-local"
                      name="flash_sale_end"
                      value={formData.flash_sale_end}
                      onChange={handleChange}
                      style={styles.dateInput}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      name="is_on_sale"
                      checked={formData.is_on_sale}
                      onChange={handleChange}
                      style={styles.checkbox}
                    />
                    <label style={styles.checkboxLabel}>Enable Flash Sale</label>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={styles.label}>Discount Percentage (%)</label>
                  <input
                    type="number"
                    name="sale_percentage"
                    value={formData.sale_percentage}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    min="0"
                    max="100"
                    disabled={!formData.is_on_sale}
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cost Price (KES)</label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  step="0.01"
                  min="0"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              {/* Category */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  style={styles.select}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  min="0"
                  step="1"
                />
              </div>

              {/* Material */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Material Type</label>
                <input
                  type="text"
                  name="material_type"
                  value={formData.material_type}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="e.g., Cotton, Acrylic, Wool"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Weight (grams)</label>
                <input
                  type="number"
                  name="weight_grams"
                  value={formData.weight_grams}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Care Instructions */}
              <div style={styles.formGroupFull}>
                <label style={styles.label}>Care Instructions</label>
                <textarea
                  name="care_instructions"
                  value={formData.care_instructions}
                  onChange={handleChange}
                  style={styles.textarea}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  rows="2"
                  placeholder="e.g., Hand wash cold, lay flat to dry"
                />
              </div>

              {/* Status Settings */}
              <div style={styles.formGroup}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>Active</label>
                </div>
              </div>

              <div style={styles.formGroup}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>Featured Product</label>
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading || uploading}
                style={styles.saveButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#B33A3A'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#DB4444'}
              >
                <FaSave /> {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
              </button>
              <Link
                to="/admin/products"
                style={styles.cancelButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              >
                <FaTimes /> Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
