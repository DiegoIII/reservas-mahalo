import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import './RoomReservation.css';
import CustomAlert from '../../components/CustomAlert';
import RoomModal from './RoomModal';
import useAlert from '../../hooks/useAlert';

const RoomReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    checkIn: '', checkOut: '', guests: 1, roomType: '',
    name: '', email: '', phone: '', specialRequests: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();
  const roomCardRefs = useRef({});

  const roomTypes = [
    { id: 'room1', name: 'Habitación 1 - Con Vista (Principal)', price: 120, description: '4 personas (puede crecer 2 personas más)', capacity: 6, hasView: true, roomNumber: 1 },
    { id: 'room2', name: 'Habitación 2 - Con Vista', price: 100, description: '4 personas (puede crecer 1 persona más)', capacity: 5, hasView: true, roomNumber: 2 },
    { id: 'room3', name: 'Habitación 3 - Sin Vista', price: 80, description: '4 personas', capacity: 4, hasView: false, roomNumber: 3 },
    { id: 'room4', name: 'Habitación 4 - Sin Vista', price: 80, description: '4 personas', capacity: 4, hasView: false, roomNumber: 4 },
    { id: 'room5', name: 'Habitación 5 - Sin Vista', price: 60, description: '2 personas', capacity: 2, hasView: false, roomNumber: 5 }
  ];

  const roomCapacityRules = {
    room1: 6,
    room2: 5,
    default: 4
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getMaxGuests = useCallback(() => {
    const selectedRoom = roomTypes.find(r => r.id === formData.roomType);
    const ruleCap = roomCapacityRules[formData.roomType] || roomCapacityRules.default;
    return selectedRoom ? Math.min(ruleCap, selectedRoom.capacity) : roomCapacityRules.default;
  }, [formData.roomType]);

  useEffect(() => {
    const maxGuests = getMaxGuests();
    if (Number(formData.guests) > maxGuests) {
      setFormData(prev => ({ ...prev, guests: maxGuests }));
    }
  }, [formData.roomType, formData.guests, getMaxGuests]);

  const areAllRoomsUnavailable = () => {
    if (!roomAvailability || Object.keys(roomAvailability).length === 0) return false;
    return Object.values(roomAvailability).every(available => available === false);
  };

  const getNextAvailableDate = (roomId) => {
    return availabilityInfo?.[roomId]?.nextAvailable || null;
  };

  const scrollToRoomCard = (roomId) => {
    roomCardRefs.current[roomId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  };

  const checkRoomAvailability = useCallback(async (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return;
    
    setLoadingAvailability(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/room-availability?check_in=${checkIn}&check_out=${checkOut}`);
      if (response.ok) {
        const data = await response.json();
        setRoomAvailability(data.availability || data);
        setAvailabilityInfo(data.info || null);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      checkRoomAvailability(formData.checkIn, formData.checkOut);
    }
  }, [formData.checkIn, formData.checkOut, checkRoomAvailability]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    return selectedRoom ? selectedRoom.price * calculateNights() : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['checkIn', 'checkOut', 'roomType', 'name', 'email'];
    const isValid = requiredFields.every(field => formData[field]);
    
    if (isValid) {
      setShowConfirmation(true);
      setTimeout(() => {
        document.getElementById('room-confirmation-modal')?.scrollIntoView({ 
          behavior: 'smooth', block: 'center' 
        });
      }, 100);
    } else {
      showError('Por favor completa todos los campos obligatorios', 'Campos requeridos');
    }
  };

  const handleRoomModalClose = () => {
    setShowRoomModal(false);
    setSelectedRoom(null);
  };

  const handleRoomModalConfirm = () => {
    if (selectedRoom) {
      setFormData(prev => ({ ...prev, roomType: selectedRoom.id }));
      setShowRoomModal(false);
      setSelectedRoom(null);
      setTimeout(() => {
        document.querySelector('.reservation-form')?.scrollIntoView({ 
          behavior: 'smooth', block: 'start' 
        });
      }, 100);
    }
  };

  const confirmReservation = async () => {
    try {
      const payload = {
        check_in: formData.checkIn, check_out: formData.checkOut, guests: Number(formData.guests),
        room_type: formData.roomType, name: formData.name, email: formData.email,
        phone: formData.phone || null, special_requests: formData.specialRequests || null
      };
      
      const resp = await fetch(`${apiUrl}/api/admin/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo guardar la reserva');
      }
      
      showSuccess('¡Reserva confirmada! Te enviaremos un email de confirmación.', 'Reserva exitosa');
      setShowConfirmation(false);
      setFormData(initialFormData);
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  const renderFormSection = (title, description, children) => (
    <div className="form-section">
      <div className="section-header">
        <h3>{title}</h3>
        <p className="section-description">{description}</p>
      </div>
      {children}
    </div>
  );

  const renderRoomCard = (room) => {
    const availabilityChecked = roomAvailability.hasOwnProperty(room.id);
    const isAvailable = availabilityChecked ? roomAvailability[room.id] : null;
    const isSelected = formData.roomType === room.id;
    const canSelect = availabilityChecked ? isAvailable : false;
    const nextAvailable = getNextAvailableDate(room.id);

    const handleRoomClick = () => {
      if (!canSelect) return;
      setSelectedRoom(room);
      setShowRoomModal(true);
      setTimeout(() => scrollToRoomCard(room.id), 100);
    };

    const handlePhotosClick = (e) => {
      e.stopPropagation();
      setSelectedRoom(room);
      setShowRoomModal(true);
    };

    return (
      <div 
        key={room.id} 
        ref={(el) => (roomCardRefs.current[room.id] = el)}
        className={`room-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'unavailable' : ''}`}
        onClick={handleRoomClick}
      >
        <div className="room-info">
          <h5>{room.name}</h5>
          <p>{room.description}</p>
          <span className="room-price">${room.price}/noche</span>
          <button
            type="button"
            className="photos-button"
            aria-label={`Ver fotos de ${room.name}`}
            onClick={handlePhotosClick}
          >
            <FaCamera className="photos-button-icon" />
            <span className="photos-button-label">Fotos</span>
          </button>
          {!availabilityChecked ? (
            <span className="pending-badge">Selecciona fechas para verificar</span>
          ) : !isAvailable ? (
            <div className="unavailable-info">
              <span className="unavailable-badge">No disponible</span>
              {nextAvailable && <span className="next-available">Disponible: {nextAvailable}</span>}
            </div>
          ) : (
            <span className="available-badge">Disponible</span>
          )}
        </div>
      </div>
    );
  };

  const nights = calculateNights();
  const total = calculateTotal();
  const maxGuests = getMaxGuests();

  return (
    <div className="room-reservation">
      <div className="room-header">
        <h2>Reserva de Habitación</h2>
        <p className="room-subtitle">Encuentra tu habitación perfecta para una estancia inolvidable</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        {renderFormSection(
          'Fechas de Estancia',
          'Selecciona las fechas de tu estancia',
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkIn"><i className="fas fa-calendar-plus"></i>Fecha de Entrada *</label>
                <input type="date" id="checkIn" name="checkIn" value={formData.checkIn} onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkOut"><i className="fas fa-calendar-minus"></i>Fecha de Salida *</label>
                <input type="date" id="checkOut" name="checkOut" value={formData.checkOut} onChange={handleInputChange}
                  min={formData.checkIn || new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            {nights > 0 && (
              <div className="nights-badge">
                <i className="fas fa-moon"></i>
                <span>Noches: {nights}</span>
              </div>
            )}
          </>
        )}

        {renderFormSection(
          'Habitación y Huéspedes',
          'Elige tu habitación ideal y número de huéspedes',
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="guests"><i className="fas fa-users"></i>Número de Huéspedes</label>
                <select id="guests" name="guests" value={formData.guests} onChange={handleInputChange}>
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                  ))}
                </select>
                {formData.roomType && (
                  <div className="guests-hint">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      {Math.max(0, maxGuests - Number(formData.guests)) > 0
                        ? `Puedes agregar hasta ${Math.max(0, maxGuests - Number(formData.guests))} personas más`
                        : 'Capacidad máxima alcanzada'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="room-selection">
              <h4>Selecciona tu Habitación *</h4>
              {loadingAvailability && (
                <div className="loading-card">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Verificando disponibilidad...</span>
                </div>
              )}
              
              {areAllRoomsUnavailable() && !loadingAvailability && (
                <div className="all-rooms-unavailable">
                  <div className="unavailable-icon"><i className="fas fa-bed"></i></div>
                  <h5>Todas las habitaciones están ocupadas</h5>
                  <p>No hay habitaciones disponibles para las fechas seleccionadas.</p>
                  <div className="availability-info">
                    <h6><i className="fas fa-calendar-check"></i>Próximas fechas disponibles:</h6>
                    <ul>
                      {roomTypes.map(room => {
                        const nextAvailable = getNextAvailableDate(room.id);
                        return nextAvailable ? (
                          <li key={room.id}><strong>{room.name}:</strong> Disponible a partir del {nextAvailable}</li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="room-options">
                {roomTypes.map(renderRoomCard)}
              </div>
            </div>
          </>
        )}

        {renderFormSection(
          'Información de Contacto',
          'Datos necesarios para tu reserva',
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name"><i className="fas fa-user"></i>Nombre Completo *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="Tu nombre completo" required />
              </div>
              <div className="form-group">
                <label htmlFor="email"><i className="fas fa-envelope"></i>Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="tu@email.com" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone"><i className="fas fa-phone"></i>Teléfono</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange}
                placeholder="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label htmlFor="specialRequests"><i className="fas fa-comment-dots"></i>Solicitudes Especiales</label>
              <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests}
                onChange={handleInputChange} rows="3"
                placeholder="Cama extra, vista al mar, piso alto..." />
            </div>
          </>
        )}

        {total > 0 && (
          <div className="total-section">
            <div className="section-header">
              <h3>Resumen de Reserva</h3>
              <p className="section-description">Revisa los detalles de tu reserva</p>
            </div>
            <div className="total-breakdown">
              {[
                { icon: 'bed', label: 'Habitación', value: roomTypes.find(r => r.id === formData.roomType)?.name },
                { icon: 'moon', label: 'Noches', value: nights },
                { icon: 'users', label: 'Huéspedes', value: formData.guests },
                { icon: 'dollar-sign', label: 'Total', value: `$${total}`, isTotal: true }
              ].map((item, index) => (
                <div key={index} className={`breakdown-item ${item.isTotal ? 'total-price' : ''}`}>
                  <i className={`fas fa-${item.icon}`}></i>
                  <span>{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="submit-section">
          <button type="submit" className="submit-button">
            <i className="fas fa-check-circle"></i>
            Confirmar Reserva
          </button>
        </div>
      </form>

      {showConfirmation && (
        <div id="room-confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmar Reserva</h3>
            <div className="confirmation-details">
              {[
                { label: 'Habitación', value: roomTypes.find(r => r.id === formData.roomType)?.name },
                { label: 'Fechas', value: `${formData.checkIn} - ${formData.checkOut}` },
                { label: 'Huéspedes', value: formData.guests },
                { label: 'Total', value: `$${total}` },
                { label: 'Nombre', value: formData.name },
                { label: 'Email', value: formData.email }
              ].map((item, index) => (
                <p key={index}><strong>{item.label}:</strong> {item.value}</p>
              ))}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowConfirmation(false)} className="cancel-button">Cancelar</button>
              <button onClick={confirmReservation} className="confirm-button">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <RoomModal
        isOpen={showRoomModal}
        onClose={handleRoomModalClose}
        room={selectedRoom}
        onConfirmReservation={handleRoomModalConfirm}
        formData={formData}
        calculateTotal={calculateTotal}
        calculateNights={calculateNights}
      />

      <CustomAlert {...alertState} onClose={hideAlert} />
    </div>
  );
};

export default RoomReservation;