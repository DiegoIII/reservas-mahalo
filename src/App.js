import React, { useState } from 'react';
import './App.css';
import RoomReservation from './components/RoomReservation';
import RestaurantReservation from './components/RestaurantReservation';
import EventReservation from './components/EventReservation';
import mahaloLogo from './images/mahalo-logo.jpg';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderHomePage = () => (
    <div className="homepage">
      <div className="welcome-section">
        <h2>Bienvenido a Mahalo</h2>
        <p>Selecciona el tipo de reserva que necesitas</p>
      </div>
      
      <div className="main-options">
        <div className="option-card" onClick={() => setCurrentView('rooms')}>
          <div className="option-icon">🏨</div>
          <h3>Reservar Habitación</h3>
          <p>Reserva una habitación con todas las comodidades</p>
          <div className="option-features">
            <span>• Habitaciones de lujo</span>
            <span>• Servicio 24/7</span>
            <span>• Desayuno incluido</span>
          </div>
        </div>

        <div className="option-card" onClick={() => setCurrentView('restaurant')}>
          <div className="option-icon">🍽️</div>
          <h3>Reservar Mesa</h3>
          <p>Disfruta de una experiencia culinaria excepcional en nuestro restaurante</p>
          <div className="option-features">
            <span>• Cocina gourmet</span>
            <span>• Ambiente elegante</span>
            <span>• Carta de vinos</span>
          </div>
        </div>

        <div className="option-card" onClick={() => setCurrentView('events')}>
          <div className="option-icon">🎉</div>
          <h3>Reservar Evento</h3>
          <p>Organiza tu evento especial en nuestros espacios únicos</p>
          <div className="option-features">
            <span>• Salones versátiles</span>
            <span>• Equipamiento completo</span>
            <span>• Servicio personalizado</span>
          </div>
        </div>
      </div>
      
      <div className="location-section">
        <h2>¿Dónde Encontrarnos?</h2>
        <p>Visítanos en nuestra ubicación privilegiada en la costa</p>
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4733.665857395477!2d-99.87478248611757!3d16.85744778402588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca59ed50841e61%3A0x8616596a4359a410!2sMahalo%20Beach%20Club%20oficial!5e0!3m2!1ses-419!2smx!4v1757902653511!5m2!1ses-419!2smx" 
            width="100%" 
            height="450" 
            style={{border: 0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Mahalo Beach Club"
          ></iframe>
        </div>
        <div className="location-info">
          <div className="location-details">
            <h3>📍 Mahalo Beach Club</h3>
            <p>Ubicado en la costa de Guerrero, México</p>
            <p>Disfruta de nuestras instalaciones con vista al mar</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <div className="back-navigation">
      <button className="back-button" onClick={() => setCurrentView('home')}>
        ← Volver al Inicio
      </button>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img src={mahaloLogo} alt="Mahalo Logo" className="logo" />
          <div className="header-text">
            <h1>Reservas Mahalo</h1>
            <p>Tu destino para experiencias excepcionales</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'home' && renderHomePage()}
        {currentView !== 'home' && renderBackButton()}
        {currentView === 'rooms' && <RoomReservation />}
        {currentView === 'restaurant' && <RestaurantReservation />}
        {currentView === 'events' && <EventReservation />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Sistema de Reservas Mahalo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
