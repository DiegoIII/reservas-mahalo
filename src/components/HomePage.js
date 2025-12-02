import React, { useState, useEffect } from 'react';
import './HomePage.css';
import HeroVideo from './HeroVideo';
import { alberca, restaurant, roomImages } from '../assets/images';
import { 
  FaUmbrellaBeach, 
  FaSwimmingPool, 
  FaUtensils, 
  FaBed, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCar,
  FaStar,
  FaPhone,
  FaArrowRight,
  FaCheckCircle,
  FaWifi,
  FaCocktail,
  FaConciergeBell,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const HomePage = ({ onViewChange, user }) => {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Importar imágenes del carousel
  const carouselImages = [
    require('../assets/images/pagina-principal/mahalo_pic_1.jpg'),
    require('../assets/images/pagina-principal/mahalo_pic_2.jpg'),
    require('../assets/images/pagina-principal/mahalo_pic_3.jpg'),
    require('../assets/images/pagina-principal/mahalo_pic_4.jpg')
  ];

  const carouselTexts = [
    {
      title: "Vista Panorámica al Océano",
      description: "Disfruta de atardeceres espectaculares desde nuestras instalaciones"
    },
    {
      title: "Alberca a tu disposición",
      description: "Pasa un día en familia o con amigos en nuestra alberca"
    },
    {
      title: "Gastronomía Excepcional",
      description: "Saborea los mejores platillos con ingredientes frescos del mar"
    },
    {
      title: "Espacios para Eventos",
      description: "Celebra tus momentos especiales en un ambiente único"
    }
  ];

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextCarousel();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <HeroVideo />
      
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-content">
            <div className="welcome-header">
              <div className="welcome-badge">
                <FaUmbrellaBeach className="badge-icon" />
                <span>Experiencia Premium</span>
              </div>
              <h1 className="welcome-title">
                Bienvenido a <span className="brand-highlight">Mahalo</span> Beach Club
              </h1>
              <p className="welcome-subtitle">
                Tu refugio paradisíaco en la costa del Pacífico - Donde cada momento se convierte en un recuerdo inolvidable
              </p>
            </div>
            
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-number">4.8</div>
                <div className="stat-label">
                  <div className="stars">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  Calificación
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Huéspedes Felices</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Eventos Exitosos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Servicio</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="action-card" onClick={() => onViewChange('rooms')}>
                <div className="action-icon">
                  <FaBed />
                </div>
                <div className="action-content">
                  <h3>Reservar Habitación</h3>
                  <p>Disfruta de nuestras cómodas habitaciones con vista al mar y todas las comodidades</p>
                  <div className="action-features">
                    <span><FaWifi /> WiFi Gratuito</span>
                    <span><FaCheckCircle /> Vista al Mar</span>
                    <span><FaConciergeBell /> Servicio 24/7</span>
                  </div>
                </div>
                <div className="action-link">
                  Explorar Habitaciones
                  <FaArrowRight className="link-arrow" />
                </div>
              </div>
              
              <div className="action-card" onClick={() => onViewChange('restaurant')}>
                <div className="action-icon">
                  <FaUtensils />
                </div>
                <div className="action-content">
                  <h3>Reservar Restaurante</h3>
                  <p>Saborea la mejor gastronomía con ingredientes frescos y vista panorámica al océano</p>
                  <div className="action-features">
                    <span><FaCheckCircle /> Mariscos Frescos</span>
                    <span><FaCheckCircle /> Chef Profesional</span>
                    <span><FaCocktail /> Bar Premium</span>
                  </div>
                </div>
                <div className="action-link">
                  Rerservar Daypass
                  <FaArrowRight className="link-arrow" />
                </div>
              </div>
              
              <div className="action-card" onClick={() => onViewChange('events')}>
                <div className="action-icon">
                  <FaCalendarAlt />
                </div>
                <div className="action-content">
                  <h3>Cotiza tu Evento</h3>
                  <p>Celebra tus momentos especiales en un ambiente único y con servicio personalizado</p>
                  <div className="action-features">
                    <span><FaCheckCircle /> Bodas</span>
                    <span><FaCheckCircle /> Cumpleaños</span>
                    <span><FaCheckCircle /> Corporativos</span>
                  </div>
                </div>
                <div className="action-link">
                  Planificar Evento
                  <FaArrowRight className="link-arrow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaStar className="badge-icon" />
              ¿Por qué elegir Mahalo?
            </div>
            <h2>Vive la Experiencia Completa</h2>
            <p className="section-description">
              Descubre todo lo que tenemos para ofrecerte en nuestro exclusivo beach club
            </p>
          </div>

          {/* Carousel Section */}
          <div className="carousel-section">
            <div className="carousel-container">
              <div className="carousel">
                <div className="carousel-item active">
                  <img 
                    src={carouselImages[currentCarouselIndex]} 
                    alt={`Mahalo Beach Club - ${carouselTexts[currentCarouselIndex].title}`}
                  />
                  <div className="carousel-caption">
                    <h5>{carouselTexts[currentCarouselIndex].title}</h5>
                    <p>{carouselTexts[currentCarouselIndex].description}</p>
                  </div>
                </div>
                
                <button className="carousel-control prev" onClick={prevCarousel}>
                  <FaChevronLeft />
                </button>
                <button className="carousel-control next" onClick={nextCarousel}>
                  <FaChevronRight />
                </button>
                
                <div className="carousel-indicators">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentCarouselIndex ? 'active' : ''}`}
                      onClick={() => setCurrentCarouselIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-image">
                <img src={alberca} alt="Alberca de lujo" />
                <div className="feature-overlay">
                  <FaSwimmingPool className="overlay-icon" />
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-header">
                  <div className="feature-icon">
                    <FaSwimmingPool />
                  </div>
                  <h3>Alberca</h3>
                  <div className="feature-rating">
                    <FaStar className="star" />
                    <span>4.9</span>
                  </div>
                </div>
                <p>Disfruta de nuestra espectacular alberca con vista panorámica al océano Pacífico, área de camastros y servicio de bar.</p>
                <div className="feature-tags">
                  <span className="tag">Vista panorámica</span>
                  <span className="tag">Bar en alberca</span>
                  <span className="tag">Camastros premium</span>
                </div>
              </div>
            </div>
            
            <div className="feature-card clickable" onClick={() => {
              onViewChange('food');
              window.scrollTo(0, 0);
            }}>
              <div className="feature-image">
                <img src={restaurant} alt="Restaurante gourmet" />
                <div className="feature-overlay">
                  <FaUtensils className="overlay-icon" />
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-header">
                  <div className="feature-icon">
                    <FaUtensils />
                  </div>
                  <h3>Alimentos de Mahalo</h3>
                  <div className="feature-rating">
                    <FaStar className="star" />
                    <span>4.8</span>
                  </div>
                </div>
                <p>Saborea los mejores platillos preparados por nuestro chef ejecutivo con ingredientes frescos del mar y productos locales.</p>
                <div className="feature-tags">
                  <span className="tag">Mariscos frescos</span>
                  <span className="tag">Chef ejecutivo</span>
                  <span className="tag">Terraza al mar</span>
                </div>
                <div className="feature-action">
                  <span className="action-text">Ver galería de platillos</span>
                  <FaArrowRight className="action-arrow" />
                </div>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-image">
                <img src={roomImages.cuarto1[0]} alt="Habitaciones premium" />
                <div className="feature-overlay">
                  <FaBed className="overlay-icon" />
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-header">
                  <div className="feature-icon">
                    <FaBed />
                  </div>
                  <h3>Habitaciones Exclusivas</h3>
                  <div className="feature-rating">
                    <FaStar className="star" />
                    <span>4.7</span>
                  </div>
                </div>
                <p>Relájate en nuestras cómodas habitaciones diseñadas para tu máximo confort, con todas las comodidades y servicios premium.</p>
                <div className="feature-tags">
                  <span className="tag">Amenidades de lujo</span>
                  <span className="tag">WiFi alta velocidad</span>
                  <span className="tag">Vistas espectaculares</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="amenities-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaCheckCircle className="badge-icon" />
              Servicios Incluidos
            </div>
            <h2>Comodidades Mahalo</h2>
            <p className="section-description">
              Todo lo que necesitas para una experiencia inolvidable
            </p>
          </div>
          
          <div className="amenities-grid">
            <div className="amenity-item">
              <div className="amenity-icon">
                <FaWifi />
              </div>
              <h4>WiFi de Alta Velocidad</h4>
              <p>Internet gratuito en todas las áreas</p>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <FaCar />
              </div>
              <h4>Estacionamiento</h4>
              <p>Estacionamiento seguro y vigilado</p>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <FaConciergeBell />
              </div>
              <h4>Servicio 24/7</h4>
              <p>Atención personalizada todo el día</p>
            </div>
            
            <div className="amenity-item">
              <div className="amenity-icon">
                <FaCocktail />
              </div>
              <h4>Bar Exclusivo</h4>
              <p>Coctelería premium y bebidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="container">
          <div className="location-content">
            <div className="location-info">
              <div className="section-header">
                <div className="section-badge">
                  <FaMapMarkerAlt className="badge-icon" />
                  Ubicación Privilegiada
                </div>
                <h2>En el Corazón de Acapulco</h2>
                <p className="section-description">
                  Descubre por qué nuestra ubicación es perfecta para tu escapada
                </p>
              </div>

              <div className="location-card">
                <div className="location-header">
                  <h3>Playa Santa Lucía, Acapulco</h3>
                  <div className="location-rating">
                    <div className="stars">
                      <FaStar className="star filled" />
                      <FaStar className="star filled" />
                      <FaStar className="star filled" />
                      <FaStar className="star filled" />
                      <FaStar className="star filled" />
                    </div>
                    <span className="rating-text">4.8/5 - Excelente ubicación</span>
                  </div>
                </div>
                
                <div className="location-details">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="detail-content">
                      <strong>Ubicación Estratégica</strong>
                      <p>En una de las mejores playas de Acapulco, a solo 15 minutos del centro y 25 minutos del aeropuerto.</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaUmbrellaBeach />
                    </div>
                    <div className="detail-content">
                      <strong>Acceso Directo a la Playa</strong>
                      <p>Disfruta del mar cristalino a solo unos pasos de tu habitación. Playa privada para huéspedes.</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaCar />
                    </div>
                    <div className="detail-content">
                      <strong>Estacionamiento</strong>
                      <p>Estacionamiento seguro y vigilado las 24 horas para todos nuestros huéspedes.</p>
                    </div>
                  </div>
                </div>
                
                <div className="location-actions">
                  <button className="contact-button">
                    <FaPhone className="button-icon" />
                    Llamar Ahora
                  </button>
                  <button className="directions-button">
                    <FaMapMarkerAlt className="button-icon" />
                    Cómo Llegar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="map-container">
              <div className="map-wrapper">
                <div className="map-overlay">
                  <div className="map-info">
                    <h4>Encuéntranos Fácilmente</h4>
                    <p>Playa Santa Lucía, Acapulco de Juárez, Guerrero</p>
                  </div>
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.3647289414416!2d-99.87537142464252!3d16.857842817843938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca59ed50841e61%3A0x8616596a4359a410!2sMahalo%20Beach%20Club%20oficial!5e0!3m2!1ses-419!2smx!4v1761259640738!5m2!1ses-419!2smx"
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '16px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Mahalo Beach Club"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <div className="cta-badge">
                <FaStar className="badge-icon" />
                Reserva Ahora
              </div>
              <h2>¿Listo para tu Aventura en Mahalo?</h2>
              <p>No esperes más para vivir una experiencia única. Reserva ahora y asegura tu lugar en el paraíso</p>
              
              <div className="cta-features">
                <div className="cta-feature">
                  <FaCheckCircle className="feature-icon" />
                  <span>Reserva Instantánea</span>
                </div>
                <div className="cta-feature">
                  <FaCheckCircle className="feature-icon" />
                  <span>Mejor Precio Garantizado</span>
                </div>
                <div className="cta-feature">
                  <FaCheckCircle className="feature-icon" />
                  <span>Cancelación Gratuita</span>
                </div>
              </div>
            </div>
            
            <div className="cta-actions">
              <button className="cta-button primary" onClick={() => onViewChange('rooms')}>
                <FaBed className="button-icon" />
                <div className="button-content">
                  <span className="button-main">Reservar Habitación</span>
                  <span className="button-sub">Desde $60/noche</span>
                </div>
                <FaArrowRight className="button-arrow" />
              </button>
              
              <button className="cta-button secondary" onClick={() => onViewChange('restaurant')}>
                <FaUtensils className="button-icon" />
                <div className="button-content">
                  <span className="button-main">Reservar Restaurante</span>
                  <span className="button-sub">Experiencia gourmet</span>
                </div>
                <FaArrowRight className="button-arrow" />
              </button>

              <button className="cta-button secondary" onClick={() => onViewChange('events')}>
                <FaCalendarAlt className="button-icon" />
                <div className="button-content">
                  <span className="button-main">Planificar Evento</span>
                  <span className="button-sub">Celebraciones únicas</span>
                </div>
                <FaArrowRight className="button-arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;