import React from 'react';

const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal">
      <div className="modal-content">
        <div className="logout-confirm">
          <div className="warning-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
            </svg>
          </div>
          
          <h3>¿Estás seguro de que quieres cerrar sesión?</h3>
          
          <p>
            Al cerrar sesión, perderás el acceso a tus reservas y tendrás que 
            iniciar sesión nuevamente para hacer nuevas reservas.
          </p>
          
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onCancel}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
              Cancelar
            </button>
            
            <button className="confirm-button logout-btn" onClick={onConfirm}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
