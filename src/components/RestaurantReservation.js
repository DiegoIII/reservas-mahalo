import React, { useEffect, useState } from 'react';
import './RestaurantReservation.css';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';

const RestaurantReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    date: '', time: '', partySize: 2, tableType: '', locationArea: '',
    name: '', email: '', phone: '', specialRequests: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  const reservationAreas = [
    { id: 'salon-eventos', name: 'Salon de eventos', description: 'Espacio amplio para celebraciones y ceremonias', icon: 'landmark' },
    { id: 'area-restauran', name: 'Área de restaurant', description: 'Zona gastronómica con ambiente acogedor', icon: 'utensils' },
    { id: 'area-alberca', name: 'Área de alberca', description: 'Área al aire libre junto a la alberca', icon: 'swimming-pool' }
  ];

  const tableTypes = [
    { id: 'standard', name: 'Mesa Estándar', capacity: '2-4', description: 'Mesa interior cómoda', icon: 'chair' },
    { id: 'window', name: 'Mesa con Vista', capacity: '2-4', description: 'Vista panorámica, ideal para ocasiones especiales', icon: 'eye' },
    { id: 'booth', name: 'Mesa Privada', capacity: '4-6', description: 'Área privada, perfecta para grupos', icon: 'users' },
    { id: 'terrace', name: 'Terraza', capacity: '2-6', description: 'Mesa al aire libre con vista al jardín', icon: 'leaf' }
  ];

  const timeSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
  const partySizes = Array.from({ length: 10 }, (_, i) => i + 1);

  // Autofill from user profile and validate table selection
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
    if (formData.tableType && formData.partySize) {
      const availableTables = getAvailableTables();
      const isCurrentTableAvailable = availableTables.some(table => table.id === formData.tableType);
      
      if (!isCurrentTableAvailable) {
        setFormData(prev => ({ ...prev, tableType: '' }));
      }
    }
  }, [formData.partySize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['date', 'time', 'tableType', 'locationArea', 'name', 'email'];
    const isValid = requiredFields.every(field => formData[field]);
    
    if (isValid) {
      setShowConfirmation(true);
      setTimeout(() => {
        document.getElementById('restaurant-confirmation-modal')?.scrollIntoView({ 
          behavior: 'smooth', block: 'center' 
        });
      }, 100);
    } else {
      showError('Por favor completa todos los campos obligatorios', 'Campos requeridos');
    }
  };

  const confirmReservation = async () => {
    try {
      const payload = {
        date: formData.date, time: formData.time, party_size: Number(formData.partySize),
        table_type: formData.tableType, location_area: formData.locationArea, name: formData.name,
        email: formData.email, phone: formData.phone || null, special_requests: formData.specialRequests || null
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
      setFormData(initialFormData);
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  const getAvailableTables = () => {
    return tableTypes.filter(table => {
      const [min, max] = table.capacity.split('-').map(Number);
      return max >= formData.partySize;
    });
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

  const renderTableOptions = (items, selectedKey, onSelect, getIcon) => (
    <div className="table-options">
      {items.map(item => (
        <div
          key={item.id}
          className={`table-option ${formData[selectedKey] === item.id ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, [selectedKey]: item.id }))}
        >
          <div className="table-icon">
            <i className={`fas fa-${getIcon(item)}`}></i>
          </div>
          <div className="table-info">
            <h5>{item.name}</h5>
            <p>{item.description}</p>
            {item.capacity && <span className="table-capacity">{item.capacity} personas</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const getAreaIcon = (area) => area.icon;
  const getTableIcon = (table) => table.icon;

  return (
    <div className="restaurant-reservation">
      <div className="restaurant-header">
        <h2>Reserva daypass</h2>
        <p className="restaurant-subtitle">Disfruta de una experiencia gastronómica única</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        {renderFormSection(
          'Fecha y Hora',
          'Selecciona cuándo quieres disfrutar tu experiencia',
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date"><i className="fas fa-calendar-alt"></i>Fecha *</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label htmlFor="time"><i className="fas fa-clock"></i>Hora *</label>
              <select id="time" name="time" value={formData.time} onChange={handleInputChange} required>
                <option value="">Selecciona una hora</option>
                {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
          </div>
        )}

        {renderFormSection(
          'Número de Invitados',
          '¿Cuántas personas asistirán?',
          <div className="form-group">
            <label htmlFor="partySize"><i className="fas fa-users"></i>Personas</label>
            <select id="partySize" name="partySize" value={formData.partySize} onChange={handleInputChange}>
              {partySizes.map(num => <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>)}
            </select>
          </div>
        )}

        {renderFormSection(
          'Área de Reserva',
          'Elige el ambiente perfecto para tu experiencia',
          <div className="table-selection">
            {renderTableOptions(reservationAreas, 'locationArea', setFormData, getAreaIcon)}
          </div>
        )}

        {renderFormSection(
          'Tipo de Mesa',
          'Elige la mesa que mejor se adapte a tu grupo',
          <div className="table-selection">
            {getAvailableTables().length === 0 ? (
              <div className="no-tables-available">
                <div className="no-tables-icon"><i className="fas fa-exclamation-triangle"></i></div>
                <h5>No hay mesas disponibles</h5>
                <p>No hay mesas disponibles para {formData.partySize} {formData.partySize === 1 ? 'persona' : 'personas'}. 
                  Por favor, selecciona un número menor de personas.</p>
              </div>
            ) : (
              renderTableOptions(getAvailableTables(), 'tableType', setFormData, getTableIcon)
            )}
          </div>
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
                placeholder="Celebración especial, alergias alimentarias, mesa cerca de la ventana..." />
            </div>
          </>
        )}

        {renderFormSection(
          'Resumen de Reserva',
          'Revisa los detalles de tu reserva',
          <div className="reservation-summary">
            {[
              { icon: 'calendar-alt', label: 'Fecha', value: formData.date || 'No seleccionada' },
              { icon: 'clock', label: 'Hora', value: formData.time || 'No seleccionada' },
              { icon: 'users', label: 'Invitados', value: formData.partySize },
              { icon: 'map-marker-alt', label: 'Área', 
                value: reservationAreas.find(a => a.id === formData.locationArea)?.name || 'No seleccionada' },
              { icon: 'chair', label: 'Mesa', 
                value: tableTypes.find(t => t.id === formData.tableType)?.name || 'No seleccionada' }
            ].map((item, index) => (
              <div key={index} className="summary-item">
                <i className={`fas fa-${item.icon}`}></i>
                <span><strong>{item.label}:</strong> {item.value}</span>
              </div>
            ))}
          </div>
        )}

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
              {[
                { label: 'Mesa', value: tableTypes.find(t => t.id === formData.tableType)?.name },
                { label: 'Fecha', value: formData.date },
                { label: 'Hora', value: formData.time },
                { label: 'Invitados', value: formData.partySize },
                { label: 'Área', value: reservationAreas.find(a => a.id === formData.locationArea)?.name },
                { label: 'Nombre', value: formData.name },
                { label: 'Email', value: formData.email },
                ...(formData.specialRequests ? [{ label: 'Solicitudes', value: formData.specialRequests }] : [])
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

      <CustomAlert {...alertState} onClose={hideAlert} />
    </div>
  );
};

export default RestaurantReservation;