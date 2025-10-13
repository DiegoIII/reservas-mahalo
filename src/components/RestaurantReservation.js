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
        <p className="restaurant-subtitle">Disfruta de una experiencia gastronómica única</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <div className="section-header">
            <h3>Fecha y Hora</h3>
            <p className="section-description">Selecciona cuándo quieres disfrutar tu experiencia</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                <i className="fas fa-calendar-alt"></i>
                Fecha *
              </label>
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
              <label htmlFor="time">
                <i className="fas fa-clock"></i>
                Hora *
              </label>
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
          <div className="section-header">
            <h3>Número de Invitados</h3>
            <p className="section-description">¿Cuántas personas asistirán?</p>
          </div>
          <div className="form-group">
            <label htmlFor="partySize">
              <i className="fas fa-users"></i>
              Personas
            </label>
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
          <div className="section-header">
            <h3>Área de Reserva</h3>
            <p className="section-description">Elige el ambiente perfecto para tu experiencia</p>
          </div>
          <div className="table-selection">
            <div className="table-options">
              {reservationAreas.map(area => (
                <div
                  key={area.id}
                  className={`table-option ${formData.locationArea === area.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, locationArea: area.id }))}
                >
                  <div className="area-icon">
                    {area.id === 'salon-eventos' && <i className="fas fa-landmark"></i>}
                    {area.id === 'area-restauran' && <i className="fas fa-utensils"></i>}
                    {area.id === 'area-alberca' && <i className="fas fa-swimming-pool"></i>}
                  </div>
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
          <div className="section-header">
            <h3>Tipo de Mesa</h3>
            <p className="section-description">Elige la mesa que mejor se adapte a tu grupo</p>
          </div>
          <div className="table-selection">
            {getAvailableTables().length === 0 ? (
              <div className="no-tables-available">
                <div className="no-tables-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>No hay mesas disponibles</h5>
                <p>
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
                    <div className="table-icon">
                      {table.id === 'standard' && <i className="fas fa-chair"></i>}
                      {table.id === 'window' && <i className="fas fa-eye"></i>}
                      {table.id === 'booth' && <i className="fas fa-users"></i>}
                      {table.id === 'terrace' && <i className="fas fa-leaf"></i>}
                    </div>
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
          <div className="section-header">
            <h3>Información de Contacto</h3>
            <p className="section-description">Datos necesarios para tu reserva</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Nombre Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
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
          <div className="form-group">
            <label htmlFor="phone">
              <i className="fas fa-phone"></i>
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
          <div className="form-group">
            <label htmlFor="specialRequests">
              <i className="fas fa-comment-dots"></i>
              Solicitudes Especiales
            </label>
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
          <div className="section-header">
            <h3>Resumen de Reserva</h3>
            <p className="section-description">Revisa los detalles de tu reserva</p>
          </div>
          <div className="reservation-summary">
            <div className="summary-item">
              <i className="fas fa-calendar-alt"></i>
              <span><strong>Fecha:</strong> {formData.date || 'No seleccionada'}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-clock"></i>
              <span><strong>Hora:</strong> {formData.time || 'No seleccionada'}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-users"></i>
              <span><strong>Invitados:</strong> {formData.partySize}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-map-marker-alt"></i>
              <span><strong>Área:</strong> {reservationAreas.find(a => a.id === formData.locationArea)?.name || 'No seleccionada'}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-chair"></i>
              <span><strong>Mesa:</strong> {tableTypes.find(t => t.id === formData.tableType)?.name || 'No seleccionada'}</span>
            </div>
          </div>
        </div>

        <div className="submit-section">
          <button type="submit" className="submit-button">
            <i className="fas fa-utensils"></i>
            Confirmar Reserva
          </button>
        </div>
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
