import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const NotFoundPage = () => {
  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '4rem 1rem',
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      maxWidth: '448px',
      margin: '0 auto',
    },
    errorCode: {
      fontSize: '6rem',
      fontWeight: '700',
      color: '#DB4444',
      marginBottom: '0.5rem',
      lineHeight: 1,
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    description: {
      color: '#666666',
      marginBottom: '2rem',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    homeButton: {
      display: 'inline-block',
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.75rem 2.5rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      border: 'none',
      cursor: 'pointer',
    },
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = '#B33A3A';
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = '#DB4444';
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.errorCode}>404</h1>
          <h2 style={styles.title}>Page Not Found</h2>
          <p style={styles.description}>
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <Link 
            to="/" 
            style={styles.homeButton}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFoundPage;