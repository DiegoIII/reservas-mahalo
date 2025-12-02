const { reservations } = require('../_store');
const { getArray, setArray } = require('../_kv');

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
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const b = req.body || {};
  const kv = await getArray('mahalo_reservations');
  const maxId = kv.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0);
  const id = maxId > 0 ? maxId + 1 : Date.now();
  const r = {
    id,
    type: 'room',
    date: String(b.check_in || ''),
    check_out: String(b.check_out || ''),
    guests: Number(b.guests || 1),
    location: String(b.room_type || ''),
    name: String(b.name || ''),
    email: String(b.email || ''),
    phone: b.phone || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member,
    checked_out: false
  };
  try {
    const next = [...kv, r];
    await setArray('mahalo_reservations', next);
  } catch (_) {}
  try { reservations.push(r); } catch (_) {}
  res.status(201).json(r);
};
