import React, { useEffect, useState } from 'react';
import './RoomReservation.css';

const RoomReservation = ({ user }) => {
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

  const roomTypes = [
    { id: 'standard', name: 'Habitación Estándar', price: 80, description: 'Cama doble, baño privado, TV' },
    { id: 'deluxe', name: 'Habitación Deluxe', price: 120, description: 'Cama king, baño privado, TV, minibar' },
    { id: 'suite', name: 'Suite', price: 200, description: 'Dormitorio separado, sala de estar, baño jacuzzi' },
    { id: 'presidential', name: 'Suite Presidencial', price: 350, description: 'Suite de lujo con vista panorámica' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  };

  const confirmReservation = () => {
    alert('¡Reserva confirmada! Te enviaremos un email de confirmación.');
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
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="room-selection">
            <h4>Selecciona tu Habitación *</h4>
            <div className="room-options">
              {roomTypes.map(room => (
                <div 
                  key={room.id} 
                  className={`room-option ${formData.roomType === room.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, roomType: room.id }))}
                >
                  <div className="room-info">
                    <h5>{room.name}</h5>
                    <p>{room.description}</p>
                    <span className="room-price">${room.price}/noche</span>
                  </div>
                </div>
              ))}
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
        <div className="confirmation-modal">
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
    </div>
  );
};

export default RoomReservation;
