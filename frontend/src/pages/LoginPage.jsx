import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import SuccessModal from '../components/shared/SuccessModal';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const user = result.user;
      setUserName(user?.username || user?.first_name || 'User');
      setShowSuccess(true);
      
      // Check if user is admin and redirect accordingly
      setTimeout(() => {
        setShowSuccess(false);
        if (user?.is_admin === true) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 3000);
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  // Rest of the component remains the same...
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    mainContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F5',
      padding: '3rem 1rem',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      padding: '2rem',
      maxWidth: '440px',
      width: '100%',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      textAlign: 'center',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#666666',
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: '0.95rem',
    },
    errorBox: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '0.75rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '14px',
      color: '#999999',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
    },
    bottomRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
    },
    loginButton: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 2rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    loginButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    spinner: {
      display: 'inline-block',
      width: '18px',
      height: '18px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTop: '3px solid #FFFFFF',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    forgotLink: {
      fontSize: '0.875rem',
      color: '#DB4444',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    footerText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#666666',
      marginTop: '1rem',
    },
    link: {
      color: '#DB4444',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
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

  const handleButtonHover = (e) => {
    if (!loading) e.target.style.backgroundColor = '#B33A3A';
  };

  const handleButtonLeave = (e) => {
    if (!loading) e.target.style.backgroundColor = '#DB4444';
  };

  const handleForgotHover = (e) => {
    e.target.style.color = '#B33A3A';
  };

  const handleForgotLeave = (e) => {
    e.target.style.color = '#DB4444';
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      <div style={styles.mainContainer}>
        <div style={styles.card}>
          <h1 style={styles.title}>Log into Exclusive</h1>
          <p style={styles.subtitle}>Enter your details below</p>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} size={16} />
                <input
                  type="email"
                  placeholder="Email or Phone Number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} size={16} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
            </div>

            <div style={styles.bottomRow}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.loginButton,
                  ...(loading ? styles.loginButtonDisabled : {})
                }}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
              <Link 
                to="/forgot-password" 
                style={styles.forgotLink}
                onMouseEnter={handleForgotHover}
                onMouseLeave={handleForgotLeave}
              >
                Forget Password?
              </Link>
            </div>
          </form>

          <p style={styles.footerText}>
            Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
          </p>
        </div>
      </div>
      <Footer />

      <SuccessModal
        isOpen={showSuccess}
        title="Welcome Back!"
        message={`Hello, ${userName}! You have been logged in successfully.`}
        onClose={() => setShowSuccess(false)}
        redirectPath="/"
      />
    </div>
  );
};

export default LoginPage;