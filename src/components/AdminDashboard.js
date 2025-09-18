import React, { useEffect, useMemo, useState } from 'react';

const AdminDashboard = ({ apiUrl }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🍽️</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{restaurantList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Daypass</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0785F2 0%, #0369a1 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(7, 133, 242, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🏨</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{roomList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cuartos</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8C8303 0%, #6B5B00 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(140, 131, 3, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{eventList.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Eventos</div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h3>🍽️ Daypass (Restaurante)</h3>
        {restaurantList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay reservas de daypass</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F25C05 0%, #F27E93 100%)', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📅 Fecha</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>🕐 Hora</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📍 Área</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👥 Invitados</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👤 Contacto</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📧 Email</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantList.map((r, index) => (
                    <tr key={r.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      background: index % 2 === 0 ? 'white' : '#f8fafc'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C' }}>{String(r.date).slice(0, 10)}</td>
                      <td style={{ padding: '1rem' }}>{r.start_time || '--'}</td>
                      <td style={{ padding: '1rem' }}>{r.location || '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: 12, fontWeight: 600 }}>
                          {r.guests ?? '--'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.name || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.email || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h3>🏨 Cuartos</h3>
        {roomList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay reservas de cuartos</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0785F2 0%, #0369a1 100%)', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📅 Check-in</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>🏠 Habitación</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👥 Huéspedes</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👤 Contacto</th>
                    <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📧 Email</th>
                  </tr>
                </thead>
                <tbody>
                  {roomList.map((r, index) => (
                    <tr key={r.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      background: index % 2 === 0 ? 'white' : '#f8fafc'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#03258C' }}>{String(r.date).slice(0, 10)}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.location || '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: 12, fontWeight: 600 }}>
                          {r.guests ?? '--'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{r.name || '--'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{r.email || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>🎉 Eventos Próximos</h3>
        {eventList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
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
                    <div style={{ fontSize: '1.5rem' }}>📅</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{String(date).slice(0, 10)}</div>
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
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>🕐 Hora</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>🏷️ Tipo</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📍 Lugar</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👥 Invitados</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>👤 Contacto</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📧 Email</th>
                        <th style={{ padding: '1rem', fontSize: 14, fontWeight: 700 }}>📝 Notas</th>
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


