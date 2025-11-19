import React, { useEffect, useState, useRef } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaComment, 
  FaUtensils, 
  FaCheckCircle, 
  FaLandmark, 
  FaSwimmingPool, 
  FaChair, 
  FaEye, 
  FaLeaf,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaIdCard,
  FaTag,
  FaUmbrellaBeach,
  FaCocktail
} from 'react-icons/fa';
import './RestaurantReservation.css';
import CustomAlert from '../../components/CustomAlert';
import useAlert from '../../hooks/useAlert';

const RestaurantReservation = ({ user, apiUrl }) => {
  const initialFormData = {
    date: '', time: '', partySize: 2, tableType: '', locationArea: '',
    name: '', email: '', phone: '', specialRequests: '', memberNumber: '', daypassType: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isMember, setIsMember] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeSection, setActiveSection] = useState('datetime');
  const { alertState, hideAlert, showError, showSuccess } = useAlert();
  const sectionRefs = useRef({});

  const reservationAreas = [
    { 
      id: 'salon-eventos', 
      name: 'Salón de Eventos', 
      description: 'Espacio amplio para celebraciones y ceremonias', 
      icon: FaLandmark,
      features: ['Capacidad para grupos grandes', 'Ambiente elegante', 'Ideal para eventos especiales']
    },
    { 
      id: 'area-restauran', 
      name: 'Restaurante Principal', 
      description: 'Zona gastronómica con ambiente acogedor y servicio premium', 
      icon: FaUtensils,
      features: ['Vista al mar', 'Ambiente climatizado', 'Servicio de mesa completo']
    },
    { 
      id: 'area-alberca', 
      name: 'Terraza Alberca', 
      description: 'Área al aire libre con vista a la alberca y ambiente tropical', 
      icon: FaSwimmingPool,
      features: ['Vista a la alberca', 'Ambiente al aire libre', 'Perfecto para días soleados']
    }
  ];

  const daypassTypes = [
    {
      id: 'simple',
      name: 'Daypass Simple',
      price: 250,
      description: 'Solo uso de instalación y playa de acuerdo a disponibilidad',
      icon: FaUmbrellaBeach,
      features: ['Uso de instalaciones', 'Acceso a playa', 'Según disponibilidad']
    },
    {
      id: 'food-250',
      name: 'Daypass con Reembolso Alimentos',
      price: 400,
      description: 'Uso de instalaciones, playa y reembolso de $250 pesos en alimentos',
      icon: FaUtensils,
      features: ['Uso de instalaciones', 'Acceso a playa', 'Reembolso $250 en alimentos']
    },
    {
      id: 'food-drinks-500',
      name: 'Daypass con Reembolso Completo',
      price: 500,
      description: 'Uso de instalaciones, playa y reembolso de $500 pesos en alimentos y bebidas',
      icon: FaCocktail,
      features: ['Uso de instalaciones', 'Acceso a playa', 'Reembolso $500 en alimentos y bebidas']
    }
  ];

  const tableTypes = [
    { 
      id: 'standard', 
      name: 'Mesa Estándar', 
      capacity: '2-4', 
      description: 'Mesa interior cómoda para comidas familiares', 
      icon: FaChair,
      min: 2,
      max: 4,
      price: 25
    },
    { 
      id: 'window', 
      name: 'Mesa con Vista', 
      capacity: '2-4', 
      description: 'Vista panorámica al mar, ideal para ocasiones especiales', 
      icon: FaEye,
      min: 2,
      max: 4,
      price: 35
    },
    { 
      id: 'booth', 
      name: 'Mesa Privada', 
      capacity: '4-6', 
      description: 'Área privada y acogedora, perfecta para grupos', 
      icon: FaUsers,
      min: 4,
      max: 6,
      price: 45
    },
    { 
      id: 'terrace', 
      name: 'Terraza Jardín', 
      capacity: '2-6', 
      description: 'Mesa al aire libre con vista al jardín tropical', 
      icon: FaLeaf,
      min: 2,
      max: 6,
      price: 30
    }
  ];

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];
  
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

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    setActiveSection(sectionId);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['date', 'time', 'locationArea', 'name', 'email'];
    // Requiere daypassType O tableType
    if (!formData.daypassType && !formData.tableType) {
      showError('Por favor selecciona un tipo de daypass o una mesa', 'Campo requerido');
      return;
    }
    const isValid = requiredFields.every(field => formData[field]) && (formData.daypassType || formData.tableType);
    
    if (isValid) {
      setShowConfirmation(true);
    } else {
      showError('Por favor completa todos los campos obligatorios', 'Campos requeridos');
      // Scroll to first missing field
      if (!formData.date || !formData.time) scrollToSection('datetime');
      else if (!formData.locationArea) scrollToSection('area');
      else if (!formData.tableType) scrollToSection('table');
      else scrollToSection('contact');
    }
  };

  const confirmReservation = async () => {
    try {
      const payload = {
        date: formData.date, 
        time: formData.time, 
        party_size: Number(formData.partySize),
        table_type: formData.tableType || formData.daypassType || 'daypass', 
        location_area: formData.locationArea, 
        daypass_type: formData.daypassType || null,
        name: formData.name,
        email: formData.email, 
        phone: formData.phone || null, 
        special_requests: formData.specialRequests || null,
        member_number: formData.memberNumber || null,
        is_member: isMember
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
      return table.max >= formData.partySize && table.min <= formData.partySize;
    });
  };

  const calculateTotal = () => {
    let subtotal = 0;
    
    // Si hay daypass seleccionado, usar su precio
    if (formData.daypassType) {
      const selectedDaypass = daypassTypes.find(dp => dp.id === formData.daypassType);
      if (selectedDaypass) {
        subtotal = selectedDaypass.price * Number(formData.partySize);
      }
    } else if (formData.tableType) {
      // Si hay mesa seleccionada, usar precio de mesa
      const selectedTable = tableTypes.find(table => table.id === formData.tableType);
      const partySize = Number(formData.partySize);
      subtotal = selectedTable ? selectedTable.price * partySize : 0;
    }
    
    // Aplicar descuento de socio (15% para alimentos/daypass)
    if (isMember && subtotal > 0) {
      const discount = subtotal * 0.15;
      subtotal = subtotal - discount;
    }
    
    return subtotal;
  };

  const calculateDiscount = () => {
    if (!isMember) return 0;
    let baseTotal = 0;
    
    if (formData.daypassType) {
      const selectedDaypass = daypassTypes.find(dp => dp.id === formData.daypassType);
      if (selectedDaypass) {
        baseTotal = selectedDaypass.price * Number(formData.partySize);
      }
    } else if (formData.tableType) {
      const selectedTable = tableTypes.find(table => table.id === formData.tableType);
      const partySize = Number(formData.partySize);
      baseTotal = selectedTable ? selectedTable.price * partySize : 0;
    }
    
    return baseTotal * 0.15;
  };

  const ProgressSteps = () => (
    <div className="progress-steps">
      <div className="steps-container">
        {[
          { id: 'datetime', label: 'Fecha y Hora', icon: FaCalendarAlt },
          { id: 'daypass', label: 'Daypass', icon: FaUmbrellaBeach },
          { id: 'area', label: 'Área', icon: FaMapMarkerAlt },
          { id: 'table', label: 'Mesa', icon: FaChair },
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
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  const renderOptionCard = (items, selectedKey, getIcon, renderContent) => (
    <div className="options-grid">
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
              {item.capacity && <span className="option-capacity">{item.capacity} personas</span>}
            </div>
          </div>
          {renderContent(item)}
        </div>
      ))}
    </div>
  );

  const getAreaIcon = (area) => <area.icon className="icon" />;
  const getTableIcon = (table) => <table.icon className="icon" />;

  const renderAreaContent = (area) => (
    <>
      <p className="option-description">{area.description}</p>
      <div className="option-features">
        {area.features.map((feature, index) => (
          <span key={index} className="feature-tag">{feature}</span>
        ))}
      </div>
    </>
  );

  const renderTableContent = (table) => (
    <>
      <p className="option-description">{table.description}</p>
      <div className="capacity-info">
        <FaUsers className="info-icon" />
        <span>Ideal para {table.min}-{table.max} personas</span>
      </div>
    </>
  );

  return (
    <div className="restaurant-reservation">
      <div className="reservation-container">
        <div className="reservation-header">
          <div className="header-content">
            <h1>Reserva tu Day Pass</h1>
            <p className="reservation-subtitle">
              Vive una experiencia gastronómica única en Mahalo Beach Club
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
              'Fecha y Hora',
              'Selecciona cuándo quieres disfrutar tu experiencia gastronómica',
              <>
                <div className="datetime-inputs">
                  <div className="input-group">
                    <label htmlFor="date">
                      <FaCalendarAlt className="input-icon" />
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
                  <div className="input-group">
                    <label htmlFor="time">
                      <FaClock className="input-icon" />
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
                        <option key={time} value={time}>{time} hrs</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="partySize">
                    <FaUsers className="input-icon" />
                    Número de Personas
                  </label>
                  <select 
                    id="partySize" 
                    name="partySize" 
                    value={formData.partySize} 
                    onChange={handleInputChange}
                  >
                    {partySizes.map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </div>
              </>,
              'datetime'
            )}

            {renderFormSection(
              'Tipo de Daypass',
              'Elige el tipo de daypass que mejor se adapte a tus necesidades',
              <>
                {renderOptionCard(daypassTypes, 'daypassType', (item) => <item.icon className="icon" />, (item) => (
                  <>
                    <p className="option-description">{item.description}</p>
                    <div className="option-features">
                      {item.features.map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="option-price" style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                      ${item.price} MXN por persona
                    </div>
                  </>
                ))}
              </>,
              'daypass'
            )}

            {renderFormSection(
              'Área del Restaurante',
              'Elige el ambiente perfecto para tu experiencia',
              renderOptionCard(reservationAreas, 'locationArea', getAreaIcon, renderAreaContent),
              'area'
            )}

            {!formData.daypassType && renderFormSection(
              'Tipo de Mesa',
              'Selecciona la mesa que mejor se adapte a tu grupo',
              <>
                {getAvailableTables().length === 0 ? (
                  <div className="unavailable-state">
                    <div className="unavailable-icon">
                      <FaExclamationTriangle />
                    </div>
                    <h5>No hay mesas disponibles</h5>
                    <p>
                      No hay mesas disponibles para {formData.partySize} {formData.partySize === 1 ? 'persona' : 'personas'}. 
                      Por favor, selecciona un número menor de personas.
                    </p>
                  </div>
                ) : (
                  renderOptionCard(getAvailableTables(), 'tableType', getTableIcon, renderTableContent)
                )}
              </>,
              'table'
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
                      placeholder="Celebración especial, alergias alimentarias, mesa cerca de la ventana..." 
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
                {formData.date && formData.time && (formData.tableType || formData.daypassType) && (
                  <div className="pricing-section">
                    <h4 className="pricing-title">Desglose de Precios</h4>
                    <div className="pricing-breakdown">
                      {formData.daypassType ? (
                        <>
                          <div className="pricing-row">
                            <span>Tipo de daypass</span>
                            <span>
                              {daypassTypes.find(t => t.id === formData.daypassType)?.name}
                            </span>
                          </div>
                          <div className="pricing-row">
                            <span>Precio por persona</span>
                            <span>${daypassTypes.find(t => t.id === formData.daypassType)?.price || 0}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="pricing-row">
                            <span>Tipo de mesa</span>
                            <span>
                              {tableTypes.find(t => t.id === formData.tableType)?.name}
                            </span>
                          </div>
                          <div className="pricing-row">
                            <span>Precio por persona</span>
                            <span>${tableTypes.find(t => t.id === formData.tableType)?.price || 0}</span>
                          </div>
                        </>
                      )}
                      <div className="pricing-row">
                        <span>Número de personas</span>
                        <span>{formData.partySize}</span>
                      </div>
                      {isMember && calculateDiscount() > 0 && (
                        <div className="pricing-row discount">
                          <span>Descuento Socio (15%)</span>
                          <span>-${calculateDiscount().toLocaleString('es-MX')}</span>
                        </div>
                      )}
                      <div className="pricing-total">
                        <span>Total estimado</span>
                        <span>${calculateTotal().toLocaleString('es-MX')}</span>
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
                    <strong>Fecha:</strong>
                    <span>{formData.date}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Hora:</strong>
                    <span>{formData.time}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Invitados:</strong>
                    <span>{formData.partySize} personas</span>
                  </div>
                  <div className="detail-item">
                    <strong>Área:</strong>
                    <span>{reservationAreas.find(a => a.id === formData.locationArea)?.name}</span>
                  </div>
                  {formData.tableType && (
                    <div className="detail-item">
                      <strong>Mesa:</strong>
                      <span>{tableTypes.find(t => t.id === formData.tableType)?.name}</span>
                    </div>
                  )}
                  {formData.daypassType && (
                    <div className="detail-item">
                      <strong>Daypass:</strong>
                      <span>{daypassTypes.find(t => t.id === formData.daypassType)?.name}</span>
                    </div>
                  )}
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
                    {formData.daypassType ? (
                      <>
                        <div className="price-item">
                          <span className="price-label">{daypassTypes.find(t => t.id === formData.daypassType)?.name}</span>
                          <span className="price-value">${daypassTypes.find(t => t.id === formData.daypassType)?.price || 0} × {formData.partySize} persona{formData.partySize !== 1 ? 's' : ''}</span>
                        </div>
                        {isMember && calculateDiscount() > 0 && (
                          <div className="price-item discount">
                            <span className="price-label">Descuento Socio (15%)</span>
                            <span className="price-value">-${calculateDiscount().toLocaleString('es-MX')}</span>
                          </div>
                        )}
                        <div className="price-item total">
                          <span className="price-label">Total:</span>
                          <span className="price-value total-amount">${calculateTotal().toLocaleString('es-MX')}</span>
                        </div>
                      </>
                    ) : formData.tableType ? (
                      <>
                        <div className="price-item">
                          <span className="price-label">{tableTypes.find(t => t.id === formData.tableType)?.name}</span>
                          <span className="price-value">${tableTypes.find(t => t.id === formData.tableType)?.price || 0} × {formData.partySize} persona{formData.partySize !== 1 ? 's' : ''}</span>
                        </div>
                        {isMember && calculateDiscount() > 0 && (
                          <div className="price-item discount">
                            <span className="price-label">Descuento Socio (15%)</span>
                            <span className="price-value">-${calculateDiscount().toLocaleString('es-MX')}</span>
                          </div>
                        )}
                        <div className="price-item total">
                          <span className="price-label">Total:</span>
                          <span className="price-value total-amount">${calculateTotal().toLocaleString('es-MX')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="price-item">
                        <span className="price-label">Seleccione un daypass o mesa para ver el precio</span>
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
                    Confirmar Reserva
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

export default RestaurantReservation;