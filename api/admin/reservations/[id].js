const { deleteReservation } = require('../../_store');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
}

module.exports = async (req, res) => {
  cors(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'DELETE') { res.status(405).json({ error: 'Method Not Allowed' }); return; }
  const id = (req.query || {}).id;
  if (!id) { res.status(400).json({ error: 'id requerido' }); return; }
  try {
    const deleted = await deleteReservation(id);
    if (!deleted) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    res.status(200).json({ ok: true, id: Number(id) });
  } catch (e) {
    console.error('reservations:delete:error', e);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
};

