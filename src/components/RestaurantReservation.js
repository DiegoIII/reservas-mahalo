import React, { useEffect, useState } from 'react';
import './RestaurantReservation.css';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';

const RestaurantReservation = ({ user, apiUrl }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    tableType: '',
    locationArea: '',
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  const reservationAreas = [
    { id: 'salon-eventos', name: 'Salon de eventos', description: 'Espacio amplio para celebraciones y ceremonias' },
    { id: 'area-restauran', name: 'Área de restaurant', description: 'Zona gastronómica con ambiente acogedor' },
    { id: 'area-alberca', name: 'Área de alberca', description: 'Área al aire libre junto a la alberca' }
  ];

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

  // Handle party size changes - validate table selection
  useEffect(() => {
    if (formData.tableType && formData.partySize) {
      const availableTables = getAvailableTables();
      const isCurrentTableAvailable = availableTables.some(table => table.id === formData.tableType);
      
      if (!isCurrentTableAvailable) {
        // Clear table selection if current table is no longer available
        setFormData(prev => ({
          ...prev,
          tableType: ''
        }));
      }
    }
  }, [formData.partySize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.time && formData.tableType && formData.locationArea && formData.name && formData.email) {
      setShowConfirmation(true);
      // Scroll to confirmation modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        const confirmationModal = document.getElementById('restaurant-confirmation-modal');
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

  const confirmReservation = async () => {
    try {
      const payload = {
        date: formData.date,
        time: formData.time,
        party_size: Number(formData.partySize),
        table_type: formData.tableType,
        location_area: formData.locationArea,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        special_requests: formData.specialRequests || null
      };
      const resp = await fetch(`${apiUrl}/api/admin/restaurant`, {
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
        date: '',
        time: '',
        partySize: 2,
        tableType: '',
        locationArea: '',
        name: '',
        email: '',
        phone: '',
        specialRequests: ''
      });
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  const getAvailableTables = () => {
    return tableTypes.filter(table => {
      try {
        const capacityRange = table.capacity.split('-');
        if (capacityRange.length >= 2) {
          const maxCapacity = parseInt(capacityRange[1]);
          return maxCapacity >= formData.partySize;
        }
        return true; // Si no hay rango válido, mostrar la mesa
      } catch (error) {
        console.warn('Error parsing table capacity:', table.capacity);
        return true; // En caso de error, mostrar la mesa
      }
    });
  };

  return (
    <div className="restaurant-reservation">
      <div className="restaurant-header">
        <h2>Reserva daypass</h2>
      </div>
      
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
          <h3>Número de Invitados</h3>
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
          <h3>Área de Reserva</h3>
          <div className="table-selection">
            <h4>Elige el área</h4>
            <div className="table-options">
              {reservationAreas.map(area => (
                <div
                  key={area.id}
                  className={`table-option ${formData.locationArea === area.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, locationArea: area.id }))}
                >
                  <div className="table-info">
                    <h5>{area.name}</h5>
                    <p>{area.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Tipo de Mesa</h3>
          <div className="table-selection">
            <h4>Selecciona tu Mesa</h4>
            {getAvailableTables().length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#64748b', 
                background: 'rgba(255,255,255,0.5)', 
                borderRadius: '12px', 
                border: '2px dashed #e5e7eb' 
              }}>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>
                  No hay mesas disponibles para {formData.partySize} {formData.partySize === 1 ? 'persona' : 'personas'}. 
                  Por favor, selecciona un número menor de personas.
                </p>
              </div>
            ) : (
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
            )}
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
            <p><strong>Invitados:</strong> {formData.partySize}</p>
            <p><strong>Área:</strong> {reservationAreas.find(a => a.id === formData.locationArea)?.name || 'No seleccionada'}</p>
            <p><strong>Mesa:</strong> {tableTypes.find(t => t.id === formData.tableType)?.name || 'No seleccionada'}</p>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Confirmar Reserva
        </button>
      </form>

      {showConfirmation && (
        <div id="restaurant-confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmar Reserva daypass</h3>
            <div className="confirmation-details">
              <p><strong>Mesa:</strong> {tableTypes.find(t => t.id === formData.tableType)?.name}</p>
              <p><strong>Fecha:</strong> {formData.date}</p>
              <p><strong>Hora:</strong> {formData.time}</p>
              <p><strong>Invitados:</strong> {formData.partySize}</p>
              <p><strong>Área:</strong> {reservationAreas.find(a => a.id === formData.locationArea)?.name}</p>
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

export default RestaurantReservation;
