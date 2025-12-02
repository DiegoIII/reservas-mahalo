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
  const checkIn = String(b.check_in || '').trim();
  const checkOut = String(b.check_out || '').trim();
  const roomType = String(b.room_type || '').trim();
  if (!email || !name) {
    res.status(400).json({ error: 'nombre y email requeridos' });
    return;
  }
  if (!checkIn || !checkOut || !roomType) {
    res.status(400).json({ error: 'fechas y habitación requeridas' });
    return;
  }
  if (!guests || guests < 1) {
    res.status(400).json({ error: 'número de huéspedes inválido' });
    return;
  }
  const payload = {
    type: 'room',
    date: checkIn,
    check_out: checkOut,
    guests: guests,
    location: roomType,
    name,
    email,
    phone: b.phone || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member,
    checked_out: false
  };
  try {
    const r = await addReservation(payload);
    await require('../_store').addNotification({ type: 'confirmation', reservation_id: r.id, email: r.email });
    console.log('room:create', { id: r.id, email: r.email, guests: r.guests, location: r.location, date: r.date, check_out: r.check_out, storage: r.storage || 'memory' });
    res.status(201).json(r);
  } catch (e) {
    console.error('room:error', e);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};
