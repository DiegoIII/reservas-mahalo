const { checkoutRoom } = require('../../lib/server/store');

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
  const updated = await checkoutRoom(b.reservation_id);
  if (!updated) {
    console.error('checkout:error', { reservation_id: b.reservation_id });
    res.status(404).json({ error: 'Reserva no encontrada' });
    return;
  }
  console.log('checkout:ok', { reservation_id: b.reservation_id });
  res.status(200).json({ ok: true });
};
