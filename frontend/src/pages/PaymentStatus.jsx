import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowRight
} from 'react-icons/fa';
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

  /*
   * Paystack redirects back with:
   *
   * ?reference=ORDER-XXXXXXXX
   *
   * The reference is what we use to verify the payment.
   */
  const reference = searchParams.get('reference');

  // ============================================================
  // CHECK PAYMENT STATUS
  // ============================================================

  const checkPaymentStatus = async (paymentReference) => {
    if (!paymentReference || isChecking) {
      return;
    }

    setIsChecking(true);

    try {
      console.log(
        'Checking payment status for reference:',
        paymentReference
      );

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // ========================================================
      // CHECK PAYSTACK PAYMENT STATUS
      // ========================================================

      const url =
        `/api/payments/paystack/status/${encodeURIComponent(
          paymentReference
        )}`;

      console.log(
        'Checking payment status:',
        url
      );

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(
        'Payment status response:',
        response.data
      );

      const payment =
        response.data?.payment;

      /*
       * IMPORTANT:
       *
       * A failed Paystack payment may return:
       *
       * success: false
       * payment.status: "failed"
       *
       * Therefore we MUST NOT only check response.data.success.
       */

      if (payment) {
        const newStatus =
          payment.status || 'pending';

        console.log(
          'Payment status:',
          newStatus
        );

        setStatus(newStatus);

        if (payment.order_id) {
          setOrderId(payment.order_id);
        }

        // ======================================================
        // PAYMENT COMPLETED
        // ======================================================

        if (
          newStatus === 'completed' ||
          newStatus === 'paid' ||
          newStatus === 'success'
        ) {
          setStatus('completed');
          setLoading(false);

          localStorage.removeItem(
            'payment_tracking_id'
          );

          localStorage.removeItem(
            'order_tracking_id'
          );

          localStorage.removeItem(
            'pending_order_id'
          );

          setIsChecking(false);

          return;
        }

        // ======================================================
        // PAYMENT FAILED
        // ======================================================

        if (
          newStatus === 'failed' ||
          newStatus === 'cancelled' ||
          newStatus === 'abandoned'
        ) {
          setStatus('failed');
          setLoading(false);

          localStorage.removeItem(
            'payment_tracking_id'
          );

          localStorage.removeItem(
            'order_tracking_id'
          );

          localStorage.removeItem(
            'pending_order_id'
          );

          setIsChecking(false);

          return;
        }

        // ======================================================
        // PAYMENT STILL PROCESSING
        // ======================================================

        setStatus('pending');
        setLoading(false);
      }

    } catch (error) {

      console.error(
        'Payment status check error:',
        error
      );

      console.error(
        'Error response:',
        error.response?.data
      );

      /*
       * A 404 can happen if the payment record has not
       * appeared yet. We keep polling instead of redirecting
       * the customer away.
       */

      if (
        error.response?.status === 404
      ) {
        console.log(
          'Payment not found yet, waiting for confirmation...'
        );
      }

      /*
       * Do not immediately show "failed" when the status
       * request itself fails.
       *
       * The payment may still be processing.
       */

    } finally {
      setIsChecking(false);
    }
  };

  // ============================================================
  // PAYMENT STATUS EFFECT
  // ============================================================

  useEffect(() => {

    if (!reference) {

      console.log(
        'No Paystack payment reference found.'
      );

      setStatus('failed');
      setLoading(false);

      return;
    }

    console.log(
      'Paystack reference:',
      reference
    );

    /*
     * Initial payment status check.
     */
    checkPaymentStatus(reference);

    /*
     * Keep checking every 5 seconds while the payment
     * is still processing.
     */
    const interval = setInterval(() => {

      setCheckCount(
        previousCount =>
          previousCount + 1
      );

      checkPaymentStatus(reference);

    }, 5000);

    /*
     * Stop checking after 2 minutes.
     */
    const timeout = setTimeout(() => {

      clearInterval(interval);

      setStatus(currentStatus => {

        if (
          currentStatus === 'pending'
        ) {
          setLoading(false);
          return 'timeout';
        }

        return currentStatus;
      });

    }, 120000);

    /*
     * Cleanup when leaving the page.
     */
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };

  }, [reference]);

  // ============================================================
  // STYLES
  // ============================================================

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

  // ============================================================
  // ANIMATIONS
  // ============================================================

  useEffect(() => {

    const style =
      document.createElement('style');

    style.textContent = `
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }

        50% {
          opacity: 1;
          transform: scale(1.2);
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0) rotate(-20deg);
          opacity: 0;
        }

        50% {
          transform: scale(1.2) rotate(5deg);
          opacity: 1;
        }

        70% {
          transform: scale(0.9) rotate(-3deg);
        }

        100% {
          transform: scale(1) rotate(0deg);
        }
      }

      @keyframes shake {
        0%, 100% {
          transform: translateX(0);
        }

        20% {
          transform: translateX(-10px);
        }

        40% {
          transform: translateX(10px);
        }

        60% {
          transform: translateX(-5px);
        }

        80% {
          transform: translateX(5px);
        }
      }
    `;

    document.head.appendChild(style);

    return () => style.remove();

  }, []);

  // ============================================================
  // LOADING / INITIAL CHECK
  // ============================================================

  if (loading) {

    return (
      <div>

        <Navbar />

        <div style={styles.container}>

          <div style={styles.spinnerContainer}>

            <div style={styles.spinnerOuter}></div>

            <div style={styles.spinnerInner}>
              Processing
            </div>

          </div>

          <h2 style={styles.title}>
            Processing Payment
          </h2>

          <p style={styles.subtitle}>
            Please wait while we confirm your payment.
          </p>

          <div style={styles.dotPulse}>

            <div
              style={{
                ...styles.dot,
                ...styles.dotDelay1
              }}
            />

            <div
              style={{
                ...styles.dot,
                ...styles.dotDelay2
              }}
            />

            <div
              style={{
                ...styles.dot,
                ...styles.dotDelay3
              }}
            />

          </div>

          <p style={styles.statusText}>
            Checking status... Attempt {checkCount + 1}
          </p>

        </div>

        <Footer />

      </div>
    );
  }

  // ============================================================
  // PAYMENT SUCCESSFUL
  // ============================================================

  if (
    status === 'completed' ||
    status === 'paid' ||
    status === 'success'
  ) {

    return (
      <div>

        <Navbar />

        <div style={styles.container}>

          <FaCheckCircle
            style={styles.checkIcon}
          />

          <h1 style={styles.title}>
            Payment Successful
          </h1>

          <p style={styles.subtitle}>
            Your payment has been confirmed and
            your order has been placed successfully.
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
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#333333'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#000000'
              }
            >
              View My Orders
              <FaArrowRight />
            </button>

            <button
              onClick={() => navigate('/')}
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#E5E5E5'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#F5F5F5'
              }
            >
              Continue Shopping
            </button>

          </div>

        </div>

        <Footer />

      </div>
    );
  }

  // ============================================================
  // PAYMENT FAILED
  // ============================================================

  if (status === 'failed') {

    return (
      <div>

        <Navbar />

        <div style={styles.container}>

          <FaTimesCircle
            style={styles.failIcon}
          />

          <h1 style={styles.title}>
            Payment Failed
          </h1>

          <p style={styles.subtitle}>
            Your payment could not be completed.
            This may be due to insufficient funds,
            a declined transaction, or another
            payment issue. Please try again.
          </p>

          {orderId && (
            <div style={styles.orderNumber}>
              Order # {orderId}
            </div>
          )}

          <div style={styles.buttonGroup}>

            <button
              onClick={() => navigate('/checkout')}
              style={styles.button}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#333333'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#000000'
              }
            >
              Try Payment Again
              <FaArrowRight />
            </button>

            <button
              onClick={() => navigate('/orders')}
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#E5E5E5'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#F5F5F5'
              }
            >
              View My Orders
            </button>

            <button
              onClick={() => navigate('/contact')}
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#E5E5E5'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#F5F5F5'
              }
            >
              Contact Support
            </button>

          </div>

        </div>

        <Footer />

      </div>
    );
  }

  // ============================================================
  // PAYMENT TIMEOUT
  // ============================================================

  if (status === 'timeout') {

    return (
      <div>

        <Navbar />

        <div style={styles.container}>

          <FaTimesCircle
            style={styles.failIcon}
          />

          <h1 style={styles.title}>
            Payment Confirmation Timeout
          </h1>

          <p style={styles.subtitle}>
            We could not confirm your payment within
            the expected time. Your payment may still
            be processing. Please check your orders
            before attempting another payment.
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
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#333333'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#000000'
              }
            >
              View My Orders
              <FaArrowRight />
            </button>

            <button
              onClick={() =>
                window.location.reload()
              }
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#E5E5E5'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#F5F5F5'
              }
            >
              Check Again
            </button>

            <button
              onClick={() => navigate('/checkout')}
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                e.target.style.backgroundColor =
                  '#E5E5E5'
              }
              onMouseLeave={(e) =>
                e.target.style.backgroundColor =
                  '#F5F5F5'
              }
            >
              Return to Checkout
            </button>

          </div>

        </div>

        <Footer />

      </div>
    );
  }

  // ============================================================
  // DEFAULT / PENDING
  // ============================================================

  return (
    <div>

      <Navbar />

      <div style={styles.container}>

        <FaSpinner
          style={{
            ...styles.icon,
            ...styles.pendingIcon,
            animation:
              'spin 1s linear infinite'
          }}
        />

        <h1 style={styles.title}>
          Payment Processing
        </h1>

        <p style={styles.subtitle}>
          Your payment is still being processed.
          Please wait for confirmation.
        </p>

        <div style={styles.dotPulse}>

          <div
            style={{
              ...styles.dot,
              ...styles.dotDelay1
            }}
          />

          <div
            style={{
              ...styles.dot,
              ...styles.dotDelay2
            }}
          />

          <div
            style={{
              ...styles.dot,
              ...styles.dotDelay3
            }}
          />

        </div>

        <p style={styles.statusText}>
          Waiting for payment confirmation...
        </p>

        <div style={styles.buttonGroup}>

          <button
            onClick={() =>
              checkPaymentStatus(reference)
            }
            style={styles.secondaryButton}
            disabled={isChecking}
          >
            Check Status Again
          </button>

          <button
            onClick={() => navigate('/orders')}
            style={styles.secondaryButton}
          >
            View My Orders
          </button>

        </div>

      </div>

      <Footer />

    </div>
  );
};

export default PaymentStatus;