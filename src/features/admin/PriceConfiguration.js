import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';
import useAlert from '../../hooks/useAlert';
import './PriceConfiguration.css';

const PriceConfiguration = ({ apiUrl, onExit }) => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [savingPrices, setSavingPrices] = useState(false);
  const { alertState, hideAlert, showError, showSuccess } = useAlert();
  const [seasons, setSeasons] = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [seasonForms, setSeasonForms] = useState([]);
  const [editingSeasonIndex, setEditingSeasonIndex] = useState(null);

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

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoadingSeasons(true);
      try {
        const resp = await fetch(`${apiUrl}/api/admin/seasonal-prices`);
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const data = await resp.json();
        setSeasons(Array.isArray(data) ? data : (data?.seasons || []));
      } catch (e) {
        console.error('Error fetching seasonal prices:', e);
        setSeasons([]);
      } finally {
        setLoadingSeasons(false);
      }
    };
    fetchSeasons();
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

  const openSeasonModal = (index = null) => {
    setEditingSeasonIndex(index);
    if (index !== null && seasons[index]) {
      setSeasonForms([JSON.parse(JSON.stringify(seasons[index]))]);
    } else {
      const defaultForm = {
        start_date: '',
        end_date: '',
        types: [],
        applySamePrices: false,
        prices: {
          events: prices?.events ? JSON.parse(JSON.stringify(prices.events)) : {
            decorated: [{ min: 1, max: 50, price: 0 }],
            withoutDecoration: [{ min: 1, max: 50, price: 0 }],
            extraHourRates: { decorated: 0, withoutDecoration: 0 }
          },
          rooms: prices?.rooms ? JSON.parse(JSON.stringify(prices.rooms)) : {
            room1: 0, room2: 0, room3: 0, room4: 0, room5: 0
          },
          restaurant: prices?.restaurant ? JSON.parse(JSON.stringify(prices.restaurant)) : {
            daypass: { simple: 0, 'food-250': 0, 'food-drinks-500': 0 },
            tables: { standard: 0, window: 0, booth: 0 }
          }
        }
      };
      setSeasonForms([defaultForm]);
    }
    setShowSeasonModal(true);
  };

  const closeSeasonModal = () => {
    setShowSeasonModal(false);
    setSeasonForms([]);
    setEditingSeasonIndex(null);
  };

  const addSeasonForm = () => {
    setSeasonForms(prev => ([...prev, {
      start_date: '',
      end_date: '',
      types: [],
      applySamePrices: false,
      prices: {
        events: prices?.events ? JSON.parse(JSON.stringify(prices.events)) : {
          decorated: [{ min: 1, max: 50, price: 0 }],
          withoutDecoration: [{ min: 1, max: 50, price: 0 }],
          extraHourRates: { decorated: 0, withoutDecoration: 0 }
        },
        rooms: prices?.rooms ? JSON.parse(JSON.stringify(prices.rooms)) : {
          room1: 0, room2: 0, room3: 0, room4: 0, room5: 0
        },
        restaurant: prices?.restaurant ? JSON.parse(JSON.stringify(prices.restaurant)) : {
          daypass: { simple: 0, 'food-250': 0, 'food-drinks-500': 0 },
          tables: { standard: 0, window: 0, booth: 0 }
        }
      }
    }]));
  };

  const updateSeasonForm = (idx, updater) => {
    setSeasonForms(prev => prev.map((s, i) => i === idx ? updater(s) : s));
  };

  const datesOverlap = (aStart, aEnd, bStart, bEnd) => {
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    const as = new Date(aStart);
    const ae = new Date(aEnd);
    const bs = new Date(bStart);
    const be = new Date(bEnd);
    return as <= be && bs <= ae;
  };

  const validateNoOverlap = (candidate, excludeIndex = null) => {
    for (let i = 0; i < seasons.length; i++) {
      if (excludeIndex !== null && i === excludeIndex) continue;
      const existing = seasons[i];
      const sharedTypes = candidate.types.filter(t => existing.types.includes(t));
      if (sharedTypes.length > 0 && datesOverlap(candidate.start_date, candidate.end_date, existing.start_date, existing.end_date)) {
        return false;
      }
    }
    return true;
  };

  const saveSeasonForms = async () => {
    try {
      // Basic validations and overlap checks
      for (const form of seasonForms) {
        if (!form.start_date || !form.end_date) {
          showError('Debes seleccionar fecha de inicio y fin', 'Fechas requeridas');
          return;
        }
        if (new Date(form.end_date) < new Date(form.start_date)) {
          showError('La fecha final debe ser posterior a la inicial', 'Rango de fechas inválido');
          return;
        }
        if (!Array.isArray(form.types) || form.types.length === 0) {
          showError('Selecciona al menos un tipo', 'Tipos requeridos');
          return;
        }
        if (!validateNoOverlap(form, editingSeasonIndex !== null ? editingSeasonIndex : null)) {
          showError('El período se solapa con otra temporada configurada', 'Solapamiento de fechas');
          return;
        }
      }

      const newSeasons = editingSeasonIndex !== null 
        ? seasons.map((s, i) => i === editingSeasonIndex ? seasonForms[0] : s)
        : [...seasons, ...seasonForms];

      const resp = await fetch(`${apiUrl}/api/admin/seasonal-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasons: newSeasons })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar temporadas');
      }
      setSeasons(newSeasons);
      closeSeasonModal();
      showSuccess('Temporadas guardadas correctamente', 'Configuración por temporada');
    } catch (e) {
      showError(e.message, 'Error al guardar temporadas');
    }
  };

  const deleteSeason = async (index) => {
    try {
      const newSeasons = seasons.filter((_, i) => i !== index);
      const resp = await fetch(`${apiUrl}/api/admin/seasonal-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasons: newSeasons })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al actualizar temporadas');
      }
      setSeasons(newSeasons);
      showSuccess('Temporada eliminada', 'Actualización exitosa');
    } catch (e) {
      showError(e.message, 'Error al eliminar temporada');
    }
  };

  return (
    <div className="event-reservation price-configuration">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Configuración de Precios</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => openSeasonModal()}
            style={{
              background: 'linear-gradient(135deg, #03258C 0%, #0785F2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Aplicar precios por temporada
          </button>
          <button
            onClick={() => setShowSeasonModal(true)}
            style={{
              display: 'none'
            }}
          >
            Abrir Modal (debug)
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#03258C' }}>Temporadas configuradas</h3>
        {loadingSeasons ? (
          <div style={{ padding: '1rem', color: '#64748b' }}>Cargando temporadas...</div>
        ) : seasons.length === 0 ? (
          <div style={{ padding: '1rem', color: '#64748b' }}>Aún no hay temporadas configuradas.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {seasons.map((s, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>Del {s.start_date} al {s.end_date}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openSeasonModal(idx)} style={{ background: '#e5e7eb', border: 'none', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => deleteSeason(idx)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Eliminar</button>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem', color: '#475569', fontSize: 14 }}>Tipos: {Array.isArray(s.types) ? s.types.join(', ') : '--'}</div>
              </div>
            ))}
          </div>
        )}
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

      {showSeasonModal && (
        <div role="dialog" aria-modal="true" onClick={closeSeasonModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 12, width: 'min(980px, 95vw)', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Precios por temporada</h3>
              <button onClick={closeSeasonModal} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {seasonForms.map((form, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', marginBottom: '1rem', background: '#f8fafc' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>Fecha inicio</label>
                      <input type="date" value={form.start_date} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, start_date: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>Fecha final</label>
                      <input type="date" value={form.end_date} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, end_date: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ color: '#475569', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Tipos</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {['events','rooms','restaurant'].map(t => (
                        <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="checkbox" checked={form.types.includes(t)} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, types: e.target.checked ? [...s.types, t] : s.types.filter(x => x !== t) }))} />
                          {t === 'events' ? 'Eventos' : t === 'rooms' ? 'Habitaciones' : 'Restaurante (daypass y mesas)'}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={form.applySamePrices} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, applySamePrices: e.target.checked }))} />
                      Aplicar los mismos precios a todos los tipos seleccionados
                    </label>
                    {form.applySamePrices && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>$</span>
                        <input type="number" min="0" value={0} onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          updateSeasonForm(idx, (s) => {
                            const next = { ...s };
                            if (s.types.includes('rooms')) {
                              next.prices.rooms = { room1: v, room2: v, room3: v, room4: v, room5: v };
                            }
                            if (s.types.includes('restaurant')) {
                              next.prices.restaurant = { daypass: { simple: v, 'food-250': v, 'food-drinks-500': v }, tables: { standard: v, window: v, booth: v } };
                            }
                            if (s.types.includes('events')) {
                              next.prices.events = {
                                decorated: (next.prices.events.decorated || [{ min: 1, max: 50, price: 0 }]).map(t => ({ ...t, price: v })),
                                withoutDecoration: (next.prices.events.withoutDecoration || [{ min: 1, max: 50, price: 0 }]).map(t => ({ ...t, price: v })),
                                extraHourRates: { decorated: v, withoutDecoration: v }
                              };
                            }
                            return next;
                          });
                        }} style={{ width: 120, padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                        <span style={{ color: '#64748b', fontSize: 12 }}>MXN</span>
                      </div>
                    )}
                  </div>

                  {form.types.includes('events') && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#8C8303' }}>Eventos</h4>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Con decorado</div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {(form.prices.events.decorated || []).map((tier, ti) => (
                            <div key={ti} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                              <input type="number" min="1" value={tier.min} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, decorated: s.prices.events.decorated.map((t, k) => k === ti ? { ...t, min: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                              <input type="number" min="1" value={tier.max} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, decorated: s.prices.events.decorated.map((t, k) => k === ti ? { ...t, max: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                              <input type="number" min="0" value={tier.price} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, decorated: s.prices.events.decorated.map((t, k) => k === ti ? { ...t, price: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Sin decorar</div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {(form.prices.events.withoutDecoration || []).map((tier, ti) => (
                            <div key={ti} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                              <input type="number" min="1" value={tier.min} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, withoutDecoration: s.prices.events.withoutDecoration.map((t, k) => k === ti ? { ...t, min: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                              <input type="number" min="1" value={tier.max} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, withoutDecoration: s.prices.events.withoutDecoration.map((t, k) => k === ti ? { ...t, max: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                              <input type="number" min="0" value={tier.price} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, withoutDecoration: s.prices.events.withoutDecoration.map((t, k) => k === ti ? { ...t, price: Number(e.target.value) } : t) } } }))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>Hora extra (decorado)</label>
                          <input type="number" min="0" value={form.prices.events.extraHourRates.decorated || 0} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, extraHourRates: { ...s.prices.events.extraHourRates, decorated: Number(e.target.value) } } } }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>Hora extra (sin decorar)</label>
                          <input type="number" min="0" value={form.prices.events.extraHourRates.withoutDecoration || 0} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, events: { ...s.prices.events, extraHourRates: { ...s.prices.events.extraHourRates, withoutDecoration: Number(e.target.value) } } } }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {form.types.includes('rooms') && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#0785F2' }}>Habitaciones</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                        {['room1','room2','room3','room4','room5'].map(roomId => (
                          <div key={roomId} style={{ padding: '0.75rem', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                              {roomId === 'room1' ? 'Cuarto 1' : roomId === 'room2' ? 'Cuarto 2' : roomId === 'room3' ? 'Cuarto 3' : roomId === 'room4' ? 'Cuarto 4' : 'Cuarto 5'}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#64748b' }}>$</span>
                              <input type="number" min="0" value={form.prices.rooms?.[roomId] || 0} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, rooms: { ...s.prices.rooms, [roomId]: Number(e.target.value) } } }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                              <span style={{ color: '#64748b', fontSize: 12 }}>USD</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.types.includes('restaurant') && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#F25C05' }}>Restaurante</h4>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Daypass</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                          {['simple','food-250','food-drinks-500'].map(dp => (
                            <div key={dp} style={{ padding: '0.75rem', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                              <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                                {dp === 'simple' ? 'Daypass Simple' : dp === 'food-250' ? 'Daypass con Reembolso $250' : 'Daypass con Reembolso $500'}
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#64748b' }}>$</span>
                                <input type="number" min="0" value={form.prices.restaurant?.daypass?.[dp] || 0} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, restaurant: { ...(s.prices.restaurant || {}), daypass: { ...((s.prices.restaurant || {}).daypass || {}), [dp]: Number(e.target.value) } } } }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                                <span style={{ color: '#64748b', fontSize: 12 }}>MXN</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Mesas (por persona)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                          {['standard','window','booth'].map(tb => (
                            <div key={tb} style={{ padding: '0.75rem', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                              <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                                {tb === 'standard' ? 'Mesa Estándar' : tb === 'window' ? 'Mesa con Vista' : 'Mesa Privada'}
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#64748b' }}>$</span>
                                <input type="number" min="0" value={form.prices.restaurant?.tables?.[tb] || 0} onChange={(e) => updateSeasonForm(idx, (s) => ({ ...s, prices: { ...s.prices, restaurant: { ...(s.prices.restaurant || {}), tables: { ...((s.prices.restaurant || {}).tables || {}), [tb]: Number(e.target.value) } } } }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                                <span style={{ color: '#64748b', fontSize: 12 }}>USD</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={addSeasonForm} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Agregar más temporadas</button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={closeSeasonModal} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={saveSeasonForms} style={{ background: 'linear-gradient(135deg, #03258C 0%, #0785F2 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Guardar temporadas</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceConfiguration;
