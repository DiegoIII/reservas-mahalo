import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import './RoomReservation.css';
import CustomAlert from './CustomAlert';
import RoomModal from './RoomModal';
import useAlert from '../hooks/useAlert';

const RoomReservation = ({ user, apiUrl }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate max guests depending on selected room and rule
  const getMaxGuests = () => {
    const selectedRoom = roomTypes.find(r => r.id === formData.roomType);
    // Base rule: max 4, but room1 up to 6, room2 up to 5
    let ruleCap = 4;
    if (formData.roomType === 'room1') ruleCap = 6;
    else if (formData.roomType === 'room2') ruleCap = 5;

    // Respect each room's inherent capacity as a hard ceiling
    if (selectedRoom) {
      return Math.min(ruleCap, selectedRoom.capacity);
    }
    return 4;
  };

  // Clamp guests when room or rule changes
  useEffect(() => {
    const maxGuests = getMaxGuests();
    if (Number(formData.guests) > maxGuests) {
      setFormData(prev => ({ ...prev, guests: maxGuests }));
    }
  }, [formData.roomType, formData.guests, getMaxGuests]);

  // Check if all rooms are unavailable
  const areAllRoomsUnavailable = () => {
    // Only show message if we have availability data and all rooms are explicitly false
    if (!roomAvailability || Object.keys(roomAvailability).length === 0) {
      return false;
    }
    return Object.values(roomAvailability).every(available => available === false);
  };

  // Get next available date for a specific room
  const getNextAvailableDate = (roomId) => {
    if (availabilityInfo && availabilityInfo[roomId]) {
      return availabilityInfo[roomId].nextAvailable;
    }
    return null;
  };

  // Function to scroll to and center the selected room card
  const scrollToRoomCard = (roomId) => {
    const roomCard = roomCardRefs.current[roomId];
    if (roomCard) {
      roomCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  };

  // Check room availability
  const checkRoomAvailability = useCallback(async (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return;
    
    setLoadingAvailability(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/room-availability?check_in=${checkIn}&check_out=${checkOut}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old and new API response formats
        if (data.availability) {
          setRoomAvailability(data.availability);
          setAvailabilityInfo(data.info || null);
        } else {
          // Old format - direct availability object
          setRoomAvailability(data);
          setAvailabilityInfo(null);
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  }, [apiUrl]);

  // Autofill from user profile
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

  // Check availability when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      checkRoomAvailability(formData.checkIn, formData.checkOut);
    }
  }, [formData.checkIn, formData.checkOut, checkRoomAvailability]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (selectedRoom) {
      return selectedRoom.price * calculateNights();
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.checkIn && formData.checkOut && formData.roomType && formData.name && formData.email) {
      setShowConfirmation(true);
      // Scroll to confirmation modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        const confirmationModal = document.getElementById('room-confirmation-modal');
        if (confirmationModal) {
          confirmationModal.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
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
      // Scroll to the form after selecting room
      setTimeout(() => {
        const form = document.querySelector('.reservation-form');
        if (form) {
          form.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const confirmReservation = async () => {
    try {
      const payload = {
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        guests: Number(formData.guests),
        room_type: formData.roomType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        special_requests: formData.specialRequests || null
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
      setFormData({
        checkIn: '',
        checkOut: '',
        guests: 1,
        roomType: '',
        name: '',
        email: '',
        phone: '',
        specialRequests: ''
      });
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  return (
    <div className="room-reservation">
      <h2>Reserva de Habitación</h2>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <h3>Fechas de Estancia</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="checkIn">Fecha de Entrada *</label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkOut">Fecha de Salida *</label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          {calculateNights() > 0 && (
            <p className="nights-info">Noches: {calculateNights()}</p>
          )}
        </div>

        <div className="form-section">
          <h3>Habitación y Huéspedes</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guests">Número de Huéspedes</label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
              >
                {Array.from({ length: getMaxGuests() }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
              {formData.roomType && (
                <span className="guests-hint">
                  {Math.max(0, getMaxGuests() - Number(formData.guests)) > 0
                    ? `Puedes agregar hasta ${Math.max(0, getMaxGuests() - Number(formData.guests))} personas más`
                    : 'Capacidad máxima alcanzada'}
                </span>
              )}
            </div>
          </div>
          
          <div className="room-selection">
            <h4>Selecciona tu Habitación *</h4>
            {loadingAvailability && (
              <p className="loading-text">Verificando disponibilidad...</p>
            )}
            
            {areAllRoomsUnavailable() && !loadingAvailability && (
              <div className="all-rooms-unavailable">
                <div className="unavailable-icon">🏨</div>
                <h5>Todas las habitaciones están ocupadas</h5>
                <p>No hay habitaciones disponibles para las fechas seleccionadas.</p>
                <div className="availability-info">
                  <h6>Próximas fechas disponibles:</h6>
                  <ul>
                    {roomTypes.map(room => {
                      const nextAvailable = getNextAvailableDate(room.id);
                      return nextAvailable ? (
                        <li key={room.id}>
                          <strong>{room.name}:</strong> Disponible a partir del {nextAvailable}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="room-options">
              {roomTypes.map(room => {
                // Check if availability has been checked for this room
                const availabilityChecked = roomAvailability.hasOwnProperty(room.id);
                const isAvailable = availabilityChecked ? roomAvailability[room.id] : null;
                const isSelected = formData.roomType === room.id;
                const nextAvailable = getNextAvailableDate(room.id);
                
                // Determine if room can be selected
                const canSelect = availabilityChecked ? isAvailable : false;
                
                return (
                  <div 
                    key={room.id} 
                    ref={(el) => (roomCardRefs.current[room.id] = el)}
                    className={`room-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'unavailable' : ''}`}
                    onClick={() => {
                      if (!canSelect) return;
                      setSelectedRoom(room);
                      setShowRoomModal(true);
                      // Scroll to center the selected room card
                      setTimeout(() => {
                        scrollToRoomCard(room.id);
                      }, 100);
                    }}
                  >
                    <div className="room-info">
                      <h5>{room.name}</h5>
                      <p>{room.description}</p>
                      <span className="room-price">${room.price}/noche</span>
                      <button
                        type="button"
                        className="photos-button"
                        aria-label={`Ver fotos de ${room.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          setShowRoomModal(true);
                        }}
                      >
                        <FaCamera className="photos-button-icon" />
                        <span className="photos-button-label">Fotos</span>
                      </button>
                      {!availabilityChecked ? (
                        <span className="pending-badge">Selecciona fechas para verificar</span>
                      ) : !isAvailable ? (
                        <div className="unavailable-info">
                          <span className="unavailable-badge">No disponible</span>
                          {nextAvailable && (
                            <span className="next-available">Disponible: {nextAvailable}</span>
                          )}
                        </div>
                      ) : (
                        <span className="available-badge">Disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Información de Contacto</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="specialRequests">Solicitudes Especiales</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="3"
              placeholder="Cama extra, vista al mar, piso alto..."
            />
          </div>
        </div>

        {calculateTotal() > 0 && (
          <div className="total-section">
            <h3>Resumen de Reserva</h3>
            <div className="total-breakdown">
              <p>Habitación: {roomTypes.find(r => r.id === formData.roomType)?.name}</p>
              <p>Noches: {calculateNights()}</p>
              <p>Huéspedes: {formData.guests}</p>
              <p className="total-price">Total: ${calculateTotal()}</p>
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          Confirmar Reserva
        </button>
      </form>

      {showConfirmation && (
        <div id="room-confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmar Reserva</h3>
            <div className="confirmation-details">
              <p><strong>Habitación:</strong> {roomTypes.find(r => r.id === formData.roomType)?.name}</p>
              <p><strong>Fechas:</strong> {formData.checkIn} - {formData.checkOut}</p>
              <p><strong>Huéspedes:</strong> {formData.guests}</p>
              <p><strong>Total:</strong> ${calculateTotal()}</p>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowConfirmation(false)} className="cancel-button">
                Cancelar
              </button>
              <button onClick={confirmReservation} className="confirm-button">
                Confirmar
              </button>
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

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        autoClose={alertState.autoClose}
        autoCloseDelay={alertState.autoCloseDelay}
      />
    </div>
  );
};

export default RoomReservation;
