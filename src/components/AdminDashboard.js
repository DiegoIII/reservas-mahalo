import React, { useEffect, useState } from 'react';

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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-reservation">
      <h2>Panel de Administración</h2>
      <div className="form-section">
        <h3>Reservas futuras</h3>
        <div className="event-summary">
          {reservations.length === 0 && <p>No hay reservas próximas.</p>}
          {reservations.map((r) => (
            <p key={`${r.type}-${r.id}`}>
              <strong>{r.type}</strong> - {r.date} {r.start_time ? `${r.start_time}` : ''} — {r.name} ({r.email}) — {r.location || ''} — Invitados: {r.guests || ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


