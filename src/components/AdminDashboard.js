import React, { useEffect, useState } from 'react';

const AdminDashboard = ({ apiUrl }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(`${apiUrl}/api/admin/events`);
        const data = await resp.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-reservation">
      <h2>Panel de Administración</h2>
      <div className="form-section">
        <h3>Eventos futuros</h3>
        <div className="event-summary">
          {events.length === 0 && <p>No hay eventos próximos.</p>}
          {events.map((ev) => (
            <p key={ev.id}>
              <strong>{ev.event_type || 'Evento'}</strong> - {ev.date} {ev.start_time ? `${ev.start_time}` : ''}
              {ev.end_time ? ` – ${ev.end_time}` : ''} — {ev.name} ({ev.email}) — {ev.venue || ''} — Invitados: {ev.guests || ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


