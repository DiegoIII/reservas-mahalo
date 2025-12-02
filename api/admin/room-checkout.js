const { checkoutRoom, reservations } = require('../_store');
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
  let kv = await getArray('mahalo_reservations');
  let found = false;
  kv = kv.map(r => {
    if (String(r.id) === String(b.reservation_id) && r.type === 'room') {
      found = true;
      return { ...r, checked_out: true };
    }
    return r;
  });
  if (!found) {
    const updated = checkoutRoom(b.reservation_id);
    if (!updated) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }
    try {
      const fallback = reservations.map(r => (String(r.id) === String(b.reservation_id) && r.type === 'room') ? { ...r, checked_out: true } : r);
      await setArray('mahalo_reservations', fallback);
    } catch (_) {}
    res.status(200).json({ ok: true });
    return;
  }
  try { await setArray('mahalo_reservations', kv); } catch (_) {}
  res.status(200).json({ ok: true });
};
