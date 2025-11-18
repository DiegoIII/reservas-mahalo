import React, { useEffect, useState, useRef } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaComment, 
  FaBuilding,
  FaCheckCircle, 
  FaChalkboardTeacher, 
  FaHeart, 
  FaBirthdayCake, 
  FaRing, 
  FaGraduationCap, 
  FaBaby, 
  FaGift, 
  FaGem,
  FaLandmark, 
  FaUtensils, 
  FaSwimmingPool,
  FaCrown,
  FaMapMarkerAlt,
  FaPalette,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHourglassHalf,
  FaIdCard,
  FaTag
} from 'react-icons/fa';
import './EventReservation.css';
import CustomAlert from '../../components/CustomAlert';
import useAlert from '../../hooks/useAlert';

const EventReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    eventType: '', date: '', startTime: '', endTime: '', guests: 50, venue: '',
    name: '', email: '', phone: '', company: '', specialRequests: '', rentalType: '', engagementType: '', memberNumber: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isMember, setIsMember] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeSection, setActiveSection] = useState('eventType');
  const { alertState, hideAlert, showError, showSuccess } = useAlert();
  const sectionRefs = useRef({});

  const eventTypes = [
    { 
      id: 'conference', 
      name: 'Conferencia', 
      minGuests: 20, 
      maxGuests: 200, 
      description: 'Salas equipadas para presentaciones y conferencias', 
      icon: FaChalkboardTeacher,
      features: ['Equipo audiovisual', 'Capacidad amplia', 'Espacio profesional']
    },
    { 
      id: 'wedding', 
      name: 'Boda', 
      minGuests: 50, 
      maxGuests: 300, 
      description: 'Espacios elegantes para celebraciones especiales', 
      icon: FaHeart,
      features: ['Ambiente romántico', 'Espacios amplios', 'Coordinación especializada']
    },
    { 
      id: 'corporate', 
      name: 'Evento Corporativo', 
      minGuests: 30, 
      maxGuests: 150, 
      description: 'Reuniones y eventos empresariales', 
      icon: FaBuilding,
      features: ['Espacio profesional', 'Tecnología integrada', 'Servicio ejecutivo']
    },
    { 
      id: 'birthday', 
      name: 'Cumpleaños', 
      minGuests: 20, 
      maxGuests: 100, 
      description: 'Celebraciones familiares y de amigos', 
      icon: FaBirthdayCake,
      features: ['Ambiente festivo', 'Personalización', 'Espacio versátil']
    },
    { 
      id: 'anniversary', 
      name: 'Aniversario', 
      minGuests: 30, 
      maxGuests: 120, 
      description: 'Celebraciones de aniversario y fechas especiales', 
      icon: FaRing,
      features: ['Ambiente elegante', 'Decoración especial', 'Atención personalizada']
    },
    { 
      id: 'graduation', 
      name: 'Graduación', 
      minGuests: 25, 
      maxGuests: 150, 
      description: 'Celebraciones de logros académicos', 
      icon: FaGraduationCap,
      features: ['Espacio académico', 'Personalización temática', 'Fotografía']
    },
    { 
      id: 'baptism', 
      name: 'Bautizo', 
      minGuests: 20, 
      maxGuests: 120, 
      description: 'Ceremonias y convivios familiares', 
      icon: FaBaby,
      features: ['Ambiente íntimo', 'Decoración especial', 'Servicio familiar']
    },
    { 
      id: 'babyshower', 
      name: 'Baby Shower', 
      minGuests: 15, 
      maxGuests: 80, 
      description: 'Celebración para esperar la llegada del bebé', 
      icon: FaGift,
      features: ['Decoración temática', 'Espacio acogedor', 'Actividades especiales']
    },
    { 
      id: 'engagement', 
      name: 'Compromiso', 
      minGuests: 30, 
      maxGuests: 150, 
      description: 'Celebración del compromiso matrimonial', 
      icon: FaGem,
      features: ['Ambiente romántico', 'Decoración elegante', 'Momento especial']
    }
  ];

  const venues = [
    { 
      id: 'salon-eventos', 
      name: 'Salón de Eventos', 
      capacity: 'Hasta 300 personas', 
      description: 'Espacio amplio para celebraciones y ceremonias', 
      icon: FaLandmark,
      features: ['Capacidad máxima', 'Escenario', 'Iluminación profesional']
    },
    { 
      id: 'area-restauran', 
      name: 'Restaurante Principal', 
      capacity: 'Hasta 120 personas', 
      description: 'Zona gastronómica con ambiente acogedor', 
      icon: FaUtensils,
      features: ['Vista al mar', 'Ambiente climatizado', 'Servicio gourmet']
    },
    { 
      id: 'area-alberca', 
      name: 'Terraza Alberca', 
      capacity: 'Hasta 150 personas', 
      description: 'Área al aire libre con vista a la alberca', 
      icon: FaSwimmingPool,
      features: ['Ambiente tropical', 'Vista panorámica', 'Área al aire libre']
    }
  ];

  const engagementTypes = [
    { 
      id: 'formal', 
      name: 'Compromiso Formal', 
      description: 'Celebración elegante con ceremonia tradicional', 
      icon: FaCrown,
      features: ['Ceremonia tradicional', 'Ambiente elegante', 'Protocolo formal']
    },
    { 
      id: 'intimate', 
      name: 'Compromiso Íntimo', 
      description: 'Celebración privada con familia y amigos cercanos', 
      icon: FaHeart,
      features: ['Grupo pequeño', 'Ambiente íntimo', 'Enfoque personal']
    },
    { 
      id: 'surprise', 
      name: 'Compromiso Sorpresa', 
      description: 'Celebración sorpresa para la pareja', 
      icon: FaGift,
      features: ['Planificación discreta', 'Elemento sorpresa', 'Momento único']
    },
    { 
      id: 'destination', 
      name: 'Compromiso Destino', 
      description: 'Celebración especial en un lugar único', 
      icon: FaMapMarkerAlt,
      features: ['Ubicación especial', 'Experiencia única', 'Recuerdos memorables']
    }
  ];

  const rentalOptions = [
    { 
      id: 'salon', 
      name: 'Salón Básico', 
      description: 'Espacio básico para que puedas decorar según tus necesidades', 
      price: 'Desde $15,000', 
      icon: FaBuilding,
      features: ['Espacio vacío', 'Libertad creativa', 'Presupuesto flexible']
    },
    { 
      id: 'decorado', 
      name: 'Salón Decorado', 
      description: 'Espacio completamente decorado y listo para tu evento', 
      price: 'Desde $20,000', 
      icon: FaPalette,
      features: ['Decoración completa', 'Listo para usar', 'Experiencia sin estrés']
    }
  ];

  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }).filter(time => {
    const [hours] = time.split(':').map(Number);
    return hours >= 8 && hours <= 23;
  });

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    setActiveSection(sectionId);
  };

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
    if (formData.eventType === 'engagement') {
      requiredFields.push('engagementType');
    }
    const isValid = requiredFields.every(field => formData[field]);
    
    if (isValid) {
      setShowConfirmation(true);
    } else {
      showError('Por favor completa todos los campos obligatorios', 'Campos requeridos');
      // Scroll to first missing field
      if (!formData.eventType) scrollToSection('eventType');
      else if (!formData.date || !formData.startTime) scrollToSection('datetime');
      else if (!formData.rentalType) scrollToSection('rental');
      else if (!formData.venue) scrollToSection('venue');
      else scrollToSection('contact');
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
        special_requests: formData.specialRequests || null,
        member_number: isMember ? formData.memberNumber || null : null,
        is_member: isMember
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

    const getBasePrice = (rentalType, guestCount) => {
      if (rentalType === 'decorado') {
        if (guestCount >= 1 && guestCount <= 50) return 20000;
        if (guestCount >= 51 && guestCount <= 100) return 28000;
        if (guestCount >= 101 && guestCount <= 150) return 35000;
        if (guestCount >= 151 && guestCount <= 200) return 40000;
        return 40000;
      } else {
        if (guestCount >= 1 && guestCount <= 50) return 15000;
        if (guestCount >= 51 && guestCount <= 100) return 18000;
        if (guestCount >= 101 && guestCount <= 300) return 25000;
        return 25000;
      }
    };

    const baseRental = getBasePrice(formData.rentalType, guests);
    const extraHoursCharge = extraHours * (formData.rentalType === 'decorado' ? 5000 : 3000);
    const shortHoursApplied = duration > 0 && duration < baseHours;
    const shortHoursCharge = shortHoursApplied ? Math.round(baseRental * 0.15) : 0;
    let subtotal = shortHoursApplied ? shortHoursCharge : baseRental + extraHoursCharge;
    
    // Aplicar descuento de socio (10%)
    const discount = isMember ? subtotal * 0.10 : 0;
    subtotal = subtotal - discount;

    return {
      duration, baseHours, extraHours, baseRental, 
      extraHourRate: formData.rentalType === 'decorado' ? 5000 : 3000, 
      extraHoursCharge, rentalCost: baseRental,
      shortHoursApplied, shortHoursCharge, subtotal, discount
    };
  };

  const ProgressSteps = () => (
    <div className="progress-steps">
      <div className="steps-container">
        {[
          { id: 'eventType', label: 'Tipo de Evento', icon: FaHeart },
          { id: 'datetime', label: 'Fecha y Hora', icon: FaCalendarAlt },
          { id: 'rental', label: 'Renta', icon: FaBuilding },
          { id: 'venue', label: 'Lugar', icon: FaMapMarkerAlt },
          { id: 'contact', label: 'Contacto', icon: FaUser }
        ].map((step, index) => (
          <div key={step.id} className={`step ${activeSection === step.id ? 'active' : ''}`}>
            <div className="step-icon">
              <step.icon />
            </div>
            <span className="step-label">{step.label}</span>
            {index < 4 && <div className="step-connector"></div>}
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
      {children}
    </div>
  );

  const renderOptionGrid = (items, selectedKey, getIcon, renderContent, className = 'options-grid') => (
    <div className={className}>
      {items.map(item => (
        <div
          key={item.id}
          className={`option-card ${formData[selectedKey] === item.id ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, [selectedKey]: item.id }))}
        >
          <div className="option-card-header">
            <div className="option-icon">
              {getIcon(item)}
            </div>
            <div className="option-title">
              <h4>{item.name}</h4>
              {item.capacity && <span className="option-capacity">{item.capacity}</span>}
              {item.minGuests && <span className="option-capacity">{item.minGuests}-{item.maxGuests} personas</span>}
              {item.price && <span className="option-price">{item.price}</span>}
            </div>
          </div>
          {renderContent(item)}
        </div>
      ))}
    </div>
  );

  const getEventIcon = (event) => <event.icon className="icon" />;
  const getVenueIcon = (venue) => <venue.icon className="icon" />;
  const getRentalIcon = (rental) => <rental.icon className="icon" />;
  const getEngagementIcon = (engagement) => <engagement.icon className="icon" />;

  const renderEventContent = (event) => (
    <>
      <p className="option-description">{event.description}</p>
      <div className="option-features">
        {event.features.map((feature, index) => (
          <span key={index} className="feature-tag">{feature}</span>
        ))}
      </div>
    </>
  );

  const renderVenueContent = (venue) => (
    <>
      <p className="option-description">{venue.description}</p>
      <div className="option-features">
        {venue.features.map((feature, index) => (
          <span key={index} className="feature-tag">{feature}</span>
        ))}
      </div>
    </>
  );

  const renderRentalContent = (rental) => (
    <>
      <p className="option-description">{rental.description}</p>
      <div className="option-features">
        {rental.features.map((feature, index) => (
          <span key={index} className="feature-tag">{feature}</span>
        ))}
      </div>
    </>
  );

  const renderEngagementContent = (engagement) => (
    <>
      <p className="option-description">{engagement.description}</p>
      <div className="option-features">
        {engagement.features.map((feature, index) => (
          <span key={index} className="feature-tag">{feature}</span>
        ))}
      </div>
    </>
  );

  const duration = calculateDuration();
  const pricing = calculatePricing();

  return (
    <div className="event-reservation">
      <div className="reservation-container">
        <div className="reservation-header">
          <div className="header-content">
            <h1>Cotiza tu Evento Especial</h1>
            <p className="reservation-subtitle">
              Crea momentos inolvidables en Mahalo Beach Club
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
              'Tipo de Evento',
              'Elige la celebración que mejor se adapte a tu ocasión especial',
              renderOptionGrid(eventTypes, 'eventType', getEventIcon, renderEventContent),
              'eventType'
            )}

            {formData.eventType === 'engagement' && (
              renderFormSection(
                'Tipo de Compromiso',
                'Selecciona el estilo de celebración que prefieras',
                renderOptionGrid(engagementTypes, 'engagementType', getEngagementIcon, renderEngagementContent),
                'engagementType'
              )
            )}

            {renderFormSection(
              'Fecha y Horario',
              'Define cuándo y por cuánto tiempo será tu evento',
              <>
                <div className="datetime-inputs">
                  <div className="input-group">
                    <label htmlFor="date">
                      <FaCalendarAlt className="input-icon" />
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
                  <div className="input-group">
                    <label htmlFor="guests">
                      <FaUsers className="input-icon" />
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
                <div className="time-inputs">
                  <div className="input-group">
                    <label htmlFor="startTime">
                      <FaClock className="input-icon" />
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
                  <div className="input-group">
                    <label htmlFor="endTime">
                      <FaClock className="input-icon" />
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
                
                {duration > 0 && (
                  <div className="duration-info">
                    <div className="duration-badge">
                      <FaHourglassHalf className="duration-icon" />
                      <span>Duración: {duration} horas</span>
                    </div>
                  </div>
                )}
                
                <div className="info-card">
                  <FaInfoCircle className="info-icon" />
                  <div className="info-content">
                    <strong>Información importante:</strong> Los eventos incluyen 5 horas base. 
                    Horas adicionales se cobran por separado.
                  </div>
                </div>
              </>,
              'datetime'
            )}

            {renderFormSection(
              'Opciones de Renta',
              'Elige el tipo de espacio que mejor se adapte a tu evento',
              <>
                {renderOptionGrid(rentalOptions, 'rentalType', getRentalIcon, renderRentalContent)}
                <div className="info-card warning">
                  <FaExclamationTriangle className="info-icon" />
                  <div className="info-content">
                    <strong>Política de horarios:</strong> Si se eligen menos de 5 horas, 
                    se cobra 15% del coste de la renta.
                  </div>
                </div>
              </>,
              'rental'
            )}

            {renderFormSection(
              'Lugar del Evento',
              'Selecciona el espacio perfecto para tu celebración',
              renderOptionGrid(getAvailableVenues(), 'venue', getVenueIcon, renderVenueContent),
              'venue'
            )}

            {renderFormSection(
              'Información de Contacto',
              'Completa tus datos para coordinar tu evento',
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
                  
                  <div className="input-row">
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
                      <label htmlFor="company">
                        <FaBuilding className="input-icon" />
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
                  
                  <div className="input-row">
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
                        placeholder="Decoración especial, catering, equipo audiovisual, accesibilidad, preferencias de menú, etc..." 
                      />
                    </div>
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
                        placeholder="Ingresa tu número de socio" 
                        disabled={!isMember}
                      />
                    </div>
                  </div>
                </div>

                {/* Desglose de Precios movido aquí, debajo de Información de Contacto */}
                {formData.date && formData.startTime && formData.rentalType && (
                  <div className="pricing-section">
                    <h4 className="pricing-title">Desglose de Precios</h4>
                    <div className="pricing-breakdown">
                      <div className="pricing-row">
                        <span>Tipo de renta</span>
                        <span>
                          {formData.rentalType === 'salon' ? 'Salón Básico' : 'Salón Decorado'}
                        </span>
                      </div>
                      <div className="pricing-row">
                        <span>Precio base</span>
                        <span>${pricing.baseRental.toLocaleString('es-MX')}</span>
                      </div>
                      {pricing.shortHoursApplied ? (
                        <div className="pricing-row">
                          <span>Menos de 5 horas (15%)</span>
                          <span>${pricing.shortHoursCharge.toLocaleString('es-MX')}</span>
                        </div>
                      ) : (
                        <div className="pricing-row">
                          <span>Horas extra ({pricing.extraHours} × ${pricing.extraHourRate.toLocaleString('es-MX')})</span>
                          <span>${pricing.extraHoursCharge.toLocaleString('es-MX')}</span>
                        </div>
                      )}
                      {isMember && pricing.discount > 0 && (
                        <div className="pricing-row discount">
                          <span>Descuento Socio (10%)</span>
                          <span>-${pricing.discount.toLocaleString('es-MX')}</span>
                        </div>
                      )}
                      <div className="pricing-total">
                        <span>Total estimado</span>
                        <span>${pricing.subtotal.toLocaleString('es-MX')}</span>
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
                Solicitar Reserva de Evento
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
                <h4>Detalles de tu evento:</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Tipo de Evento:</strong>
                    <span>{eventTypes.find(e => e.id === formData.eventType)?.name}</span>
                  </div>
                  {formData.eventType === 'engagement' && formData.engagementType && (
                    <div className="detail-item">
                      <strong>Tipo de Compromiso:</strong>
                      <span>{engagementTypes.find(e => e.id === formData.engagementType)?.name}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Fecha:</strong>
                    <span>{formData.date}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Horario:</strong>
                    <span>{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Invitados:</strong>
                    <span>{formData.guests} personas</span>
                  </div>
                  <div className="detail-item">
                    <strong>Lugar:</strong>
                    <span>{venues.find(v => v.id === formData.venue)?.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Duración:</strong>
                    <span>{duration} horas</span>
                  </div>
                </div>
                
                <div className="reservation-details">
                  <h4>Información de Contacto:</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Contacto:</strong>
                      <span>{formData.name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{formData.email}</span>
                    </div>
                    {formData.company && (
                      <div className="detail-item">
                        <strong>Empresa:</strong>
                        <span>{formData.company}</span>
                      </div>
                    )}
                    {formData.specialRequests && (
                      <div className="detail-item full-width">
                        <strong>Solicitudes Especiales:</strong>
                        <span>{formData.specialRequests}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="price-breakdown">
                  <h4>Desglose de Precios:</h4>
                  <div className="price-details">
                    {formData.eventType && formData.rentalType ? (() => {
                      const pricing = calculatePricing();
                      return (
                        <>
                          <div className="price-item">
                            <span className="price-label">Renta Base ({formData.rentalType === 'decorado' ? 'Decorado' : 'Básico'})</span>
                            <span className="price-value">${pricing.baseRental}</span>
                          </div>
                          {formData.startTime && formData.endTime && pricing.extraHours > 0 && (
                            <div className="price-item">
                              <span className="price-label">Horas Extra ({pricing.extraHours} × ${pricing.extraHourRate})</span>
                              <span className="price-value">${pricing.extraHoursCharge}</span>
                            </div>
                          )}
                          {formData.startTime && formData.endTime && pricing.shortHoursApplied && (
                            <div className="price-item">
                              <span className="price-label">Tarifa Reducida (menos de {pricing.baseHours} horas)</span>
                              <span className="price-value">${pricing.shortHoursCharge}</span>
                            </div>
                          )}
                          {isMember && pricing.discount > 0 && (
                            <div className="price-item discount">
                              <span className="price-label">Descuento Socio (10%)</span>
                              <span className="price-value">-${pricing.discount.toLocaleString('es-MX')}</span>
                            </div>
                          )}
                          <div className="price-item total">
                            <span className="price-label">Total:</span>
                            <span className="price-value total-amount">${pricing.subtotal.toLocaleString('es-MX')}</span>
                          </div>
                        </>
                      );
                    })() : (
                      <div className="price-item">
                        <span className="price-label">Seleccione tipo de evento y renta para ver el precio</span>
                        <span className="price-value">-</span>
                      </div>
                    )}
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
                    Confirmar Evento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomAlert {...alertState} onClose={hideAlert} />
    </div>
  );
};

export default EventReservation;