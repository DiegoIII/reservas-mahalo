import React, { useEffect } from 'react';
import './CustomAlert.css';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return (
    <div className="custom-alert-overlay" onClick={onClose}>
      <div className={`custom-alert custom-alert-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="custom-alert-header">
          <div className="custom-alert-icon">
            {getIcon()}
          </div>
          <div className="custom-alert-content">
            {title && <h3 className="custom-alert-title">{title}</h3>}
            <p className="custom-alert-message">{message}</p>
          </div>
          {showCloseButton && (
            <button className="custom-alert-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;

