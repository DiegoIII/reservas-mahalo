import React from 'react';
import HeroVideo from './HeroVideo';

const HomePage = ({ onViewChange, user }) => {
  return (
    <div className="homepage">
      <HeroVideo />
      
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-header">
            <div className="welcome-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
              </svg>
            </div>
            <h2>Bienvenido a Mahalo Beach Club</h2>
            <p className="welcome-subtitle">Tu refugio paradisíaco en la costa del Pacífico</p>
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-card" onClick={() => onViewChange('rooms')}>
              <div className="action-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
              </div>
              <h3>Reservar Habitación</h3>
              <p>Disfruta de nuestras cómodas habitaciones con vista al mar</p>
              <span className="action-link">
                Ver habitaciones
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
                </svg>
              </span>
            </div>
            
            <div className="action-card" onClick={() => onViewChange('restaurant')}>
              <div className="action-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M8.1,13.34L9.45,14.69L8.1,16.04L6.75,14.69L8.1,13.34M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z"/>
                </svg>
              </div>
              <h3>Reservar Restaurante</h3>
              <p>Saborea la mejor gastronomía con vista al océano</p>
              <span className="action-link">
                Ver restaurante
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
                </svg>
              </span>
            </div>
            
            <div className="action-card" onClick={() => onViewChange('events')}>
              <div className="action-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                </svg>
              </div>
              <h3>Reservar Eventos</h3>
              <p>Celebra tus momentos especiales en un ambiente único</p>
              <span className="action-link">
                Ver eventos
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
          <h2>¿Por qué elegir Mahalo?</h2>
          <p>Descubre todo lo que tenemos para ofrecerte</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image">
              <img src="/static/media/alberca.f9cfe8def7d817be532e.jpg" alt="Alberca" />
            </div>
            <div className="feature-content">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <h3>Alberca de Lujo</h3>
              <p>Disfruta de nuestra alberca con vista panorámica al océano Pacífico</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-image">
              <img src="/static/media/restaurant.00e9bfb2fe0f0e898683.jpg" alt="Restaurante" />
            </div>
            <div className="feature-content">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8.1,13.34L9.45,14.69L8.1,16.04L6.75,14.69L8.1,13.34M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z"/>
                </svg>
              </div>
              <h3>Restaurante Gourmet</h3>
              <p>Saborea los mejores platillos con ingredientes frescos del mar</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-image">
              <img src="/static/media/cuarto-1-pic-1.9a615196c12ad1467598.jpg" alt="Habitaciones" />
            </div>
            <div className="feature-content">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
              </div>
              <h3>Habitaciones Premium</h3>
              <p>Hospédate en nuestras cómodas habitaciones con todas las comodidades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="location-content">
          <div className="location-info">
            <div className="detail-card">
              <h3>Ubicación Privilegiada</h3>
              <div className="rating-badge">
                <div className="stars">★★★★★</div>
                <span className="rating-text">4.8/5 - Excelente ubicación</span>
              </div>
              
              <div className="detail-list">
                <div className="detail-item">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                  <div>
                    <strong>Playa Santa Lucía, Acapulco</strong>
                    <p>Ubicados en una de las mejores playas de Acapulco</p>
                  </div>
                </div>
                
                <div className="detail-item">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                  <div>
                    <strong>Acceso Directo a la Playa</strong>
                    <p>Disfruta del mar a solo unos pasos de tu habitación</p>
                  </div>
                </div>
                
                <div className="detail-item">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                  <div>
                    <strong>Estacionamiento Gratuito</strong>
                    <p>Estacionamiento seguro y gratuito para todos nuestros huéspedes</p>
                  </div>
                </div>
              </div>
              
              <button className="contact-button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                Contactar
              </button>
            </div>
          </div>
          
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.3647289414416!2d-99.87537142464252!3d16.857842817843938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca59ed50841e61%3A0x8616596a4359a410!2sMahalo%20Beach%20Club%20oficial!5e0!3m2!1ses-419!2smx!4v1761259640738!5m2!1ses-419!2smx"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Mahalo Beach Club"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para tu próxima aventura?</h2>
          <p>Reserva ahora y vive una experiencia inolvidable en Mahalo Beach Club</p>
          
          <div className="cta-buttons">
            <button className="cta-button primary" onClick={() => onViewChange('rooms')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
              </svg>
              Reservar Habitación
            </button>
            
            <button className="cta-button secondary" onClick={() => onViewChange('restaurant')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8.1,13.34L9.45,14.69L8.1,16.04L6.75,14.69L8.1,13.34M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z"/>
              </svg>
              Reservar Restaurante
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
