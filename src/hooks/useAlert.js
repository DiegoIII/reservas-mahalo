import { useState, useCallback } from 'react';

const useAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showAlert = useCallback((message, options = {}) => {
    const {
      title = '',
      type = 'info',
      autoClose = false,
      autoCloseDelay = 3000
    } = options;

    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      autoClose,
      autoCloseDelay
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, title = '¡Éxito!') => {
    showAlert(message, { title, type: 'success', autoClose: true });
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error') => {
    showAlert(message, { title, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Advertencia') => {
    showAlert(message, { title, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message, title = 'Información') => {
    showAlert(message, { title, type: 'info', autoClose: true });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useAlert;

