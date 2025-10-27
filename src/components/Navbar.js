import React, { useState } from 'react';
import { FaBed, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
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
      description: 'Reserva tu estancia',
      icon: FaBed
    },
    {
      id: 'restaurant',
      title: 'Restaurante',
      description: 'Reserva daypass',
      icon: FaUtensils
    },
    {
      id: 'events',
      title: 'Eventos',
      description: 'Cotiza tu evento',
      icon: FaCalendarAlt
    }
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-container">
        <div className="navbar-content">
          {navbarOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                className={`nav-button ${activeOption === option.id ? 'active' : ''}`}
                onClick={() => handleOptionClick(option.id)}
                onKeyDown={(e) => handleKeyDown(e, option.id)}
                aria-label={`${option.title} - ${option.description}`}
                aria-pressed={activeOption === option.id}
              >
                <div className="nav-icon">
                  <IconComponent />
                </div>
                <div className="nav-text">
                  <span className="nav-title">{option.title}</span>
                  <span className="nav-description">{option.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;