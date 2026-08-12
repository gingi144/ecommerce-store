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
import api from '../../api';

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
      const response = await api.get('/api/admin/dashboard/stats', {
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
      const productsRes = await api.get('/api/admin/products', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      
      // Fetch orders for chart data
      const ordersRes = await api.get('/api/admin/orders', {
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
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p className="admin-loading-text">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const productList = Array.isArray(products) ? products : [];

  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Loading ----- */
        .admin-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        .admin-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E5E5E5;
          border-top: 4px solid #DB4444;
          border-radius: 50%;
          animation: adminSpin 1s linear infinite;
        }
        .admin-loading-text {
          margin-top: 1rem;
          color: #666666;
        }
        @keyframes adminSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ----- Container ----- */
        .admin-dashboard {
          max-width: 1280px;
          margin: 0 auto;
        }
        .admin-page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 2rem;
        }

        /* ----- Stats Grid ----- */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .admin-stat-card {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .admin-stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .admin-stat-label {
          font-size: 0.875rem;
          color: #666666;
          margin: 0;
        }
        .admin-stat-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }
        .admin-stat-icon {
          font-size: 2.5rem;
          color: #DB4444;
          opacity: 0.7;
        }

        /* ----- Charts Grid ----- */
        .admin-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .admin-chart-card {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .admin-chart-wrapper {
          height: 300px;
          position: relative;
        }
        .admin-chart-wrapper-small {
          height: 280px;
          position: relative;
          max-width: 320px;
          margin: 0 auto;
        }
        .admin-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .admin-chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #000000;
          margin: 0;
        }

        /* ----- Quick Stats ----- */
        .admin-quick-stats {
          background-color: #FFFFFF;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }
        .admin-quick-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          flex: 1;
          align-items: center;
        }
        .admin-quick-stat {
          background-color: #F8F8F8;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          transition: background-color 0.3s ease;
        }
        .admin-quick-stat:hover {
          background-color: #F0F0F0;
        }
        .admin-quick-stat-label {
          display: block;
          font-size: 0.75rem;
          color: #999999;
          margin-bottom: 0.25rem;
        }
        .admin-quick-stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
        }

        /* ----- Table ----- */
        .admin-table-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .admin-table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #E5E5E5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .admin-table-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #000000;
          margin: 0;
        }
        .admin-add-button {
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.3s ease;
        }
        .admin-add-button:hover {
          background-color: #B33A3A;
          color: #FFFFFF;
        }
        .admin-table-wrapper {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-th {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #E5E5E5;
          background-color: #FAFAFA;
        }
        .admin-tr {
          border-bottom: 1px solid #F0F0F0;
          transition: background-color 0.3s ease;
        }
        .admin-tr:hover {
          background-color: #FAFAFA;
        }
        .admin-td {
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          color: #000000;
        }
        .admin-product-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-product-image {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
          background-color: #F5F5F5;
        }
        .admin-product-name {
          font-weight: 500;
          color: #000000;
        }

        /* ----- Badges ----- */
        .admin-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        .admin-badge-stock-in {
          color: #16A34A;
          background-color: #F0FDF4;
        }
        .admin-badge-stock-out {
          color: #DC2626;
          background-color: #FEF2F2;
        }
        .admin-badge-active {
          color: #16A34A;
          background-color: #F0FDF4;
        }
        .admin-badge-inactive {
          color: #DC2626;
          background-color: #FEF2F2;
        }

        /* ----- Action Buttons ----- */
        .admin-actions {
          display: flex;
          gap: 0.5rem;
        }
        .admin-action-edit {
          color: #3B82F6;
          text-decoration: none;
          padding: 0.25rem;
          transition: color 0.3s ease;
        }
        .admin-action-edit:hover {
          color: #2563EB;
        }
        .admin-action-delete {
          color: #DC2626;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.3s ease;
        }
        .admin-action-delete:hover {
          color: #B91C1C;
        }
        .admin-action-view {
          color: #8B5CF6;
          text-decoration: none;
          padding: 0.25rem;
          transition: color 0.3s ease;
        }
        .admin-action-view:hover {
          color: #7C3AED;
        }
        .admin-no-data {
          padding: 2rem;
          text-align: center;
          color: #999999;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        @media (max-width: 1024px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .admin-charts-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .admin-chart-wrapper-small {
            max-width: 280px;
          }
        }

        @media (max-width: 768px) {
          .admin-page-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .admin-stat-card {
            padding: 1rem;
          }
          .admin-stat-number {
            font-size: 1.25rem;
          }
          .admin-stat-icon {
            font-size: 1.75rem;
          }
          .admin-stat-label {
            font-size: 0.75rem;
          }
          
          .admin-chart-card {
            padding: 1rem;
          }
          .admin-chart-wrapper {
            height: 220px;
          }
          .admin-chart-wrapper-small {
            height: 200px;
            max-width: 220px;
          }
          
          .admin-quick-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .admin-quick-stat {
            padding: 0.75rem;
          }
          .admin-quick-stat-value {
            font-size: 1rem;
          }
          
          .admin-table-header {
            padding: 1rem;
          }
          .admin-th,
          .admin-td {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          .admin-product-image {
            width: 32px;
            height: 32px;
          }
          .admin-add-button {
            padding: 0.4rem 0.75rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .admin-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .admin-stat-card {
            padding: 0.75rem;
          }
          .admin-stat-number {
            font-size: 1rem;
          }
          .admin-stat-icon {
            font-size: 1.5rem;
          }
          .admin-stat-label {
            font-size: 0.65rem;
          }
          
          .admin-chart-card {
            padding: 0.75rem;
          }
          .admin-chart-wrapper {
            height: 180px;
          }
          .admin-chart-wrapper-small {
            height: 180px;
            max-width: 180px;
          }
          .admin-chart-title {
            font-size: 0.875rem;
          }
          
          .admin-quick-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .admin-quick-stat {
            padding: 0.5rem;
          }
          .admin-quick-stat-value {
            font-size: 0.9rem;
          }
          .admin-quick-stat-label {
            font-size: 0.65rem;
          }
          
          .admin-table-header {
            flex-direction: column;
            align-items: stretch;
            padding: 0.75rem;
          }
          .admin-table-title {
            font-size: 1rem;
          }
          .admin-add-button {
            justify-content: center;
          }
          .admin-th,
          .admin-td {
            padding: 0.4rem 0.5rem;
            font-size: 0.7rem;
          }
          .admin-product-image {
            width: 28px;
            height: 28px;
          }
          .admin-product-name {
            font-size: 0.75rem;
          }
          .admin-actions {
            flex-direction: column;
            gap: 0.25rem;
          }
          .admin-badge {
            font-size: 0.65rem;
            padding: 0.15rem 0.35rem;
          }
        }

        @media (max-width: 360px) {
          .admin-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.4rem;
          }
          .admin-stat-card {
            padding: 0.5rem;
          }
          .admin-stat-number {
            font-size: 0.85rem;
          }
          .admin-stat-icon {
            font-size: 1.25rem;
          }
          .admin-stat-label {
            font-size: 0.6rem;
          }
          .admin-chart-wrapper {
            height: 150px;
          }
          .admin-chart-wrapper-small {
            height: 150px;
            max-width: 150px;
          }
          .admin-th,
          .admin-td {
            padding: 0.3rem 0.4rem;
            font-size: 0.65rem;
          }
          .admin-product-image {
            width: 24px;
            height: 24px;
          }
          .admin-product-name {
            font-size: 0.65rem;
          }
        }
      `}</style>

      <AdminLayout>
        <div className="admin-dashboard">
          <h1 className="admin-page-title">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Users</p>
                <p className="admin-stat-number">{stats.total_users || 0}</p>
              </div>
              <div className="admin-stat-icon"><FaUsers /></div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Products</p>
                <p className="admin-stat-number">{stats.total_products || 0}</p>
              </div>
              <div className="admin-stat-icon"><FaBox /></div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Orders</p>
                <p className="admin-stat-number">{stats.total_orders || 0}</p>
              </div>
              <div className="admin-stat-icon"><FaShoppingCart /></div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Revenue</p>
                <p className="admin-stat-number">{formatPrice(stats.total_revenue)}</p>
              </div>
              <div className="admin-stat-icon"><FaDollarSign /></div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="admin-charts-grid">
            {/* Revenue Chart - Bar Chart */}
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Revenue (Last 7 Days)</h3>
              </div>
              <div className="admin-chart-wrapper">
                {chartData.revenues.some(v => v > 0) ? (
                  <Bar data={barChartData} options={barChartOptions} />
                ) : (
                  <div className="admin-no-data">No revenue data available</div>
                )}
              </div>
            </div>

            {/* Orders Chart - Line Chart */}
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Order Trends</h3>
              </div>
              <div className="admin-chart-wrapper">
                {chartData.orderCounts.some(v => v > 0) ? (
                  <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                  <div className="admin-no-data">No order data available</div>
                )}
              </div>
            </div>

            {/* Order Status - Doughnut Chart */}
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Order Status Distribution</h3>
              </div>
              <div className="admin-chart-wrapper-small">
                {chartData.statusData.some(v => v > 0) ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className="admin-no-data">No status data available</div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-quick-stats">
              <div className="admin-chart-header">
                <h3 className="admin-chart-title">Quick Overview</h3>
              </div>
              <div className="admin-quick-stats-grid">
                <div className="admin-quick-stat">
                  <span className="admin-quick-stat-label">Pending Orders</span>
                  <span className="admin-quick-stat-value">{stats.pending_orders || 0}</span>
                </div>
                <div className="admin-quick-stat">
                  <span className="admin-quick-stat-label">Last 30 Days</span>
                  <span className="admin-quick-stat-value">{stats.orders_last_30_days || 0}</span>
                </div>
                <div className="admin-quick-stat">
                  <span className="admin-quick-stat-label">Total Revenue</span>
                  <span className="admin-quick-stat-value">{formatPrice(stats.total_revenue)}</span>
                </div>
                <div className="admin-quick-stat">
                  <span className="admin-quick-stat-label">Total Products</span>
                  <span className="admin-quick-stat-value">{stats.total_products || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Recent Products</h2>
              <Link to="/admin/products/new" className="admin-add-button">
                <FaPlus /> Add Product
              </Link>
            </div>
            
            {loading ? (
              <div className="admin-loading-text" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : productList.length === 0 ? (
              <div className="admin-no-data">No products found</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-th">Product</th>
                      <th className="admin-th">Price</th>
                      <th className="admin-th">Stock</th>
                      <th className="admin-th">Status</th>
                      <th className="admin-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.slice(0, 10).map(product => {
                      const imageUrl = getImageUrl(product.images?.[0]?.image_url);
                      
                      return (
                        <tr key={product.id || Math.random()} className="admin-tr">
                          <td className="admin-td">
                            <div className="admin-product-cell">
                              <img 
                                src={imageUrl}
                                alt={product.name || 'Product'} 
                                className="admin-product-image"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/40/40';
                                }}
                              />
                              <span className="admin-product-name">{product.name || 'Unnamed Product'}</span>
                            </div>
                          </td>
                          <td className="admin-td">{formatPrice(product.price)}</td>
                          <td className="admin-td">
                            <span className={`admin-badge ${(product.stock_quantity || 0) > 0 ? 'admin-badge-stock-in' : 'admin-badge-stock-out'}`}>
                              {product.stock_quantity || 0}
                            </span>
                          </td>
                          <td className="admin-td">
                            <span className={`admin-badge ${product.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="admin-td">
                            <div className="admin-actions">
                              <Link to={`/admin/products/${product.id}`} className="admin-action-edit">
                                <FaEdit />
                              </Link>
                              <button className="admin-action-delete">
                                <FaTrash />
                              </button>
                              <Link to={`/product/${product.slug || ''}`} className="admin-action-view">
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
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
