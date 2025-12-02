const { reservations } = require('../_store');
const { getArray, setArray } = require('../_kv');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin) || (origin && origin.endsWith('.vercel.app'))) {
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
    type: 'event',
    date: String(b.date || ''),
    start_time: String(b.start_time || ''),
    end_time: String(b.end_time || ''),
    guests: Number(b.guests || 0),
    location: String(b.venue || ''),
    name: String(b.name || ''),
    email: String(b.email || ''),
    phone: b.phone || null,
    company: b.company || null,
    special_requests: b.special_requests || null,
    member_number: b.member_number || null,
    is_member: !!b.is_member
  };
  try {
    const next = [...kv, r];
    await setArray('mahalo_reservations', next);
  } catch (_) {}
  try { reservations.push(r); } catch (_) {}
  try { console.log('reservations:create:event', { id: r.id, email: r.email, date: r.date, start: r.start_time, end: r.end_time }); } catch (_) {}
  res.status(201).json(r);
};
