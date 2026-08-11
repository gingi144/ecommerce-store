import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../api';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [orderId, setOrderId] = useState('');
  const [checkCount, setCheckCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const orderTrackingId = searchParams.get('order_tracking_id');
    const trackingId = localStorage.getItem('payment_tracking_id');
    
    const idToCheck = orderTrackingId || trackingId;
    console.log('Checking payment for ID:', idToCheck);
    
    if (idToCheck) {
      checkPaymentStatus(idToCheck);
      
      // Keep checking every 5 seconds until completed or failed
      const interval = setInterval(() => {
        setCheckCount(prev => prev + 1);
        checkPaymentStatus(idToCheck);
      }, 5000);

      // Stop checking after 2 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (status === 'pending') {
          setStatus('timeout');
          setLoading(false);
        }
      }, 120000);

      return () => clearInterval(interval);
    } else {
      console.log('No tracking ID found, redirecting to home');
      navigate('/');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (trackingId) => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use PayHero endpoint instead of PesaPal
      const url = `http://localhost:5000/api/payments/payhero/status/${trackingId}`;
      console.log('Checking status at:', url);

      const response = await axios.get(url, {
        headers: { Authorization: 'Bearer ' + token }
      });
      
      console.log('Payment status response:', response.data);
      
      if (response.data.success) {
        const newStatus = response.data.payment.status;
        setStatus(newStatus);
        setOrderId(response.data.payment.order_id);
        setLoading(false);
        
        if (newStatus === 'completed' || newStatus === 'failed') {
          localStorage.removeItem('payment_tracking_id');
          localStorage.removeItem('order_tracking_id');
          localStorage.removeItem('pending_order_id');
          setIsChecking(false);
          return;
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      console.error('Error response:', error.response?.data);
      
      // If 404, try fallback
      if (error.response?.status === 404) {
        console.log('Payment not found yet, waiting...');
      }
    }
    setIsChecking(false);
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '4rem 2rem',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: '80px',
      marginBottom: '1.5rem',
    },
    successIcon: {
      color: '#22C55E',
    },
    failedIcon: {
      color: '#DC2626',
    },
    pendingIcon: {
      color: '#000000',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#666666',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    },
    orderNumber: {
      backgroundColor: '#F5F5F5',
      padding: '0.5rem 1.5rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
      color: '#333333',
      marginBottom: '1.5rem',
    },
    button: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    secondaryButton: {
      backgroundColor: '#F5F5F5',
      color: '#000000',
      padding: '0.75rem 2rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    statusText: {
      fontSize: '0.9rem',
      color: '#999999',
      marginTop: '0.5rem',
    },
    spinnerContainer: {
      position: 'relative',
      width: '100px',
      height: '100px',
      marginBottom: '1.5rem',
    },
    spinnerOuter: {
      width: '100px',
      height: '100px',
      border: '4px solid #E5E5E5',
      borderRadius: '50%',
      animation: 'spin 2s linear infinite',
    },
    spinnerInner: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '1.2rem',
      color: '#999999',
      fontWeight: '500',
    },
    dotPulse: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    dot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#000000',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    dotDelay1: {
      animationDelay: '0s',
    },
    dotDelay2: {
      animationDelay: '0.3s',
    },
    dotDelay3: {
      animationDelay: '0.6s',
    },
    checkIcon: {
      fontSize: '80px',
      color: '#22C55E',
      animation: 'bounceIn 0.6s ease-out',
    },
    failIcon: {
      fontSize: '80px',
      color: '#DC2626',
      animation: 'shake 0.5s ease-in-out',
    },
  };

  // Add animations to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0) rotate(-20deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
        70% { transform: scale(0.9) rotate(-3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinnerOuter}></div>
            <div style={styles.spinnerInner}>⏳</div>
          </div>
          <h2 style={styles.title}>Processing Payment</h2>
          <p style={styles.subtitle}>Please wait while we confirm your M-PESA payment...</p>
          <div style={styles.dotPulse}>
            <div style={{ ...styles.dot, ...styles.dotDelay1 }}></div>
            <div style={{ ...styles.dot, ...styles.dotDelay2 }}></div>
            <div style={{ ...styles.dot, ...styles.dotDelay3 }}></div>
          </div>
          <p style={styles.statusText}>Checking status... Attempt {checkCount + 1}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {status === 'completed' || status === 'paid' ? (
          <>
            <FaCheckCircle style={styles.checkIcon} />
            <h1 style={styles.title}>Payment Successful!</h1>
            <p style={styles.subtitle}>
              Your M-PESA payment has been confirmed and your order has been placed successfully.
              You will receive a confirmation email shortly.
            </p>
            {orderId && (
              <div style={styles.orderNumber}>
                Order # {orderId}
              </div>
            )}
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => navigate('/orders')}
                style={styles.button}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
              >
                View My Orders <FaArrowRight />
              </button>
              <button 
                onClick={() => navigate('/')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <FaSpinner style={{ ...styles.icon, ...styles.pendingIcon, animation: 'spin 1s linear infinite' }} />
            <h1 style={styles.title}>Payment Processing</h1>
            <p style={styles.subtitle}>
              Your M-PESA payment is being processed. Please check your phone for the M-PESA prompt.
            </p>
            <div style={styles.dotPulse}>
              <div style={{ ...styles.dot, ...styles.dotDelay1 }}></div>
              <div style={{ ...styles.dot, ...styles.dotDelay2 }}></div>
              <div style={{ ...styles.dot, ...styles.dotDelay3 }}></div>
            </div>
            <p style={styles.statusText}>Waiting for confirmation... This may take a few moments.</p>
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => window.location.reload()}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
              >
                Check Status Again
              </button>
              <button 
                onClick={() => navigate('/')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : status === 'failed' ? (
          <>
            <FaTimesCircle style={styles.failIcon} />
            <h1 style={styles.title}>Payment Failed</h1>
            <p style={styles.subtitle}>
              Your M-PESA payment was not successful. Please try again or use a different payment method.
            </p>
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => navigate('/checkout')}
                style={styles.button}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/contact')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
              >
                Contact Support
              </button>
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle style={styles.failIcon} />
            <h1 style={styles.title}>Payment Timeout</h1>
            <p style={styles.subtitle}>
              The payment confirmation took too long. Please check your order status or try again.
            </p>
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => navigate('/orders')}
                style={styles.button}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
              >
                View My Orders
              </button>
              <button 
                onClick={() => navigate('/checkout')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F5F5F5'}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentStatus;