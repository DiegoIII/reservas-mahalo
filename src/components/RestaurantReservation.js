import React, { useState } from 'react';
import './RestaurantReservation.css';

const RestaurantReservation = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    tableType: '',
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  const tableTypes = [
    { id: 'standard', name: 'Mesa Estándar', capacity: '2-4 personas', description: 'Mesa interior cómoda' },
    { id: 'window', name: 'Mesa con Vista', capacity: '2-4 personas', description: 'Vista panorámica, ideal para ocasiones especiales' },
    { id: 'booth', name: 'Mesa Privada', capacity: '4-6 personas', description: 'Área privada, perfecta para grupos' },
    { id: 'terrace', name: 'Terraza', capacity: '2-6 personas', description: 'Mesa al aire libre con vista al jardín' }
  ];

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.time && formData.tableType && formData.name && formData.email) {
      setShowConfirmation(true);
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  };

  const confirmReservation = () => {
    alert('¡Reserva confirmada! Te enviaremos un email de confirmación.');
    setShowConfirmation(false);
    setFormData({
      date: '',
      time: '',
      partySize: 2,
      tableType: '',
      name: '',
      email: '',
      phone: '',
      specialRequests: ''
    });
  };

  const getAvailableTables = () => {
    return tableTypes.filter(table => {
      const capacity = parseInt(table.capacity.split('-')[1]);
      return capacity >= formData.partySize;
    });
  };

  return (
    <div className="restaurant-reservation">
      <h2>Reserva de Mesa</h2>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <h3>Fecha y Hora</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Hora</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una hora</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Número de Comensales</h3>
          <div className="form-group">
            <label htmlFor="partySize">Personas</label>
            <select
              id="partySize"
              name="partySize"
              value={formData.partySize}
              onChange={handleInputChange}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Tipo de Mesa</h3>
          <div className="table-selection">
            <h4>Selecciona tu Mesa</h4>
            <div className="table-options">
              {getAvailableTables().map(table => (
                <div 
                  key={table.id} 
                  className={`table-option ${formData.tableType === table.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tableType: table.id }))}
                >
                  <div className="table-info">
                    <h5>{table.name}</h5>
                    <p>{table.description}</p>
                    <span className="table-capacity">{table.capacity}</span>
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
              <label htmlFor="name">Nombre Completo </label>
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
              <label htmlFor="email">Email </label>
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
              placeholder="Celebración especial, alergias alimentarias, mesa cerca de la ventana..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Resumen de Reserva</h3>
          <div className="reservation-summary">
            <p><strong>Fecha:</strong> {formData.date || 'No seleccionada'}</p>
            <p><strong>Hora:</strong> {formData.time || 'No seleccionada'}</p>
            <p><strong>Comensales:</strong> {formData.partySize}</p>
            <p><strong>Mesa:</strong> {tableTypes.find(t => t.id === formData.tableType)?.name || 'No seleccionada'}</p>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Confirmar Reserva
        </button>
      </form>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmar Reserva de Mesa</h3>
            <div className="confirmation-details">
              <p><strong>Mesa:</strong> {tableTypes.find(t => t.id === formData.tableType)?.name}</p>
              <p><strong>Fecha:</strong> {formData.date}</p>
              <p><strong>Hora:</strong> {formData.time}</p>
              <p><strong>Comensales:</strong> {formData.partySize}</p>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              {formData.specialRequests && (
                <p><strong>Solicitudes:</strong> {formData.specialRequests}</p>
              )}
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

export default RestaurantReservation;
