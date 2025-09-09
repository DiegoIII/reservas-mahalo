import React, { useState } from 'react';
import './App.css';
import RoomReservation from './components/RoomReservation';
import RestaurantReservation from './components/RestaurantReservation';
import EventReservation from './components/EventReservation';

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
          <p>Reserva una habitación en nuestro hotel con todas las comodidades</p>
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
        <h1>Sistema de Reservas Mahalo</h1>
        <p>Tu destino para experiencias excepcionales</p>
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
