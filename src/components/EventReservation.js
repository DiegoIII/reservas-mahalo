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
    specialRequests: '',
    rentalType: 'salon' // 'salon' | 'decorado'
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
    { id: 'salon-eventos', name: 'Salón de eventos', capacity: 'Hasta 300 personas', description: 'Espacio amplio para celebraciones y ceremonias' },
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

  // Pricing logic based on provided business rules
  const calculatePricing = () => {
    const duration = calculateDuration();
    const baseHours = 5;
    const extraHours = Math.max(0, duration - baseHours);

    // Salon pricing (solo espacio sin decorar)
    const salonBaseForFirst50 = 15000; // 15 mil por primeras 50 personas
    const salonPerAdditional50 = 5000; // 5 mil por cada 50 adicionales
    const salonExtraHour = 3000; // 3 mil por hora extra

    // Decorado pricing (Lugar del evento decorado)
    const decoradoBase = 25000; // 25 mil renta
    const decoradoExtraHour = 5000; // 5 mil por hora extra

    let baseRental = 0;
    let additionalGuestsCharge = 0;
    let extraHourRate = 0;

    if (formData.rentalType === 'salon') {
      baseRental = salonBaseForFirst50;
      if (Number(formData.guests) > 50) {
        const additionalGroups = Math.ceil((Number(formData.guests) - 50) / 50);
        additionalGuestsCharge = additionalGroups * salonPerAdditional50;
      }
      extraHourRate = salonExtraHour;
    } else {
      baseRental = decoradoBase;
      additionalGuestsCharge = 0; // no especificado para decorado
      extraHourRate = decoradoExtraHour;
    }

    const extraHoursCharge = extraHours * extraHourRate;
    let rentalCost = baseRental + additionalGuestsCharge;
    
    // Aplicar +25% al costo total de renta si es decorado
    if (formData.rentalType === 'decorado') {
      rentalCost = Math.round(rentalCost * 1.25);
    }
    
    const shortHoursApplied = duration > 0 && duration < baseHours;
    const shortHoursCharge = shortHoursApplied ? Math.round(rentalCost * 0.15) : 0;
    const subtotal = shortHoursApplied ? shortHoursCharge : rentalCost + extraHoursCharge;

    return {
      duration,
      baseHours,
      extraHours,
      baseRental,
      additionalGuestsCharge,
      extraHourRate,
      extraHoursCharge,
      rentalCost,
      shortHoursApplied,
      shortHoursCharge,
      subtotal
    };
  };

  return (
    <div className="event-reservation">
      <div className="event-header">
        <h2>Reserva de Evento</h2>
        <p className="event-subtitle">Organiza tu evento perfecto con nosotros</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <div className="section-header">
            <h3>Tipo de Evento</h3>
            <p className="section-description">Elige el tipo de celebración que mejor se adapte a tu evento</p>
          </div>
          <div className="event-type-selection">
            <div className="event-options">
              {eventTypes.map(event => (
                <div 
                  key={event.id} 
                  className={`event-option ${formData.eventType === event.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, eventType: event.id }))}
                >
                  <div className="event-icon">
                    {event.id === 'conference' && <i className="fas fa-chalkboard-teacher"></i>}
                    {event.id === 'wedding' && <i className="fas fa-heart"></i>}
                    {event.id === 'corporate' && <i className="fas fa-building"></i>}
                    {event.id === 'birthday' && <i className="fas fa-birthday-cake"></i>}
                    {event.id === 'anniversary' && <i className="fas fa-ring"></i>}
                    {event.id === 'graduation' && <i className="fas fa-graduation-cap"></i>}
                    {event.id === 'baptism' && <i className="fas fa-baby"></i>}
                  </div>
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
          <div className="section-header">
            <h3>Fecha y Horario</h3>
            <p className="section-description">Selecciona cuándo y por cuánto tiempo será tu evento</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                <i className="fas fa-calendar-alt"></i>
                Fecha del Evento *
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
              <label htmlFor="guests">
                <i className="fas fa-users"></i>
                Número de Invitados
              </label>
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
              <label htmlFor="startTime">
                <i className="fas fa-clock"></i>
                Hora de Inicio *
              </label>
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
              <label htmlFor="endTime">
                <i className="fas fa-clock"></i>
                Hora de Finalización *
              </label>
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
            <div className="duration-badge">
              <i className="fas fa-hourglass-half"></i>
              <span>Duración: {calculateDuration()} horas</span>
            </div>
          )}
          <div className="info-card">
            <i className="fas fa-info-circle"></i>
            <div className="info-content">
              <strong>Información importante:</strong> Los eventos incluyen 5 horas base. Horas adicionales se cobran por separado.
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Tipo de Renta y Opciones</h3>
            <p className="section-description">Elige el tipo de espacio que mejor se adapte a tu evento</p>
          </div>
          <div className="rental-options">
            <div className="rental-option">
              <div className="rental-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="rental-info">
                <h4>Salón de eventos (solo espacio sin decorar)</h4>
                <p>Espacio básico para que puedas decorar según tus necesidades</p>
                <span className="rental-price">Desde $15,000</span>
              </div>
              <input
                type="radio"
                id="rental-salon"
                name="rentalType"
                value="salon"
                checked={formData.rentalType === 'salon'}
                onChange={handleInputChange}
                className="rental-radio"
              />
            </div>
            <div className="rental-option">
              <div className="rental-icon">
                <i className="fas fa-palette"></i>
              </div>
              <div className="rental-info">
                <h4>Salón de eventos (decorado)</h4>
                <p>Espacio completamente decorado y listo para tu evento</p>
                <span className="rental-price">Desde $25,000 + 25%</span>
              </div>
              <input
                type="radio"
                id="rental-decorado"
                name="rentalType"
                value="decorado"
                checked={formData.rentalType === 'decorado'}
                onChange={handleInputChange}
                className="rental-radio"
              />
            </div>
          </div>
          <div className="info-card">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="info-content">
              <strong>Política de horarios:</strong> Si se eligen menos de 5 horas, se cobra 15% del coste de la renta.
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Lugar del Evento</h3>
            <p className="section-description">Selecciona el espacio perfecto para tu celebración</p>
          </div>
          <div className="venue-selection">
            <div className="venue-options">
              {getAvailableVenues().map(venue => (
                <div 
                  key={venue.id} 
                  className={`venue-option ${formData.venue === venue.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, venue: venue.id }))}
                >
                  <div className="venue-icon">
                    {venue.id === 'salon-eventos' && <i className="fas fa-landmark"></i>}
                    {venue.id === 'area-restauran' && <i className="fas fa-utensils"></i>}
                    {venue.id === 'area-alberca' && <i className="fas fa-swimming-pool"></i>}
                  </div>
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
          <div className="section-header">
            <h3>Información de Contacto</h3>
            <p className="section-description">Datos necesarios para coordinar tu evento</p>
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
          <div className="form-row">
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
              <label htmlFor="company">
                <i className="fas fa-building"></i>
                Empresa/Organización
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Nombre de tu empresa (opcional)"
              />
            </div>
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
              rows="4"
              placeholder="Decoración especial, catering, equipo audiovisual, accesibilidad, preferencias de menú, etc..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Resumen del Evento</h3>
          <div className="event-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Tipo de Evento</span>
                <span className="value">{eventTypes.find(e => e.id === formData.eventType)?.name || 'No seleccionado'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Fecha</span>
                <span className="value">{formData.date || 'No seleccionada'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Horario</span>
                <span className="value">{formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'No seleccionado'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Invitados</span>
                <span className="value">{formData.guests}</span>
              </div>
              <div className="summary-item">
                <span className="label">Lugar</span>
                <span className="value">{venues.find(v => v.id === formData.venue)?.name || 'No seleccionado'}</span>
              </div>
              {calculateDuration() > 0 && (
                <div className="summary-item">
                  <span className="label">Duración</span>
                  <span className="value badge">{calculateDuration()} horas</span>
                </div>
              )}
            </div>
            <h4 className="summary-subtitle">Desglose de precios</h4>
            {(() => {
              const pricing = calculatePricing();
              return (
                <div className="pricing-breakdown">
                  <div className="pricing-row">
                    <span>Tipo de renta</span>
                    <span>{formData.rentalType === 'salon' ? 'Salón de eventos (solo espacio sin decorar)' : 'Salón de eventos (decorado)'}</span>
                  </div>
                  <div className="pricing-row">
                    <span>Renta base</span>
                    <span>${pricing.baseRental.toLocaleString('es-MX')}</span>
                  </div>
                  {formData.rentalType === 'salon' && Number(formData.guests) > 50 && (
                    <div className="pricing-row">
                      <span>Adicional por invitados (cada 50)</span>
                      <span>${pricing.additionalGuestsCharge.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  <div className="pricing-row">
                    <span>Subtotal renta</span>
                    <span>${pricing.rentalCost.toLocaleString('es-MX')}</span>
                  </div>
                  {pricing.shortHoursApplied ? (
                    <div className="pricing-row">
                      <span>Menos de 5 horas (15% del coste de la renta)</span>
                      <span>${pricing.shortHoursCharge.toLocaleString('es-MX')}</span>
                    </div>
                  ) : (
                    <div className="pricing-row">
                      <span>Horas extra ({pricing.extraHours} × ${pricing.extraHourRate.toLocaleString('es-MX')})</span>
                      <span>${pricing.extraHoursCharge.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {formData.rentalType === 'decorado' && (
                    <div className="pricing-note">Incluye +25% aplicado al costo total de renta por salón decorado.</div>
                  )}
                  {pricing.duration > 0 && pricing.duration < pricing.baseHours && (
                    <div className="pricing-note">Política: si se eligen menos horas, se cobra 15% del coste de la renta.</div>
                  )}
                  <div className="pricing-total">
                    <span>Total estimado</span>
                    <span>${pricing.subtotal.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="submit-section">
          <button type="submit" className="submit-button">
            <i className="fas fa-calendar-check"></i>
            Solicitar Reserva de Evento
          </button>
        </div>
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
