import React, { useEffect, useMemo, useState } from 'react';

const AdminDashboard = ({ apiUrl }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(`${apiUrl}/api/admin/reservations`);
        const data = await resp.json();
        setReservations(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Format date to dd/mm/yy
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle room checkout
  const handleCheckout = async (reservationId) => {
    setCheckingOut(prev => new Set([...prev, reservationId]));
    try {
      const resp = await fetch(`${apiUrl}/api/admin/room-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId })
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al hacer checkout');
      }
      
      // Refresh data
      const resp2 = await fetch(`${apiUrl}/api/admin/reservations`);
      const data = await resp2.json();
      setReservations(Array.isArray(data) ? data : []);
      
      alert('Checkout realizado exitosamente');
    } catch (e) {
      alert(e.message);
    } finally {
      setCheckingOut(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  const { restaurantList, roomList, eventList, eventsByDate } = useMemo(() => {
    const sorted = [...reservations].sort((a, b) => {
      const da = String(a.date || '');
      const db = String(b.date || '');
      if (da !== db) return da.localeCompare(db);
      return String(a.start_time || '').localeCompare(String(b.start_time || ''));
    });
    const restaurant = sorted.filter(r => r.type === 'restaurant');
    const room = sorted.filter(r => r.type === 'room');
    const events = sorted.filter(r => r.type === 'event');
    const map = new Map();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    for (const [, list] of map) {
      list.sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || '')));
    }
    const groupedEvents = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return { restaurantList: restaurant, roomList: room, eventList: events, eventsByDate: groupedEvents };
  }, [reservations]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-reservation admin-dashboard">
      <h2>Panel de Administración</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #F25C05 0%, #F27E93 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(242, 92, 5, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z"/>
              <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
            </svg>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{restaurantList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Daypass</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0785F2 0%, #0369a1 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(7, 133, 242, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{roomList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cuartos</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(140, 131, 3, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{eventList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Eventos</div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z"/>
            <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
          </svg>
          Daypass (Restaurante)
        </h3>
        {restaurantList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z"/>
                <rect x="4" y="14" width="16" height="3" rx="1" fill="currentColor"/>
              </svg>
            </div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay reservas de daypass</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F25C05 0%, #F27E93 100%)', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Fecha
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Hora
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Área
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Invitados
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Contacto
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Email
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Teléfono
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantList.map((r, index) => (
                    <tr key={r.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      background: index % 2 === 0 ? 'white' : '#f8fafc'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C' }}>{formatDate(r.date)}</td>
                      <td style={{ padding: '1rem' }}>{r.start_time || '--'}</td>
                      <td style={{ padding: '1rem' }}>{r.location || '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: 12, fontWeight: 600 }}>
                          {r.guests ?? '--'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.name || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.email || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.phone || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Cuartos
        </h3>
        {roomList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay reservas de cuartos</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0785F2 0%, #0369a1 100%)', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Check-in
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Check-out
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Habitación
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Huéspedes
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Contacto
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Email
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Teléfono
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Estado
                      </div>
                    </th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roomList.map((r, index) => (
                    <tr key={r.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      background: index % 2 === 0 ? 'white' : '#f8fafc'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C' }}>{formatDate(r.date)}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C' }}>{formatDate(r.check_out)}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.location || '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: 12, fontWeight: 600 }}>
                          {r.guests ?? '--'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.name || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.email || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.phone || '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          background: r.checked_out ? '#dcfce7' : '#fef3c7', 
                          color: r.checked_out ? '#166534' : '#92400e', 
                          borderRadius: '20px', 
                          padding: '0.25rem 0.75rem', 
                          fontSize: 12, 
                          fontWeight: 600 
                        }}>
                          {r.checked_out ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                              </svg>
                              Checkout
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                <path d="M4 12V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M4 12h16M4 12v5M20 12v5M20 12V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </svg>
                              Activo
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {!r.checked_out && (
                          <button
                            onClick={() => handleCheckout(r.id)}
                            disabled={checkingOut.has(r.id)}
                            style={{
                              background: checkingOut.has(r.id) ? '#9ca3af' : 'linear-gradient(135deg, #0785F2 0%, #0369a1 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: checkingOut.has(r.id) ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {checkingOut.has(r.id) ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Procesando...
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                                Checkout
                              </span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Eventos Próximos
        </h3>
        {eventList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay eventos próximos</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {eventsByDate.map(([date, list]) => (
              <div key={date} style={{ 
                background: 'rgba(255,255,255,0.95)', 
                borderRadius: 16, 
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid rgba(140, 131, 3, 0.2)'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)', 
                  color: 'white',
                  padding: '1rem 1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatDate(date)}</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: 14, 
                    fontWeight: 600 
                  }}>
                    {list.length} {list.length === 1 ? 'evento' : 'eventos'}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#334155', textAlign: 'left' }}>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Hora
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Tipo
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Lugar
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Invitados
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Contacto
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Email
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Teléfono
                          </div>
                        </th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                            Notas
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((ev, index) => (
                        <tr key={ev.id} style={{ 
                          borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                          background: index % 2 === 0 ? 'white' : '#f8fafc'
                        }}>
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C', whiteSpace: 'nowrap' }}>
                            {ev.start_time || '--'}{ev.end_time ? ` – ${ev.end_time}` : ''}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              background: 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)', 
                              color: 'white', 
                              borderRadius: '20px', 
                              padding: '0.25rem 0.75rem', 
                              fontSize: 12, 
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {ev.event_type || 'Evento'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{ev.location || '--'}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ 
                              background: '#e0f2fe', 
                              color: '#0369a1', 
                              borderRadius: '20px', 
                              padding: '0.25rem 0.75rem', 
                              fontSize: 12, 
                              fontWeight: 600 
                            }}>
                              {ev.guests ?? '--'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{ev.name || '--'}</td>
                          <td style={{ padding: '1rem', color: '#64748b' }}>{ev.email || '--'}</td>
                          <td style={{ padding: '1rem', color: '#64748b' }}>{ev.phone || '--'}</td>
                          <td style={{ 
                            padding: '1rem', 
                            maxWidth: 280, 
                            color: '#64748b',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                          }}>
                            {ev.special_requests ? (
                              <div style={{ 
                                background: '#f1f5f9', 
                                padding: '0.5rem', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0' 
                              }}>
                                {ev.special_requests}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


