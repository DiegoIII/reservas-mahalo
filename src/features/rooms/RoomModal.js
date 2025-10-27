import React, { useState, useEffect } from 'react';
import './RoomModal.css';
import { 
  FaUsers, 
  FaBed, 
  FaWater, 
  FaHome, 
  FaDollarSign, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaShower,
  FaUmbrellaBeach,
  FaStar
} from 'react-icons/fa';

const RoomModal = ({ isOpen, onClose, room, onConfirmReservation, formData, calculateTotal, calculateNights }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index to 0 when modal opens or room changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, room]);

  if (!isOpen || !room) return null;

  // Importar imágenes dinámicamente basado en el número de habitación
  const getRoomImages = (roomNumber) => {
    const images = [];
    const maxImages = roomNumber === 5 ? 7 : roomNumber === 3 ? 5 : 6;
    
    for (let i = 1; i <= maxImages; i++) {
      try {
        const image = require(`../../assets/images/cuarto-${roomNumber}/cuarto-${roomNumber}-pic-${i}.jpg`);
        images.push(image);
      } catch (error) {
        console.warn(`No se pudo cargar la imagen cuarto-${roomNumber}-pic-${i}.jpg`);
      }
    }
    return images;
  };

  const roomImages = getRoomImages(room.roomNumber);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const handleConfirmReservation = () => {
    onConfirmReservation();
    onClose();
  };

  // Características adicionales basadas en el tipo de habitación
  const getRoomFeatures = () => {
    const baseFeatures = [
      { icon: FaUsers, text: `Capacidad: ${room.capacity} personas` },
      { icon: FaBed, text: room.description },
      { icon: room.hasView ? FaWater : FaHome, text: room.hasView ? 'Vista panorámica al mar' : 'Habitación interior' },
      { icon: FaDollarSign, text: `$${room.price} por noche` }
    ];

    // Características premium para habitaciones con vista
    if (room.hasView) {
      baseFeatures.push(
        { icon: FaUmbrellaBeach, text: 'Acceso directo a la playa' },
        { icon: FaWifi, text: 'WiFi de alta velocidad' }
      );
    }

    // Características adicionales según el tipo de habitación
    if (room.roomNumber === 1 || room.roomNumber === 2) {
      baseFeatures.push(
        { icon: FaTv, text: 'Smart TV 55"' },
        { icon: FaSnowflake, text: 'Aire acondicionado' },
        { icon: FaShower, text: 'Baño de lujo' }
      );
    } else {
      baseFeatures.push(
        { icon: FaWifi, text: 'WiFi incluido' },
        { icon: FaTv, text: 'TV por cable' }
      );
    }

    return baseFeatures;
  };

  const roomFeatures = getRoomFeatures();

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="room-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="room-modal-header">
          <div className="room-header-content">
            <div className="room-title-section">
              <h2>{room.name}</h2>
              <div className="room-rating">
                <FaStar className="star-icon" />
                <span>4.8 • Excelente</span>
              </div>
            </div>
            <div className="room-price-section">
              <div className="room-price-large">${room.price}<span className="price-period">/noche</span></div>
              <div className="room-number">Habitación #{room.roomNumber}</div>
            </div>
          </div>
        </div>

        <div className="room-modal-body">
          <div className="room-gallery-section">
            <div className="room-gallery">
              {roomImages.length > 0 && (
                <>
                  <div className="room-main-image">
                    <img 
                      src={roomImages[currentImageIndex]} 
                      alt={`${room.name} - Imagen ${currentImageIndex + 1}`}
                    />
                    {roomImages.length > 1 && (
                      <>
                        <button className="gallery-nav prev" onClick={prevImage}>
                          <FaChevronLeft />
                        </button>
                        <button className="gallery-nav next" onClick={nextImage}>
                          <FaChevronRight />
                        </button>
                        <div className="image-counter">
                          {currentImageIndex + 1} / {roomImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="room-thumbnails">
                    {roomImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${room.name} - Thumbnail ${index + 1}`}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="room-details-section">
            <div className="room-info-card">
              <div className="card-header">
                <h3>Características de la Habitación</h3>
                <div className="room-highlight">
                  {room.hasView ? 'Vista Premium al Mar' : 'Comodidad y Elegancia'}
                </div>
              </div>
              <div className="room-features-grid">
                {roomFeatures.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      <feature.icon />
                    </div>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {formData && formData.checkIn && formData.checkOut && (
              <div className="reservation-summary-card">
                <div className="card-header">
                  <h3>Resumen de tu Reserva</h3>
                  <div className="stay-duration">
                    {calculateNights()} {calculateNights() === 1 ? 'noche' : 'noches'}
                  </div>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span className="label">Check-in</span>
                    <span className="value">{new Date(formData.checkIn).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Check-out</span>
                    <span className="value">{new Date(formData.checkOut).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Huéspedes</span>
                    <span className="value">{formData.guests} personas</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span className="label">Total</span>
                    <span className="value">${calculateTotal().toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="room-modal-footer">
          <div className="footer-content">
            <div className="price-breakdown">
              <span className="nights-count">
                {calculateNights()} {calculateNights() === 1 ? 'noche' : 'noches'} × ${room.price}
              </span>
              <span className="total-price">${calculateTotal().toLocaleString('es-MX')}</span>
            </div>
            <div className="footer-actions">
              <button className="room-modal-cancel" onClick={onClose}>
                Explorar Más
              </button>
              <button className="room-modal-confirm" onClick={handleConfirmReservation}>
                Reservar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;