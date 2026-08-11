import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaBox, FaShoppingCart, FaDollarSign, 
  FaPlus, FaEdit, FaTrash, FaEye,
  FaChartLine, FaChartPie, FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageHelper';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    pending_orders: 0,
    total_revenue: 0,
    orders_last_30_days: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    revenues: [],
    orderCounts: [],
    statusData: []
  });

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setStats({
        total_users: response.data?.total_users || 0,
        total_products: response.data?.total_products || 0,
        total_orders: response.data?.total_orders || 0,
        pending_orders: response.data?.pending_orders || 0,
        total_revenue: response.data?.total_revenue || 0,
        orders_last_30_days: response.data?.orders_last_30_days || 0
      });
      
      // Fetch products
      const productsRes = await axios.get('http://localhost:5000/api/admin/products', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      
      // Fetch orders for chart data
      const ordersRes = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      
      // Process order data
      const last7Days = [];
      const revenues = [];
      const orderCounts = [];
      const statusCounts = {
        delivered: 0,
        pending: 0,
        processing: 0,
        cancelled: 0
      };
      
      // Get last 7 days
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        revenues.push(0);
        orderCounts.push(0);
      }
      
      // Process orders
      orders.forEach(order => {
        if (order.status === 'delivered') statusCounts.delivered++;
        else if (order.status === 'pending') statusCounts.pending++;
        else if (order.status === 'processing') statusCounts.processing++;
        else if (order.status === 'cancelled') statusCounts.cancelled++;
        
        if (order.created_at) {
          const orderDate = new Date(order.created_at);
          const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff <= 6) {
            const index = 6 - daysDiff;
            revenues[index] += Number(order.total_amount) || 0;
            orderCounts[index] += 1;
          }
        }
      });
      
      const totalStatuses = orders.length || 1;
      setChartData({
        labels: last7Days,
        revenues: revenues,
        orderCounts: orderCounts,
        statusData: [
          Math.round((statusCounts.delivered / totalStatuses) * 100),
          Math.round((statusCounts.pending / totalStatuses) * 100),
          Math.round((statusCounts.processing / totalStatuses) * 100),
          Math.round((statusCounts.cancelled / totalStatuses) * 100)
        ]
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KES 0';
    return 'KES ' + Number(price).toLocaleString();
  };

  // Chart configurations
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return 'KES ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: function(value) {
            return 'KES ' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1 }
      },
      x: {
        grid: { display: false }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 7
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };

  // Chart data
  const barChartData = {
    labels: chartData.labels.length > 0 ? chartData.labels : ['No Data'],
    datasets: [
      {
        label: 'Revenue',
        data: chartData.revenues.length > 0 ? chartData.revenues : [0],
        backgroundColor: [
          'rgba(219, 68, 68, 0.8)',
          'rgba(219, 68, 68, 0.6)',
          'rgba(219, 68, 68, 0.4)',
          'rgba(219, 68, 68, 0.8)',
          'rgba(219, 68, 68, 0.6)',
          'rgba(219, 68, 68, 0.4)',
          'rgba(219, 68, 68, 0.9)'
        ],
        borderColor: '#DB4444',
        borderWidth: 2,
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  const lineChartData = {
    labels: chartData.labels.length > 0 ? chartData.labels : ['No Data'],
    datasets: [
      {
        label: 'Orders',
        data: chartData.orderCounts.length > 0 ? chartData.orderCounts : [0],
        borderColor: '#4A90D9',
        backgroundColor: 'rgba(74, 144, 217, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4A90D9',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  const doughnutData = {
    labels: ['Delivered', 'Pending', 'Processing', 'Cancelled'],
    datasets: [
      {
        data: chartData.statusData.length > 0 ? chartData.statusData : [0, 0, 0, 0],
        backgroundColor: [
          '#22C55E',
          '#DB4444',
          '#F59E0B',
          '#9CA3AF'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const productList = Array.isArray(products) ? products : [];

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '2rem',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #E5E5E5',
      borderTop: '4px solid #DB4444',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      marginTop: '1rem',
      color: '#666666',
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
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#666666',
      margin: 0,
    },
    statNumber: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#000000',
      margin: 0,
    },
    statIcon: {
      fontSize: '2.5rem',
      color: '#DB4444',
      opacity: 0.7,
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    chartCard: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    chartWrapper: {
      height: '300px',
      position: 'relative',
    },
    chartWrapperSmall: {
      height: '280px',
      position: 'relative',
      maxWidth: '320px',
      margin: '0 auto',
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    chartTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#000000',
      margin: 0,
    },
    quickStatsCard: {
      backgroundColor: '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
    },
    quickStatsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      flex: 1,
      alignItems: 'center',
    },
    quickStat: {
      backgroundColor: '#F8F8F8',
      padding: '1rem',
      borderRadius: '8px',
      textAlign: 'center',
    },
    quickStatLabel: {
      display: 'block',
      fontSize: '0.75rem',
      color: '#999999',
      marginBottom: '0.25rem',
    },
    quickStatValue: {
      display: 'block',
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
    },
    tableCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    tableHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tableTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#000000',
      margin: 0,
    },
    addButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.3s ease',
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
    },
    actionEdit: {
      color: '#3B82F6',
      textDecoration: 'none',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    actionDelete: {
      color: '#DC2626',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    actionView: {
      color: '#8B5CF6',
      textDecoration: 'none',
      padding: '0.25rem',
      transition: 'color 0.3s ease',
    },
    noData: {
      padding: '2rem',
      textAlign: 'center',
      color: '#999999',
    },
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Users</p>
              <p style={styles.statNumber}>{stats.total_users || 0}</p>
            </div>
            <div style={styles.statIcon}><FaUsers /></div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Products</p>
              <p style={styles.statNumber}>{stats.total_products || 0}</p>
            </div>
            <div style={styles.statIcon}><FaBox /></div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Orders</p>
              <p style={styles.statNumber}>{stats.total_orders || 0}</p>
            </div>
            <div style={styles.statIcon}><FaShoppingCart /></div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Revenue</p>
              <p style={styles.statNumber}>{formatPrice(stats.total_revenue)}</p>
            </div>
            <div style={styles.statIcon}><FaDollarSign /></div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={styles.chartsGrid}>
          {/* Revenue Chart - Bar Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Revenue (Last 7 Days)</h3>
            </div>
            <div style={styles.chartWrapper}>
              {chartData.revenues.some(v => v > 0) ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div style={styles.noData}>No revenue data available</div>
              )}
            </div>
          </div>

          {/* Orders Chart - Line Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Order Trends</h3>
            </div>
            <div style={styles.chartWrapper}>
              {chartData.orderCounts.some(v => v > 0) ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div style={styles.noData}>No order data available</div>
              )}
            </div>
          </div>

          {/* Order Status - Doughnut Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Order Status Distribution</h3>
            </div>
            <div style={styles.chartWrapperSmall}>
              {chartData.statusData.some(v => v > 0) ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div style={styles.noData}>No status data available</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={styles.quickStatsCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Quick Overview</h3>
            </div>
            <div style={styles.quickStatsGrid}>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Pending Orders</span>
                <span style={styles.quickStatValue}>{stats.pending_orders || 0}</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Last 30 Days</span>
                <span style={styles.quickStatValue}>{stats.orders_last_30_days || 0}</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Total Revenue</span>
                <span style={styles.quickStatValue}>{formatPrice(stats.total_revenue)}</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Total Products</span>
                <span style={styles.quickStatValue}>{stats.total_products || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Recent Products</h2>
            <Link to="/admin/products/new" style={styles.addButton}>
              <FaPlus /> Add Product
            </Link>
          </div>
          
          {loading ? (
            <div style={styles.loadingText}>Loading...</div>
          ) : productList.length === 0 ? (
            <div style={styles.noData}>No products found</div>
          ) : (
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
                  {productList.slice(0, 10).map(product => {
                    const imageUrl = getImageUrl(product.images?.[0]?.image_url);
                    
                    return (
                      <tr key={product.id || Math.random()} style={styles.tr}>
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
                            <Link to={`/admin/products/${product.id}`} style={styles.actionEdit}>
                              <FaEdit />
                            </Link>
                            <button style={styles.actionDelete}>
                              <FaTrash />
                            </button>
                            <Link to={`/product/${product.slug || ''}`} style={styles.actionView}>
                              <FaEye />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;