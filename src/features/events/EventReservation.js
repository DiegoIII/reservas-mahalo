import React, { useEffect, useState } from 'react';
import './EventReservation.css';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';

const EventReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    eventType: '', date: '', startTime: '', endTime: '', guests: 50, venue: '',
    name: '', email: '', phone: '', company: '', specialRequests: '', rentalType: '', engagementType: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  const eventTypes = [
    { id: 'conference', name: 'Conferencia', minGuests: 20, maxGuests: 200, description: 'Salas equipadas para presentaciones y conferencias', icon: 'chalkboard-teacher' },
    { id: 'wedding', name: 'Boda', minGuests: 50, maxGuests: 300, description: 'Espacios elegantes para celebraciones especiales', icon: 'heart' },
    { id: 'corporate', name: 'Evento Corporativo', minGuests: 30, maxGuests: 150, description: 'Reuniones y eventos empresariales', icon: 'building' },
    { id: 'birthday', name: 'Cumpleaños', minGuests: 20, maxGuests: 100, description: 'Celebraciones familiares y de amigos', icon: 'birthday-cake' },
    { id: 'anniversary', name: 'Aniversario', minGuests: 30, maxGuests: 120, description: 'Celebraciones de aniversario y fechas especiales', icon: 'ring' },
    { id: 'graduation', name: 'Graduación', minGuests: 25, maxGuests: 150, description: 'Celebraciones de logros académicos', icon: 'graduation-cap' },
    { id: 'baptism', name: 'Bautizo', minGuests: 20, maxGuests: 120, description: 'Ceremonias y convivios familiares', icon: 'baby' },
    { id: 'babyshower', name: 'Baby Shower', minGuests: 15, maxGuests: 80, description: 'Celebración para esperar la llegada del bebé', icon: 'gift' },
    { id: 'engagement', name: 'Celebración de Compromiso', minGuests: 30, maxGuests: 150, description: 'Celebración del compromiso matrimonial', icon: 'gem' }
  ];

  const venues = [
    { id: 'salon-eventos', name: 'Salón de eventos', capacity: 'Hasta 300 personas', description: 'Espacio amplio para celebraciones y ceremonias', icon: 'landmark' },
    { id: 'area-restauran', name: 'Área de restaurant', capacity: 'Hasta 120 personas', description: 'Zona gastronómica con ambiente acogedor', icon: 'utensils' },
    { id: 'area-alberca', name: 'Área de alberca', capacity: 'Hasta 150 personas', description: 'Área al aire libre junto a la alberca', icon: 'swimming-pool' }
  ];

  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }).filter(time => {
    const [hours] = time.split(':').map(Number);
    return hours >= 8 && hours <= 23;
  });

  const engagementTypes = [
    { id: 'formal', name: 'Compromiso Formal', description: 'Celebración elegante con ceremonia tradicional', icon: 'crown' },
    { id: 'intimate', name: 'Compromiso Íntimo', description: 'Celebración privada con familia y amigos cercanos', icon: 'heart' },
    { id: 'surprise', name: 'Compromiso Sorpresa', description: 'Celebración sorpresa para la pareja', icon: 'gift' },
    { id: 'destination', name: 'Compromiso Destino', description: 'Celebración especial en un lugar único', icon: 'map-marker-alt' }
  ];

  const rentalOptions = [
    { id: 'salon', name: 'Salón de eventos (sin decorar)', description: 'Espacio básico para que puedas decorar según tus necesidades', price: 'Desde $15,000', icon: 'building' },
    { id: 'decorado', name: 'Salón de eventos (decorado)', description: 'Espacio completamente decorado y listo para tu evento', price: 'Desde $20,000', icon: 'palette' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'startTime' && value) {
        const startTime = new Date(`2000-01-01T${value}`);
        const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000);
        newData.endTime = endTime.toTimeString().slice(0, 5);
      }
      
      return newData;
    });
  };

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
    const requiredFields = ['eventType', 'date', 'startTime', 'endTime', 'venue', 'name', 'email', 'rentalType'];
    // Add engagementType to required fields if event type is engagement
    if (formData.eventType === 'engagement') {
      requiredFields.push('engagementType');
    }
    const isValid = requiredFields.every(field => formData[field]);
    
    if (isValid) {
      setShowConfirmation(true);
      setTimeout(() => {
        document.getElementById('event-confirmation-modal')?.scrollIntoView({ 
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
        event_type: formData.eventType, date: formData.date, start_time: formData.startTime,
        end_time: formData.endTime, guests: Number(formData.guests), venue: formData.venue,
        name: formData.name, email: formData.email, phone: formData.phone || null,
        company: formData.company || null, special_requests: formData.specialRequests || null
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
      setFormData(initialFormData);
    } catch (e) {
      showError(e.message, 'Error al confirmar reserva');
    }
  };

  const getAvailableVenues = () => {
    const selectedEvent = eventTypes.find(event => event.id === formData.eventType);
    if (!selectedEvent) return venues;
    
    return venues.filter(venue => {
      const capacityMatch = venue.capacity.match(/\d+/);
      const capacity = capacityMatch ? parseInt(capacityMatch[0]) : 0;
      return capacity >= formData.guests && formData.guests >= selectedEvent.minGuests;
    });
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffHours = (end - start) / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    }
    return 0;
  };

  const calculatePricing = () => {
    const duration = calculateDuration();
    const baseHours = 5;
    const extraHours = Math.max(0, duration - baseHours);
    const guests = Number(formData.guests);

    // New pricing structure based on guest count
    const getBasePrice = (rentalType, guestCount) => {
      if (rentalType === 'decorado') {
        // Salón decorado pricing
        if (guestCount >= 1 && guestCount <= 50) return 20000;
        if (guestCount >= 51 && guestCount <= 100) return 28000;
        if (guestCount >= 101 && guestCount <= 150) return 35000;
        if (guestCount >= 151 && guestCount <= 200) return 40000;
        // For more than 200 guests, use the highest tier
        return 40000;
      } else {
        // Salón sin decorar pricing
        if (guestCount >= 1 && guestCount <= 50) return 15000;
        if (guestCount >= 51 && guestCount <= 100) return 18000;
        if (guestCount >= 101 && guestCount <= 300) return 25000;
        // For more than 300 guests, use the highest tier
        return 25000;
      }
    };

    const baseRental = getBasePrice(formData.rentalType, guests);
    const extraHoursCharge = extraHours * (formData.rentalType === 'decorado' ? 5000 : 3000);
    const shortHoursApplied = duration > 0 && duration < baseHours;
    const shortHoursCharge = shortHoursApplied ? Math.round(baseRental * 0.15) : 0;
    const subtotal = shortHoursApplied ? shortHoursCharge : baseRental + extraHoursCharge;

    return {
      duration, baseHours, extraHours, baseRental, 
      extraHourRate: formData.rentalType === 'decorado' ? 5000 : 3000, 
      extraHoursCharge, rentalCost: baseRental,
      shortHoursApplied, shortHoursCharge, subtotal
    };
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

  const renderOptionGrid = (items, selectedKey, onSelect, getIcon, className = 'event-options') => (
    <div className={className}>
      {items.map(item => (
        <div
          key={item.id}
          className={`${className.split('-')[0]}-option ${formData[selectedKey] === item.id ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, [selectedKey]: item.id }))}
        >
          <div className={`${className.split('-')[0]}-icon`}>
            <i className={`fas fa-${getIcon(item)}`}></i>
          </div>
          <div className={`${className.split('-')[0]}-info`}>
            <h5>{item.name}</h5>
            <p>{item.description}</p>
            {item.capacity && <span className={`${className.split('-')[0]}-capacity`}>{item.capacity}</span>}
            {item.minGuests && <span className={`${className.split('-')[0]}-capacity`}>{item.minGuests}-{item.maxGuests} personas</span>}
            {item.price && <span className="rental-price">{item.price}</span>}
          </div>
          {className === 'rental-options' && (
            <input type="radio" name="rentalType" value={item.id} checked={formData.rentalType === item.id} onChange={handleInputChange} className="rental-radio" />
          )}
        </div>
      ))}
    </div>
  );

  const getEventIcon = (event) => event.icon;
  const getVenueIcon = (venue) => venue.icon;
  const getRentalIcon = (rental) => rental.icon;
  const getEngagementIcon = (engagement) => engagement.icon;

  const duration = calculateDuration();
  const pricing = calculatePricing();

  return (
    <div className="event-reservation">
      <div className="event-header">
        <h2>Reserva de Evento</h2>
        <p className="event-subtitle">Organiza tu evento perfecto con nosotros</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reservation-form">
        {renderFormSection(
          'Tipo de Evento',
          'Elige el tipo de celebración que mejor se adapte a tu evento',
          <div className="event-type-selection">
            {renderOptionGrid(eventTypes, 'eventType', setFormData, getEventIcon)}
          </div>
        )}

        {formData.eventType === 'engagement' && (
          renderFormSection(
            'Tipo de Compromiso',
            'Selecciona el estilo de celebración de compromiso que prefieras',
            <div className="engagement-type-selection">
              {renderOptionGrid(engagementTypes, 'engagementType', setFormData, getEngagementIcon, 'engagement-options')}
            </div>
          )
        )}

        {renderFormSection(
          'Fecha y Horario',
          'Selecciona cuándo y por cuánto tiempo será tu evento',
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date"><i className="fas fa-calendar-alt"></i>Fecha del Evento *</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label htmlFor="guests"><i className="fas fa-users"></i>Número de Invitados</label>
                <input type="number" id="guests" name="guests" value={formData.guests} onChange={handleInputChange}
                  min="10" max="500" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime"><i className="fas fa-clock"></i>Hora de Inicio *</label>
                <select id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} required>
                  <option value="">Selecciona hora de inicio</option>
                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="endTime"><i className="fas fa-clock"></i>Hora de Finalización *</label>
                <select id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} required>
                  <option value="">Selecciona hora de fin</option>
                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
            </div>
            {duration > 0 && (
              <div className="duration-badge">
                <i className="fas fa-hourglass-half"></i>
                <span>Duración: {duration} horas</span>
              </div>
            )}
            <div className="info-card">
              <i className="fas fa-info-circle"></i>
              <div className="info-content">
                <strong>Información importante:</strong> Los eventos incluyen 5 horas base. Horas adicionales se cobran por separado.
              </div>
            </div>
          </>
        )}

        {renderFormSection(
          'Tipo de Renta y Opciones',
          'Elige el tipo de espacio que mejor se adapte a tu evento',
          <>
            <div className="rental-options">
              {renderOptionGrid(rentalOptions, 'rentalType', setFormData, getRentalIcon, 'rental-options')}
            </div>
            <div className="info-card">
              <i className="fas fa-exclamation-triangle"></i>
              <div className="info-content">
                <strong>Política de horarios:</strong> Si se eligen menos de 5 horas, se cobra 15% del coste de la renta.
              </div>
            </div>
          </>
        )}

        {renderFormSection(
          'Lugar del Evento',
          'Selecciona el espacio perfecto para tu celebración',
          <div className="venue-selection">
            {renderOptionGrid(getAvailableVenues(), 'venue', setFormData, getVenueIcon, 'venue-options')}
          </div>
        )}

        {renderFormSection(
          'Información de Contacto',
          'Datos necesarios para coordinar tu evento',
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone"><i className="fas fa-phone"></i>Teléfono</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label htmlFor="company"><i className="fas fa-building"></i>Empresa/Organización</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange}
                  placeholder="Nombre de tu empresa (opcional)" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="specialRequests"><i className="fas fa-comment-dots"></i>Solicitudes Especiales</label>
              <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests}
                onChange={handleInputChange} rows="4"
                placeholder="Decoración especial, catering, equipo audiovisual, accesibilidad, preferencias de menú, etc..." />
            </div>
          </>
        )}

        {renderFormSection(
          'Resumen del Evento',
          '',
          <div className="event-summary">
            <div className="summary-grid">
              {[
                { label: 'Tipo de Evento', value: eventTypes.find(e => e.id === formData.eventType)?.name || 'No seleccionado' },
                ...(formData.eventType === 'engagement' && formData.engagementType ? [{ label: 'Tipo de Compromiso', value: engagementTypes.find(e => e.id === formData.engagementType)?.name || 'No seleccionado' }] : []),
                { label: 'Fecha', value: formData.date || 'No seleccionada' },
                { label: 'Horario', value: formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'No seleccionado' },
                { label: 'Invitados', value: formData.guests },
                { label: 'Lugar', value: venues.find(v => v.id === formData.venue)?.name || 'No seleccionado' },
                ...(duration > 0 ? [{ label: 'Duración', value: `${duration} horas`, badge: true }] : [])
              ].map((item, index) => (
                <div key={index} className="summary-item">
                  <span className="label">{item.label}</span>
                  <span className={`value ${item.badge ? 'badge' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>
            
            {formData.rentalType && (
              <>
                <h4 className="summary-subtitle">Desglose de precios</h4>
                {(() => {
                  const baseRental = Number(pricing.baseRental || 0);
                  const rentalCost = Number(pricing.rentalCost || 0);
                  const shortHoursCharge = Number(pricing.shortHoursCharge || 0);
                  const extraHourRate = Number(pricing.extraHourRate || 0);
                  const extraHoursCharge = Number(pricing.extraHoursCharge || 0);
                  const subtotal = Number(pricing.subtotal || 0);
                  const guests = Number(formData.guests);
                  
                  // Get pricing tier description
                  const getPricingTierDescription = (rentalType, guestCount) => {
                    if (rentalType === 'decorado') {
                      if (guestCount >= 1 && guestCount <= 50) return '1-50 personas';
                      if (guestCount >= 51 && guestCount <= 100) return '51-100 personas';
                      if (guestCount >= 101 && guestCount <= 150) return '101-150 personas';
                      if (guestCount >= 151 && guestCount <= 200) return '151-200 personas';
                      return '200+ personas (máximo)';
                    } else {
                      if (guestCount >= 1 && guestCount <= 50) return '1-50 personas';
                      if (guestCount >= 51 && guestCount <= 100) return '51-100 personas';
                      if (guestCount >= 101 && guestCount <= 300) return '101-300 personas';
                      return '300+ personas (máximo)';
                    }
                  };

                  return (
                    <div className="pricing-breakdown">
                      <div className="pricing-row">
                        <span>Tipo de renta</span>
                        <span>{formData.rentalType === 'salon' ? 'Salón de eventos (sin decorar)' : 'Salón de eventos (decorado)'}</span>
                      </div>
                      <div className="pricing-row">
                        <span>Rango de invitados</span>
                        <span>{getPricingTierDescription(formData.rentalType, guests)}</span>
                      </div>
                      <div className="pricing-row">
                        <span>Precio base</span>
                        <span>${baseRental.toLocaleString('es-MX')}</span>
                      </div>
                      {pricing.shortHoursApplied ? (
                        <div className="pricing-row">
                          <span>Menos de 5 horas (15% del coste de la renta)</span>
                          <span>${shortHoursCharge.toLocaleString('es-MX')}</span>
                        </div>
                      ) : (
                        <div className="pricing-row">
                          <span>Horas extra ({pricing.extraHours} × ${extraHourRate.toLocaleString('es-MX')})</span>
                          <span>${extraHoursCharge.toLocaleString('es-MX')}</span>
                        </div>
                      )}
                      {pricing.duration > 0 && pricing.duration < pricing.baseHours && (
                        <div className="pricing-note">Política: si se eligen menos horas, se cobra 15% del coste de la renta.</div>
                      )}
                      <div className="pricing-total">
                        <span>Total estimado</span>
                        <span>${subtotal.toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

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
              {[
                { label: 'Tipo de Evento', value: eventTypes.find(e => e.id === formData.eventType)?.name },
                ...(formData.eventType === 'engagement' && formData.engagementType ? [{ label: 'Tipo de Compromiso', value: engagementTypes.find(e => e.id === formData.engagementType)?.name }] : []),
                { label: 'Fecha', value: formData.date },
                { label: 'Horario', value: `${formData.startTime} - ${formData.endTime}` },
                { label: 'Invitados', value: formData.guests },
                { label: 'Lugar', value: venues.find(v => v.id === formData.venue)?.name },
                { label: 'Duración', value: `${duration} horas` },
                { label: 'Contacto', value: formData.name },
                { label: 'Email', value: formData.email },
                ...(formData.company ? [{ label: 'Empresa', value: formData.company }] : []),
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

export default EventReservation;