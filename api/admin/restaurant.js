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

module.exports = (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const b = req.body || {};
  const r = addReservation({
    type: 'restaurant',
    date: String(b.date || ''),
    time: String(b.time || ''),
    guests: Number(b.party_size || 1),
    table_type: String(b.table_type || ''),
    location: String(b.location_area || ''),
    daypass_type: b.daypass_type || null,
    name: String(b.name || ''),
    email: String(b.email || ''),
    phone: b.phone || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member
  });
  res.status(201).json(r);
};

