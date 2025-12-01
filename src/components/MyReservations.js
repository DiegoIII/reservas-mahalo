import React, { useEffect, useState, useMemo } from 'react';

const MyReservations = ({ user, apiUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  const email = user?.email || '';

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch(`${apiUrl}/api/admin/reservations`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const mine = Array.isArray(data) ? data.filter(r => String(r.email).toLowerCase() === String(email).toLowerCase()) : [];
        if (alive) setItems(mine);
      } catch (e) {
        if (alive) setError('No se pudieron cargar tus reservas');
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (email) fetchData();
    return () => { alive = false; };
  }, [apiUrl, email]);

  const grouped = useMemo(() => {
    const groups = { restaurant: [], room: [], event: [] };
    for (const r of items) {
      const type = r.type || 'restaurant';
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    }
    return groups;
  }, [items]);

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ color: '#F25C05' }}>Mis Reservas</h2>
        <p>Inicia sesión para ver tu historial de reservas.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#F25C05', margin: 0 }}>Mis Reservas</h1>
        <p style={{ color: '#6c757d' }}>Resumen de reservas asociadas a {user.email}</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#6c757d' }}>Cargando…</div>
      )}

      {error && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '1rem', borderRadius: 10, marginBottom: '1rem' }}>{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ background: '#e9ecef', color: '#495057', padding: '1rem', borderRadius: 10 }}>No encontramos reservas futuras asociadas a tu correo.</div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {grouped.restaurant.length > 0 && (
            <section style={{ background: 'white', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
              <h3 style={{ color: '#F25C05', marginTop: 0 }}>Restaurante / Daypass</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grouped.restaurant.map(r => (
                  <li key={`rest-${r.id}`} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ minWidth: 120, color: '#6c757d' }}>{r.date} {r.start_time || r.time}</span>
                    <span style={{ flex: 1 }}>
                      {r.location} • {r.guests} persona(s)
                    </span>
                    <span style={{ color: '#6c757d' }}>{r.table_type || 'daypass'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {grouped.room.length > 0 && (
            <section style={{ background: 'white', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
              <h3 style={{ color: '#F25C05', marginTop: 0 }}>Habitaciones</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grouped.room.map(r => (
                  <li key={`room-${r.id}`} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ minWidth: 200, color: '#6c757d' }}>Entrada {r.date} • Salida {r.check_out}</span>
                    <span style={{ flex: 1 }}>
                      {r.location} • {r.guests} huésped(es)
                    </span>
                    {r.checked_out ? (
                      <span style={{ color: '#28a745', fontWeight: 600 }}>Finalizada</span>
                    ) : (
                      <span style={{ color: '#0d6efd' }}>Activa</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {grouped.event.length > 0 && (
            <section style={{ background: 'white', border: '1px solid #e9ecef', borderRadius: 12, padding: '1rem' }}>
              <h3 style={{ color: '#F25C05', marginTop: 0 }}>Eventos</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grouped.event.map(r => (
                  <li key={`evt-${r.id}`} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ minWidth: 180, color: '#6c757d' }}>{r.date} {r.start_time}–{r.end_time}</span>
                    <span style={{ flex: 1 }}>
                      {r.location} • {r.guests} asistente(s)
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MyReservations;

