const { addReservation } = require('../_store');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

module.exports = async (req, res) => {
  cors(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const b = req.body || {};
  const email = String(b.email || '').trim();
  const name = String(b.name || '').trim();
  const guests = Number(b.guests || 0);
  const date = String(b.date || '').trim();
  const start = String(b.start_time || '').trim();
  const end = String(b.end_time || '').trim();
  const venue = String(b.venue || '').trim();
  if (!email || !name) {
    res.status(400).json({ error: 'nombre y email requeridos' });
    return;
  }
  if (!date || !start || !end || !venue) {
    res.status(400).json({ error: 'fecha, horario y lugar requeridos' });
    return;
  }
  if (!guests || guests < 1) {
    res.status(400).json({ error: 'número de asistentes inválido' });
    return;
  }
  const payload = {
    type: 'event',
    date,
    start_time: start,
    end_time: end,
    guests,
    location: venue,
    name,
    email,
    phone: b.phone || null,
    company: b.company || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member
  };
  try {
    const r = await addReservation(payload);
    await require('../_store').addNotification({ type: 'confirmation', reservation_id: r.id, email: r.email });
    console.log('event:create', { id: r.id, email: r.email, guests: r.guests, location: r.location, date: r.date, start: r.start_time, end: r.end_time, storage: r.storage || 'memory' });
    res.status(201).json(r);
  } catch (e) {
    console.error('event:error', e);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};
