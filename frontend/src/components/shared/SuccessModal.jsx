import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessModal = ({ 
  isOpen, 
  title = 'Success!', 
  message = 'Operation completed successfully', 
  onClose,
  redirectPath 
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
        if (redirectPath) {
          window.location.href = redirectPath;
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, redirectPath]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-in-out',
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: '3rem 2.5rem',
      maxWidth: '420px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.5s ease-out',
      position: 'relative',
      overflow: 'hidden',
    },
    iconContainer: {
      display: 'inline-block',
      position: 'relative',
      marginBottom: '1.5rem',
    },
    icon: {
      fontSize: '4.5rem',
      color: '#22C55E',
      animation: 'bounceIn 0.6s ease-out',
    },
    checkmark: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      width: '24px',
      height: '24px',
      backgroundColor: '#22C55E',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: 'white',
      animation: 'pulse 1.5s infinite',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem',
    },
    message: {
      color: '#666666',
      fontSize: '1rem',
      marginBottom: '1.5rem',
      lineHeight: '1.5',
    },
    button: {
      backgroundColor: '#DB4444',
      color: 'white',
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '4px',
      backgroundColor: '#DB4444',
      animation: 'progressShrink 3s linear forwards',
    },
  };

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
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
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes progressShrink {
            0% { width: 100%; }
            100% { width: 0%; }
          }
        `}
      </style>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          <FaCheckCircle style={styles.icon} />
          <div style={styles.checkmark}>✓</div>
        </div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <button 
          style={styles.button}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#B33A3A'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#DB4444'}
          onClick={() => {
            if (onClose) onClose();
            if (redirectPath) {
              window.location.href = redirectPath;
            }
          }}
        >
          Continue
        </button>
        <div style={styles.progressBar}></div>
      </div>
    </div>
  );
};

export default SuccessModal;