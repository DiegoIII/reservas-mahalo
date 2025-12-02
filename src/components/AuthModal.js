import React, { useEffect, useState } from 'react';
import './ModalStyles.css';

const AuthModal = ({ isOpen, onClose, mode, form, onInputChange, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isSignup = mode === 'signup';
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}</h3>
        
        <form onSubmit={onSubmit} className="reservation-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="name">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={onInputChange}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>
          )}

          {isSignup ? (
            <div className="form-group">
              <label htmlFor="email">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                </svg>
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={onInputChange}
                placeholder="tu@email.com"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="username">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username || ''}
                onChange={onInputChange}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          )}

          {isSignup && (
            <div className="form-group">
              <label htmlFor="phone">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onInputChange}
                placeholder="+52 123 456 7890"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={form.password}
                onChange={onInputChange}
                placeholder="Mínimo 6 caracteres"
                required
                minLength="6"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 0
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                    <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M2 12C3.73 8.11 8 5 13 5c2.05 0 3.99.5 5.67 1.39l-1.46 1.46C15.93 7.29 14.52 7 13 7 8.58 7 4.79 9.58 3.22 13c.44.99 1.06 1.89 1.81 2.68l-1.41 1.41C2.39 15.96 1.62 14.56 1 13c.38-.91.88-1.77 1.5-2.57z"/>
                    <path d="M21.19 21.19L2.81 2.81 4.22 1.4 22.6 19.78 21.19 21.19z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="confirm-button">
              {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
