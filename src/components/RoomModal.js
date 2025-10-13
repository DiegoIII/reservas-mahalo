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
  FaChevronRight 
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
    const maxImages = roomNumber === 5 ? 7 : roomNumber === 3 ? 5 : 6; // cuarto-3 tiene 5 imágenes, cuarto-5 tiene 7, otros tienen 6
    
    for (let i = 1; i <= maxImages; i++) {
      try {
        const image = require(`../images/cuarto-${roomNumber}/cuarto-${roomNumber}-pic-${i}.jpg`);
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

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="room-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="room-modal-header">
          <h2>{room.name}</h2>
          <div className="room-price-large">${room.price}/noche</div>
        </div>

        <div className="room-modal-body">
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

          <div className="room-details">
            <div className="room-info-section">
              <h3>Detalles de la Habitación</h3>
              <div className="room-features">
                <div className="feature">
                  <span className="feature-icon"><FaUsers /></span>
                  <span>Capacidad: {room.capacity} personas</span>
                </div>
                <div className="feature">
                  <span className="feature-icon"><FaBed /></span>
                  <span>{room.description}</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">{room.hasView ? <FaWater /> : <FaHome />}</span>
                  <span>{room.hasView ? 'Con vista al mar' : 'Habitación interior'}</span>
                </div>
                <div className="feature">
                  <span className="feature-icon"><FaDollarSign /></span>
                  <span>Precio: ${room.price} por noche</span>
                </div>
              </div>
            </div>

            {formData && (
              <div className="reservation-summary">
                <h3>Resumen de tu Reserva</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Fechas:</span>
                    <span>{formData.checkIn} - {formData.checkOut}</span>
                  </div>
                  <div className="summary-row">
                    <span>Noches:</span>
                    <span>{calculateNights()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Huéspedes:</span>
                    <span>{formData.guests}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="room-modal-footer">
          <button className="room-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="room-modal-confirm" onClick={handleConfirmReservation}>
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
