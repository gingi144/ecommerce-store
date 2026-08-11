import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import SuccessModal from '../components/shared/SuccessModal';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await signup(userData);

    if (result.success) {
      setSuccessMessage(`Welcome, ${formData.username}! Your account has been created successfully.`);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/');
      }, 3000);
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

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
      marginBottom: '0.75rem',
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
    inputRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '0.75rem',
    },
    inputSmall: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    spinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTop: '3px solid #FFFFFF',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    divider: {
      position: 'relative',
      margin: '1rem 0',
    },
    dividerLine: {
      border: 'none',
      borderTop: '1px solid #E5E5E5',
    },
    dividerText: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#FFFFFF',
      padding: '0 0.75rem',
      fontSize: '0.875rem',
      color: '#999999',
    },
    googleButton: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem',
      transition: 'background-color 0.3s ease',
      color: '#000000',
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

  const handleGoogleHover = (e) => {
    e.currentTarget.style.backgroundColor = '#F5F5F5';
  };

  const handleGoogleLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      <div style={styles.mainContainer}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create an Account</h1>
          <p style={styles.subtitle}>Enter your details below</p>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <FaUser style={styles.inputIcon} size={16} />
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} size={16} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email or Phone Number"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <input
                name="first_name"
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                style={styles.inputSmall}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <input
                name="last_name"
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                style={styles.inputSmall}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} size={16} />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div style={{...styles.formGroup, marginBottom: '1rem'}}>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} size={16} />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
          </div>

          <button 
            style={styles.googleButton}
            onMouseEnter={handleGoogleHover}
            onMouseLeave={handleGoogleLeave}
          >
            <FaGoogle style={{ color: '#DB4437' }} /> Sign up with Google
          </button>

          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
          </p>
        </div>
      </div>
      <Footer />

      <SuccessModal
        isOpen={showSuccess}
        title="Account Created!"
        message={successMessage}
        onClose={() => setShowSuccess(false)}
        redirectPath="/"
      />
    </div>
  );
};

export default SignupPage;