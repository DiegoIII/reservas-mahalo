import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onViewChange }) => {
  const [activeOption, setActiveOption] = useState(null);

  const handleOptionClick = (option) => {
    setActiveOption(option);
    onViewChange(option);
  };

  const handleKeyDown = (event, option) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionClick(option);
    }
  };

  const navbarOptions = [
    {
      id: 'rooms',
      title: 'Habitaciones',
      description: 'Reserva tu habitación',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'restaurant',
      title: 'Restaurante',
      description: 'Reserva daypass',
      icon: (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" fill="currentColor"/>
          <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'events',
      title: 'Eventos',
      description: 'Cotiza tu evento',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-content">
        <div className="navbar-options">
          {navbarOptions.map((option) => (
            <div
              key={option.id}
              className={`navbar-option ${activeOption === option.id ? 'active' : ''}`}
              onClick={() => handleOptionClick(option.id)}
              onKeyDown={(e) => handleKeyDown(e, option.id)}
              tabIndex={0}
              role="button"
              aria-label={`${option.title} - ${option.description}`}
              aria-pressed={activeOption === option.id}
            >
              <div className="navbar-icon" aria-hidden="true">
                {option.icon}
              </div>
              <div className="navbar-text">
                <h4>{option.title}</h4>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
