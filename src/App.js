import React, { useEffect, useState } from 'react';
import './App.css';
import RoomReservation from './components/RoomReservation';
import RestaurantReservation from './components/RestaurantReservation';
import EventReservation from './components/EventReservation';
import mahaloLogo from './images/mahalo-logo.jpg';
import restaurantImg from './images/restaurant.jpg';
import albercaImg from './images/alberca.jpg';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Ensure sidebar is open on mobile and adjust on resize
  useEffect(() => {
    const applyResponsiveSidebar = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(false);
      }
    };
    applyResponsiveSidebar();
    window.addEventListener('resize', applyResponsiveSidebar);
    return () => window.removeEventListener('resize', applyResponsiveSidebar);
  }, []);

  const renderHomePage = () => (
    <div className="homepage">
      <div className="location-section">
        <h2>Como llegar a tu club de playa </h2>
        <p>Visítanos en nuestra ubicación privilegiada en la costa</p>
        <div className="location-info">
          <div className="location-details">
            <h3>📍 Mahalo Beach Club</h3>
            <p>Ubicado en la costa de Guerrero, México</p>
            <p>Disfruta de nuestras instalaciones con vista al mar</p>
          </div>
        </div>
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
        
      </div>

      <div className="welcome-section">
        <h2>Bienvenido a Mahalo</h2>
        <p>Tu casa en la playa</p>
      </div>
      
      <section className="zigzag-section">
        <div className="zigzag-item">
          <div className="zigzag-image">
            <img src={restaurantImg} alt="Área de restaurant" loading="lazy" />
          </div>
          <div className="zigzag-content">
            <h3>Área de restaurant</h3>
            <p>Ambiente acogedor junto al mar, platillos frescos y coctelería. Atención personalizada y música relajante para disfrutar con familia o amigos.</p>
          </div>
        </div>

        <div className="zigzag-item reverse">
          <div className="zigzag-image">
            <img src={albercaImg} alt="Área de alberca" loading="lazy" />
          </div>
          <div className="zigzag-content">
            <h3>Área de alberca</h3>
            <p>Zona al aire libre con camastros y sombra, ideal para nadar, tomar el sol y disfrutar bebidas refrescantes con vista a la playa.</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderSidebar = () => (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <h3>Reservas</h3>
        <div className="sidebar-options">
          <div className="sidebar-option" onClick={() => setCurrentView('rooms')}>
            <div className="sidebar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div className="sidebar-text">
              <h4>Habitaciones</h4>
              <p>Reserva tu habitación</p>
            </div>
          </div>

          <div className="sidebar-option" onClick={() => setCurrentView('restaurant')}>
            <div className="sidebar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" fill="currentColor"/>
                <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="sidebar-text">
              <h4>Restaurante</h4>
              <p>Reserva daypass</p>
            </div>
          </div>

          <div className="sidebar-option" onClick={() => setCurrentView('events')}>
            <div className="sidebar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div className="sidebar-text">
              <h4>Eventos</h4>
              <p>Cotisa tu evento </p>
            </div>
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
            <h1> Mahalo Beach Club </h1>
            <p>Tu casa en la playa</p>
          </div>
          <div className="social-links">
            <a
              className="social-button facebook"
              href="https://www.facebook.com/clubmahalooficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M22 12.06C22 6.49 17.52 2 11.94 2 6.37 2 1.88 6.49 1.88 12.06c0 4.93 3.6 9.02 8.3 9.88v-6.99H7.96v-2.9h2.22V9.86c0-2.2 1.3-3.42 3.3-3.42.96 0 1.96.17 1.96.17v2.15h-1.1c-1.08 0-1.42.67-1.42 1.36v1.63h2.41l-.38 2.9h-2.03v6.99c4.7-.86 8.3-4.95 8.3-9.88z"/>
              </svg>
            </a>
            <a
              className="social-button instagram"
              href="https://www.instagram.com/mahalocluboficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.8a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4zm6.4-.9a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM12 9.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>
              </svg>
            </a>
            <a
              className="social-button tiktok"
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              title="TikTok"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M21 8.5c-1.6 0-3.1-.5-4.3-1.4v7.1c0 3.8-3.1 6.8-6.8 6.8S3 17.9 3 14.2s3.1-6.8 6.8-6.8c.5 0 1 .1 1.5.2v3.2c-.5-.2-1-.3-1.5-.3-2 0-3.6 1.6-3.6 3.6S7.8 18.6 9.8 18.6s3.6-1.6 3.6-3.6V2h3.2c.3 2.3 2.1 4.1 4.4 4.4V8.5z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className={`app-body ${isSidebarCollapsed ? 'with-collapsed-sidebar' : ''}`}>
        {renderSidebar()}
        <main className="main-content">
          {currentView === 'home' && renderHomePage()}
          {currentView !== 'home' && renderBackButton()}
          {currentView === 'rooms' && <RoomReservation />}
          {currentView === 'restaurant' && <RestaurantReservation />}
          {currentView === 'events' && <EventReservation />}
        </main>
      </div>

      <footer className="app-footer">
        <p>&copy; 2024 Sistema de  Mahalo Beach Club . Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
