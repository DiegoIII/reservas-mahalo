import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';
import useAlert from '../../hooks/useAlert';
import './PriceConfiguration.css';

const PriceConfiguration = ({ apiUrl, onExit, exitLabel = 'Volver al Panel' }) => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [savingPrices, setSavingPrices] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  useEffect(() => {
    const fetchPrices = async () => {
      setLoadingPrices(true);
      try {
        const resp = await fetch(`${apiUrl}/api/admin/prices`);
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const data = await resp.json();
        setPrices(data);
      } catch (e) {
        console.error('Error fetching prices:', e);
        // Fallback to default prices
        setPrices({
          events: {
            decorated: [
              { min: 1, max: 50, price: 20000 },
              { min: 51, max: 100, price: 28000 },
              { min: 101, max: 150, price: 35000 },
              { min: 151, max: 200, price: 40000 }
            ],
            withoutDecoration: [
              { min: 1, max: 50, price: 15000 },
              { min: 51, max: 100, price: 18000 },
              { min: 101, max: 300, price: 25000 }
            ],
            extraHourRates: {
              decorated: 5000,
              withoutDecoration: 3000
            }
          },
          rooms: {
            room1: 120,
            room2: 100,
            room3: 80,
            room4: 80,
            room5: 60
          },
          restaurant: {
            daypass: {
              simple: 250,
              'food-250': 400,
              'food-drinks-500': 500
            },
            tables: {
              standard: 25,
              window: 35,
              booth: 45
            }
          }
        });
        // Don't show error if we have defaults
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
  }, [apiUrl]);

  const handleEventPriceChange = (type, index, field, value) => {
    setPrices(prev => {
      const newPrices = { ...prev };
      newPrices.events = { ...newPrices.events };
      newPrices.events[type] = [...newPrices.events[type]];
      newPrices.events[type][index] = { ...newPrices.events[type][index], [field]: Number(value) };
      return newPrices;
    });
  };

  const handleExtraHourRateChange = (type, value) => {
    setPrices(prev => ({
      ...prev,
      events: {
        ...prev.events,
        extraHourRates: {
          ...prev.events.extraHourRates,
          [type]: Number(value)
        }
      }
    }));
  };

  const addPriceTier = (type) => {
    setPrices(prev => {
      const newPrices = { ...prev };
      newPrices.events = { ...newPrices.events };
      const lastTier = newPrices.events[type][newPrices.events[type].length - 1];
      newPrices.events[type] = [
        ...newPrices.events[type],
        { min: (lastTier?.max || 0) + 1, max: (lastTier?.max || 0) + 50, price: lastTier?.price || 0 }
      ];
      return newPrices;
    });
  };

  const removePriceTier = (type, index) => {
    if (prices.events[type].length <= 1) {
      showError('Debe haber al menos un rango de precios', 'Error');
      return;
    }
    setPrices(prev => {
      const newPrices = { ...prev };
      newPrices.events = { ...newPrices.events };
      newPrices.events[type] = newPrices.events[type].filter((_, i) => i !== index);
      return newPrices;
    });
  };

  const handleRoomPriceChange = (roomId, value) => {
    setPrices(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId]: Number(value)
      }
    }));
  };

  const handleDaypassPriceChange = (daypassId, value) => {
    setPrices(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        daypass: {
          ...prev.restaurant.daypass,
          [daypassId]: Number(value)
        }
      }
    }));
  };

  const handleTablePriceChange = (tableId, value) => {
    setPrices(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        tables: {
          ...prev.restaurant.tables,
          [tableId]: Number(value)
        }
      }
    }));
  };

  const handleExit = useCallback(() => {
    if (typeof onExit === 'function') {
      onExit();
      return;
    }
    navigate('/mahalo-panel-de-administracion');
  }, [navigate, onExit]);

  const savePrices = async () => {
    setSavingPrices(true);
    try {
      const resp = await fetch(`${apiUrl}/api/admin/prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar precios');
      }
      showSuccess('Precios actualizados correctamente', 'Configuración guardada');
    } catch (e) {
      showError(e.message, 'Error al guardar precios');
    } finally {
      setSavingPrices(false);
    }
  };

  return (
    <div className="event-reservation price-configuration">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Configuración de Precios</h2>
        <button
          onClick={handleExit}
          style={{
            background: 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
          </svg>
          {exitLabel}
        </button>
      </div>

      {loadingPrices ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cargando precios...</div>
        </div>
      ) : prices ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Eventos Section */}
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#8C8303', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Precios de Eventos
            </h3>
            
            {/* Decorated Prices */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#8C8303', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Precios con Decorado
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {prices.events?.decorated?.map((tier, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                    <input
                      type="number"
                      value={tier.min}
                      onChange={(e) => handleEventPriceChange('decorated', index, 'min', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      min="1"
                    />
                    <span style={{ textAlign: 'center', color: '#64748b', fontWeight: '600' }}>a</span>
                    <input
                      type="number"
                      value={tier.max}
                      onChange={(e) => handleEventPriceChange('decorated', index, 'max', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      min="1"
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b' }}>personas =</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleEventPriceChange('decorated', index, 'price', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '120px' }}
                        min="0"
                      />
                      <span style={{ color: '#64748b' }}>MXN</span>
                      {prices.events.decorated.length > 1 && (
                        <button
                          onClick={() => removePriceTier('decorated', index)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addPriceTier('decorated')}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '0.5rem'
                  }}
                >
                  + Agregar Rango
                </button>
              </div>
            </div>

            {/* Without Decoration Prices */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#8C8303', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Precios sin Decorar
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {prices.events?.withoutDecoration?.map((tier, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                    <input
                      type="number"
                      value={tier.min}
                      onChange={(e) => handleEventPriceChange('withoutDecoration', index, 'min', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      min="1"
                    />
                    <span style={{ textAlign: 'center', color: '#64748b', fontWeight: '600' }}>a</span>
                    <input
                      type="number"
                      value={tier.max}
                      onChange={(e) => handleEventPriceChange('withoutDecoration', index, 'max', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      min="1"
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b' }}>personas =</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleEventPriceChange('withoutDecoration', index, 'price', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '120px' }}
                        min="0"
                      />
                      <span style={{ color: '#64748b' }}>MXN</span>
                      {prices.events.withoutDecoration.length > 1 && (
                        <button
                          onClick={() => removePriceTier('withoutDecoration', index)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addPriceTier('withoutDecoration')}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '0.5rem'
                  }}
                >
                  + Agregar Rango
                </button>
              </div>
            </div>

            {/* Extra Hour Rates */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#8C8303', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Tarifas de Horas Extra
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Con Decorado (por hora)
                  </label>
                  <input
                    type="number"
                    value={prices.events?.extraHourRates?.decorated || 0}
                    onChange={(e) => handleExtraHourRateChange('decorated', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Sin Decorar (por hora)
                  </label>
                  <input
                    type="number"
                    value={prices.events?.extraHourRates?.withoutDecoration || 0}
                    onChange={(e) => handleExtraHourRateChange('withoutDecoration', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Habitaciones Section */}
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#0785F2', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              Precios de Habitaciones (por noche)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {['room1', 'room2', 'room3', 'room4', 'room5'].map(roomId => (
                <div key={roomId} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    {roomId === 'room1' ? 'Cuarto 1' : roomId === 'room2' ? 'Cuarto 2' : roomId === 'room3' ? 'Cuarto 3' : roomId === 'room4' ? 'Cuarto 4' : 'Cuarto 5'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.rooms?.[roomId] || 0}
                      onChange={(e) => handleRoomPriceChange(roomId, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restaurante Section */}
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#F25C05', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z"/>
                <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
              </svg>
              Precios de Restaurante (Daypass)
            </h3>
            
            {/* Daypass Prices */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#F25C05', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
                Daypass
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Daypass Simple
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.daypass?.simple || 0}
                      onChange={(e) => handleDaypassPriceChange('simple', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>MXN</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Daypass con Reembolso $250
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.daypass?.['food-250'] || 0}
                      onChange={(e) => handleDaypassPriceChange('food-250', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>MXN</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Daypass con Reembolso $500
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.daypass?.['food-drinks-500'] || 0}
                      onChange={(e) => handleDaypassPriceChange('food-drinks-500', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>MXN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Prices */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#F25C05', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Mesas (por persona)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Mesa Estándar
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.tables?.standard || 0}
                      onChange={(e) => handleTablePriceChange('standard', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>USD</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Mesa con Vista
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.tables?.window || 0}
                      onChange={(e) => handleTablePriceChange('window', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>USD</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    Mesa Privada
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      value={prices.restaurant?.tables?.booth || 0}
                      onChange={(e) => handleTablePriceChange('booth', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', width: '100%' }}
                      min="0"
                    />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem' }}>
            <button
              onClick={handleExit}
              style={{
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={savePrices}
              disabled={savingPrices}
              style={{
                background: savingPrices ? '#9ca3af' : 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: '600',
                cursor: savingPrices ? 'not-allowed' : 'pointer'
              }}
            >
              {savingPrices ? 'Guardando...' : 'Guardar Todos los Precios'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Error al cargar precios</div>
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

export default PriceConfiguration;

