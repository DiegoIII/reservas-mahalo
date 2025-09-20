import React, { useEffect, useState } from 'react';
import './EventReservation.css';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';

const EventReservation = ({ user, apiUrl }) => {
  const [formData, setFormData] = useState({
    eventType: '',
    date: '',
    startTime: '',
    endTime: '',
    guests: 50,
    venue: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    specialRequests: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  const eventTypes = [
    { id: 'conference', name: 'Conferencia', minGuests: 20, maxGuests: 200, description: 'Salas equipadas para presentaciones y conferencias' },
    { id: 'wedding', name: 'Boda', minGuests: 50, maxGuests: 300, description: 'Espacios elegantes para celebraciones especiales' },
    { id: 'corporate', name: 'Evento Corporativo', minGuests: 30, maxGuests: 150, description: 'Reuniones y eventos empresariales' },
    { id: 'birthday', name: 'Cumpleaños', minGuests: 20, maxGuests: 100, description: 'Celebraciones familiares y de amigos' },
    { id: 'anniversary', name: 'Aniversario', minGuests: 30, maxGuests: 120, description: 'Celebraciones de aniversario y fechas especiales' },
    { id: 'graduation', name: 'Graduación', minGuests: 25, maxGuests: 150, description: 'Celebraciones de logros académicos' },
    { id: 'baptism', name: 'Bautizo', minGuests: 20, maxGuests: 120, description: 'Ceremonias y convivios familiares' }
  ];

  const venues = [
    { id: 'salon-eventos', name: 'Salon de eventos', capacity: 'Hasta 300 personas', description: 'Espacio amplio para celebraciones y ceremonias' },
    { id: 'area-restauran', name: 'Área de restaurant', capacity: 'Hasta 120 personas', description: 'Zona gastronómica con ambiente acogedor' },
    { id: 'area-alberca', name: 'Área de alberca', capacity: 'Hasta 150 personas', description: 'Área al aire libre junto a la alberca' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-set end time to 5 hours after start time
      if (name === 'startTime' && value) {
        const startTime = new Date(`2000-01-01T${value}`);
        const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000); // Add 5 hours
        const endTimeString = endTime.toTimeString().slice(0, 5);
        newData.endTime = endTimeString;
      }
      
      return newData;
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.eventType && formData.date && formData.startTime && formData.endTime && formData.venue && formData.name && formData.email) {
      setShowConfirmation(true);
      // Scroll to confirmation modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        const confirmationModal = document.getElementById('event-confirmation-modal');
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
        event_type: formData.eventType,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        guests: Number(formData.guests),
        venue: formData.venue,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        special_requests: formData.specialRequests || null
      };
      const resp = await fetch(`${apiUrl}/api/admin/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo guardar el evento');
      }
      showSuccess('¡Reserva de evento confirmada! Te contactaremos pronto para coordinar los detalles.', 'Reserva exitosa');
      setShowConfirmation(false);
      setFormData({
        eventType: '',
        date: '',
        startTime: '',
        endTime: '',
        guests: 50,
        venue: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        specialRequests: ''
      });
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  const getAvailableVenues = () => {
    const selectedEvent = eventTypes.find(event => event.id === formData.eventType);
    if (!selectedEvent) return venues;
    
    return venues.filter(venue => {
      // Extraer la capacidad numérica del string "Hasta X personas"
      const capacityMatch = venue.capacity.match(/\d+/);
      const capacity = capacityMatch ? parseInt(capacityMatch[0]) : 0;
      
      // Verificar que el venue tenga capacidad suficiente para los invitados
      // y que los invitados cumplan con el mínimo del tipo de evento
      return capacity >= formData.guests && formData.guests >= selectedEvent.minGuests;
    });
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    }
    return 0;
  };

  return (
    <div className="event-reservation">
      <h2>Reserva de Evento</h2>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <h3>Tipo de Evento</h3>
          <div className="event-type-selection">
            <h4>Selecciona el Tipo de Evento *</h4>
            <div className="event-options">
              {eventTypes.map(event => (
                <div 
                  key={event.id} 
                  className={`event-option ${formData.eventType === event.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, eventType: event.id }))}
                >
                  <div className="event-info">
                    <h5>{event.name}</h5>
                    <p>{event.description}</p>
                    <span className="event-capacity">{event.minGuests}-{event.maxGuests} personas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Fecha y Horario</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Fecha del Evento *</label>
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
              <label htmlFor="guests">Número de Invitados</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                min="10"
                max="500"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Hora de Inicio *</label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona hora de inicio</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="endTime">Hora de Finalización *</label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona hora de fin</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          {calculateDuration() > 0 && (
            <p className="duration-info">Duración: {calculateDuration()} horas</p>
          )}
          <p className="hours-note">
            <strong>Nota:</strong> Los eventos incluyen 5 horas base. Horas adicionales se cobran por separado.
          </p>
        </div>

        <div className="form-section">
          <h3>Lugar del Evento</h3>
          <div className="venue-selection">
            <h4>Selecciona el Lugar *</h4>
            <div className="venue-options">
              {getAvailableVenues().map(venue => (
                <div 
                  key={venue.id} 
                  className={`venue-option ${formData.venue === venue.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, venue: venue.id }))}
                >
                  <div className="venue-info">
                    <h5>{venue.name}</h5>
                    <p>{venue.description}</p>
                    <span className="venue-capacity">{venue.capacity}</span>
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
          <div className="form-row">
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
              <label htmlFor="company">Empresa/Organización</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="specialRequests">Solicitudes Especiales</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              placeholder="Decoración especial, catering, equipo audiovisual, accesibilidad..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Resumen del Evento</h3>
          <div className="event-summary">
            <p><strong>Tipo de Evento:</strong> {eventTypes.find(e => e.id === formData.eventType)?.name || 'No seleccionado'}</p>
            <p><strong>Fecha:</strong> {formData.date || 'No seleccionada'}</p>
            <p><strong>Horario:</strong> {formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'No seleccionado'}</p>
            <p><strong>Invitados:</strong> {formData.guests}</p>
            <p><strong>Lugar:</strong> {venues.find(v => v.id === formData.venue)?.name || 'No seleccionado'}</p>
            {calculateDuration() > 0 && (
              <p><strong>Duración:</strong> {calculateDuration()} horas</p>
            )}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Solicitar Reserva de Evento
        </button>
      </form>

      {showConfirmation && (
        <div id="event-confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmar Reserva de Evento</h3>
            <div className="confirmation-details">
              <p><strong>Tipo de Evento:</strong> {eventTypes.find(e => e.id === formData.eventType)?.name}</p>
              <p><strong>Fecha:</strong> {formData.date}</p>
              <p><strong>Horario:</strong> {formData.startTime} - {formData.endTime}</p>
              <p><strong>Invitados:</strong> {formData.guests}</p>
              <p><strong>Lugar:</strong> {venues.find(v => v.id === formData.venue)?.name}</p>
              <p><strong>Duración:</strong> {calculateDuration()} horas</p>
              <p><strong>Contacto:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              {formData.company && <p><strong>Empresa:</strong> {formData.company}</p>}
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

export default EventReservation;
