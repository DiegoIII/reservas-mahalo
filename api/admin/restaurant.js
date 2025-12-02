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
  const guests = Number(b.party_size || 0);
  const tableType = String(b.table_type || '').trim();
  const daypassType = String(b.daypass_type || '').trim();
  if (!email || !name) {
    res.status(400).json({ error: 'nombre y email requeridos' });
    return;
  }
  if (!(tableType || daypassType)) {
    res.status(400).json({ error: 'Selecciona daypass o tipo de mesa' });
    return;
  }
  if (!guests || guests < 1) {
    res.status(400).json({ error: 'número de personas inválido' });
    return;
  }
  const payload = {
    type: 'restaurant',
    date: String(b.date || ''),
    time: String(b.time || ''),
    guests: Number(b.party_size || 1),
    table_type: String(b.table_type || ''),
    location: String(b.location_area || ''),
    daypass_type: b.daypass_type || null,
    name,
    email,
    phone: b.phone || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member
  };
  try {
    const r = await addReservation(payload);
    await require('../_store').addNotification({ type: 'confirmation', reservation_id: r.id, email: r.email });
    console.log('restaurant:create', { id: r.id, email: r.email, guests: r.guests, table_type: r.table_type, daypass_type: r.daypass_type, storage: r.storage || 'memory' });
    res.status(201).json(r);
  } catch (e) {
    console.error('restaurant:error', e);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};
