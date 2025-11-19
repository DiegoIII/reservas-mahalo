import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaCamera, FaBed, FaCalendarAlt, FaUsers, FaUser, FaEnvelope, FaPhone, FaComment, FaDollarSign, FaMoon, FaCheckCircle, FaInfoCircle, FaSpinner, FaIdCard, FaTag } from 'react-icons/fa';
import './RoomReservation.css';
import CustomAlert from '../../components/CustomAlert';
import RoomModal from './RoomModal';
import useAlert from '../../hooks/useAlert';

const RoomReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    checkIn: '', checkOut: '', guests: 1, roomType: '',
    name: '', email: '', phone: '', specialRequests: '', memberNumber: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isMember, setIsMember] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('dates');
  const { alertState, hideAlert, showError, showSuccess } = useAlert();
  const roomCardRefs = useRef({});
  const sectionRefs = useRef({});

  const roomTypes = [
    { 
      id: 'room1', 
      name: 'Habitación Vista Premium', 
      price: 120, 
      description: 'Amplia suite con vista panorámica al mar', 
      features: ['Vista al mar', 'Balcón privado', 'Cama king size', 'Baño de lujo'],
      capacity: 6, 
      hasView: true, 
      roomNumber: 1 
    },
    { 
      id: 'room2', 
      name: 'Habitación Vista Deluxe', 
      price: 100, 
      description: 'Confortable habitación con vista parcial al mar', 
      features: ['Vista parcial al mar', 'Balcón', '2 camas queen'],
      capacity: 5, 
      hasView: true, 
      roomNumber: 2 
    },
    { 
      id: 'room3', 
      name: 'Habitación Standard', 
      price: 80, 
      description: 'Acogedora habitación perfecta para familias', 
      features: ['2 camas full', 'Ventana jardín', 'Baño completo'],
      capacity: 4, 
      hasView: false, 
      roomNumber: 3 
    },
    { 
      id: 'room4', 
      name: 'Habitación Económica', 
      price: 80, 
      description: 'Ideal para estadías cortas', 
      features: ['2 camas twin', 'Ventana interior', 'Baño compartido'],
      capacity: 4, 
      hasView: false, 
      roomNumber: 4 
    },
    { 
      id: 'room5', 
      name: 'Habitación Individual', 
      price: 60, 
      description: 'Perfecta para viajeros solos', 
      features: ['Cama full', 'Escritorio', 'WiFi rápido'],
      capacity: 2, 
      hasView: false, 
      roomNumber: 5 
    }
  ];

  const roomCapacityRules = {
    room1: 6,
    room2: 5,
    default: 4
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para número de socio: solo números, máximo 10 caracteres
    if (name === 'memberNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remover todo lo que no sea número
      const limitedValue = numericValue.slice(0, 10); // Limitar a 10 caracteres
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      block: 'center'
    });
  };

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    setActiveSection(sectionId);
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
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    const nights = calculateNights();
    let subtotal = selectedRoom ? selectedRoom.price * nights : 0;
    
    // Aplicar descuento de socio (10%)
    if (isMember && subtotal > 0) {
      const discount = subtotal * 0.10;
      subtotal = subtotal - discount;
    }
    
    return subtotal;
  };

  const calculateDiscount = () => {
    if (!isMember) return 0;
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    const nights = calculateNights();
    const baseTotal = selectedRoom ? selectedRoom.price * nights : 0;
    return baseTotal * 0.10;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['checkIn', 'checkOut', 'roomType', 'name', 'email'];
    const isValid = requiredFields.every(field => formData[field]);
    
    if (isValid) {
      setShowConfirmation(true);
    } else {
      showError('Por favor completa todos los campos obligatorios', 'Campos requeridos');
      // Scroll to first missing field
      if (!formData.checkIn || !formData.checkOut) scrollToSection('dates');
      else if (!formData.roomType) scrollToSection('rooms');
      else scrollToSection('contact');
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
      setTimeout(() => scrollToSection('contact'), 300);
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
        special_requests: formData.specialRequests || null,
        member_number: formData.memberNumber || null,
        is_member: isMember
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

  const ProgressSteps = () => (
    <div className="progress-steps">
      <div className="steps-container">
        {[
          { id: 'dates', label: 'Fechas', icon: FaCalendarAlt },
          { id: 'rooms', label: 'Habitación', icon: FaBed },
          { id: 'contact', label: 'Contacto', icon: FaUser }
        ].map((step, index) => (
          <div key={step.id} className={`step ${activeSection === step.id ? 'active' : ''}`}>
            <div className="step-icon">
              <step.icon />
            </div>
            <span className="step-label">{step.label}</span>
            {index < 2 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormSection = (title, description, children, sectionId) => (
    <div 
      id={sectionId}
      ref={(el) => (sectionRefs.current[sectionId] = el)}
      className="form-section"
    >
      <div className="section-header">
        <h3>{title}</h3>
        <p className="section-description">{description}</p>
      </div>
      <div className="section-content">
        {children}
      </div>
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
        className={`room-card ${isSelected ? 'selected' : ''} ${!canSelect ? 'unavailable' : ''}`}
        onClick={handleRoomClick}
      >
        <div className="room-card-header">
          <div className="room-title">
            <h4>{room.name}</h4>
            <span className="room-number">#{room.roomNumber}</span>
          </div>
          <div className="room-price">
            <span className="price-amount">${room.price}</span>
            <span className="price-period">/noche</span>
          </div>
        </div>

        <div className="room-description">
          <p>{room.description}</p>
        </div>

        <div className="room-features">
          {room.features.map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>

        <div className="room-capacity">
          <FaUsers className="capacity-icon" />
          <span>Máx. {room.capacity} personas</span>
        </div>

        <div className="room-card-actions">
          <button
            type="button"
            className="photos-button"
            onClick={handlePhotosClick}
          >
            <FaCamera />
            Ver Fotos
          </button>

          <div className="availability-status">
            {!availabilityChecked ? (
              <span className="status-pending">Verificar disponibilidad</span>
            ) : !isAvailable ? (
              <div className="status-unavailable">
                <span>No disponible</span>
                {nextAvailable && (
                  <span className="next-available">Disponible: {nextAvailable}</span>
                )}
              </div>
            ) : (
              <span className="status-available">Disponible</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const nights = calculateNights();
  const total = calculateTotal();
  const maxGuests = getMaxGuests();

  return (
    <div className="room-reservation">
      <div className="reservation-container">
        <div className="reservation-header">
          <div className="header-content">
            <h1>Reserva tu Habitación</h1>
            <p className="reservation-subtitle">
              Encuentra el espacio perfecto para tu estancia en Mahalo Beach Club
            </p>
          </div>
          <button
            type="button"
            className={`member-toggle-button ${isMember ? 'active' : ''}`}
            onClick={() => setIsMember(!isMember)}
          >
            <FaTag className="member-icon" />
            {isMember ? 'Modo Socio Activo' : 'Cambiar a Modo Socio'}
          </button>
        </div>

        <ProgressSteps />

        <div className="reservation-content">
          <form onSubmit={handleSubmit} className="reservation-form">
            {renderFormSection(
              'Fechas de Estancia',
              'Selecciona las fechas de tu llegada y salida',
              <>
                <div className="date-inputs">
                  <div className="input-group">
                    <label htmlFor="checkIn">
                      <FaCalendarAlt className="input-icon" />
                      Fecha de Entrada *
                    </label>
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
                  <div className="input-group">
                    <label htmlFor="checkOut">
                      <FaCalendarAlt className="input-icon" />
                      Fecha de Salida *
                    </label>
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
                
                {nights > 0 && (
                  <div className="stay-summary">
                    <div className="nights-count">
                      <FaMoon className="summary-icon" />
                      <span>{nights} {nights === 1 ? 'noche' : 'noches'}</span>
                    </div>
                    {formData.checkIn && formData.checkOut && (
                      <div className="date-range">
                        {new Date(formData.checkIn).toLocaleDateString()} - {new Date(formData.checkOut).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </>,
              'dates'
            )}

            {renderFormSection(
              'Selección de Habitación',
              'Elige la habitación que mejor se adapte a tus necesidades',
              <>
                <div className="guests-selection">
                  <div className="input-group">
                    <label htmlFor="guests">
                      <FaUsers className="input-icon" />
                      Número de Huéspedes
                    </label>
                    <select 
                      id="guests" 
                      name="guests" 
                      value={formData.guests} 
                      onChange={handleInputChange}
                    >
                      {Array.from({ length: maxGuests }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'huésped' : 'huéspedes'}
                        </option>
                      ))}
                    </select>
                    {formData.roomType && (
                      <div className="capacity-info">
                        <FaInfoCircle className="info-icon" />
                        <span>
                          Capacidad: {formData.guests}/{maxGuests} huéspedes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rooms-selection">
                  <h4>Habitaciones Disponibles</h4>
                  
                  {loadingAvailability && (
                    <div className="loading-state">
                      <FaSpinner className="spinner" />
                      <span>Verificando disponibilidad...</span>
                    </div>
                  )}
                  
                  {areAllRoomsUnavailable() && !loadingAvailability && (
                    <div className="unavailable-state">
                      <div className="unavailable-icon">
                        <FaBed />
                      </div>
                      <h5>No hay disponibilidad</h5>
                      <p>Todas las habitaciones están ocupadas para las fechas seleccionadas.</p>
                      <div className="suggestions">
                        <h6>Próximas fechas disponibles:</h6>
                        <ul>
                          {roomTypes.map(room => {
                            const nextAvailable = getNextAvailableDate(room.id);
                            return nextAvailable ? (
                              <li key={room.id}>
                                <strong>{room.name}:</strong> {nextAvailable}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="rooms-grid">
                    {roomTypes.map(renderRoomCard)}
                  </div>
                </div>
              </>,
              'rooms'
            )}

            {renderFormSection(
              'Información de Contacto',
              'Completa tus datos para finalizar la reserva',
              <>
                <div className="contact-inputs">
                  <div className="input-row">
                    <div className="input-group">
                      <label htmlFor="name">
                        <FaUser className="input-icon" />
                        Nombre Completo *
                      </label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        placeholder="Ingresa tu nombre completo" 
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="email">
                        <FaEnvelope className="input-icon" />
                        Email *
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        placeholder="tu@email.com" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="phone">
                      <FaPhone className="input-icon" />
                      Teléfono
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567" 
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="specialRequests">
                      <FaComment className="input-icon" />
                      Solicitudes Especiales
                    </label>
                    <textarea 
                      id="specialRequests" 
                      name="specialRequests" 
                      value={formData.specialRequests}
                      onChange={handleInputChange} 
                      rows="4"
                      placeholder="Cama extra, alergias, celebración especial, etc..." 
                    />
                  </div>
                  {isMember && (
                    <div className="input-group">
                      <label htmlFor="memberNumber">
                        <FaIdCard className="input-icon" />
                        Número de Socio
                      </label>
                      <input 
                        type="text" 
                        id="memberNumber" 
                        name="memberNumber" 
                        value={formData.memberNumber}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu número de socio (máx. 10 dígitos)" 
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  )}
                </div>

                {/* Desglose de Precios movido aquí, debajo de Información de Contacto */}
                {total > 0 && (
                  <div className="pricing-section">
                    <h4 className="pricing-title">Desglose de Precios</h4>
                    <div className="pricing-breakdown">
                      <div className="pricing-row">
                        <span>Habitación</span>
                        <span>
                          {roomTypes.find(r => r.id === formData.roomType)?.name}
                        </span>
                      </div>
                      <div className="pricing-row">
                        <span>Precio por noche</span>
                        <span>${roomTypes.find(r => r.id === formData.roomType)?.price || 0}</span>
                      </div>
                      <div className="pricing-row">
                        <span>Número de noches</span>
                        <span>{nights}</span>
                      </div>
                      {isMember && calculateDiscount() > 0 && (
                        <div className="pricing-row discount">
                          <span>Descuento Socio (10%)</span>
                          <span>-${calculateDiscount().toLocaleString('es-MX')}</span>
                        </div>
                      )}
                      <div className="pricing-total">
                        <span>Total estimado</span>
                        <span>${total.toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>,
              'contact'
            )}

            <div className="form-actions">
              <button type="submit" className="submit-button">
                <FaCheckCircle className="button-icon" />
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-content">
              <div className="reservation-details">
                <h4>Detalles de tu reserva:</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Habitación:</strong>
                    <span>{roomTypes.find(r => r.id === formData.roomType)?.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Fechas:</strong>
                    <span>{formData.checkIn} - {formData.checkOut}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Huéspedes:</strong>
                    <span>{formData.guests} personas</span>
                  </div>
                  <div className="detail-item">
                    <strong>Noches:</strong>
                    <span>{nights} noche{nights !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="price-breakdown">
                  <h4>Desglose de Precios:</h4>
                  <div className="price-details">
                    <div className="price-item">
                      <span className="price-label">{roomTypes.find(r => r.id === formData.roomType)?.name}</span>
                      <span className="price-value">${roomTypes.find(r => r.id === formData.roomType)?.price || 0} × {nights} noche{nights !== 1 ? 's' : ''}</span>
                    </div>
                    {isMember && calculateDiscount() > 0 && (
                      <div className="price-item discount">
                        <span className="price-label">Descuento Socio (10%)</span>
                        <span className="price-value">-${calculateDiscount().toLocaleString('es-MX')}</span>
                      </div>
                    )}
                    <div className="price-item total">
                      <span className="price-label">Total:</span>
                      <span className="price-value total-amount">${total.toLocaleString('es-MX')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="reservation-details">
                  <h4>Información de Contacto:</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Nombre:</strong>
                      <span>{formData.name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{formData.email}</span>
                    </div>
                  </div>
                </div>

                <div className="reservation-summary-actions">
                  <button 
                    onClick={() => setShowConfirmation(false)} 
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmReservation} 
                    className="confirm-button"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </div>
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