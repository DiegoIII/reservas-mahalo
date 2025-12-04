const { getReservations, getReservationsPaged, deleteReservation, clearReservations } = require('../../lib/server/store');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
}

module.exports = async (req, res) => {
  cors(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'DELETE') {
    const token = process.env.ADMIN_API_TOKEN || '';
    if (token && req.headers['x-admin-token'] !== token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const { id, all } = req.query || {};
      if (String(all) === 'true') {
        await clearReservations();
        console.log('reservations:clear');
        res.status(200).json({ ok: true, cleared: true });
        return;
      }
      if (!id) {
        res.status(400).json({ error: 'id requerido' });
        return;
      }
      await deleteReservation(id);
      console.log('reservations:delete', { id });
      res.status(200).json({ ok: true, id: Number(id) });
    } catch (e) {
      console.error('reservations:delete:error', e);
      res.status(500).json({ error: 'Error al borrar reservas' });
    }
    return;
  }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method Not Allowed' }); return; }
  try {
    const { page, pageSize, email, type, status, search } = req.query || {};
    if (page || type || status || search) {
      const result = await getReservationsPaged({ page, pageSize, email, type, status, search });
      res.setHeader('X-Total-Count', String(result.total));
      res.setHeader('X-Page', String(page || 1));
      res.setHeader('X-Page-Size', String(pageSize || 20));
      console.log('reservations:list', { count: result.items.length, total: result.total, page, pageSize });
      res.status(200).json(result.items);
      return;
    }
    // Si solo viene email, devolver todas las reservas del usuario sin paginación
    if (email) {
      const all = await getReservations();
      const mine = all.filter(r => String(r.email).toLowerCase() === String(email).toLowerCase());
      console.log('reservations:list:by_email', { email, count: mine.length });
      res.status(200).json(mine);
      return;
    }
    const items = await getReservations();
    console.log('reservations:list', { count: Array.isArray(items) ? items.length : 0 });
    res.status(200).json(items);
  } catch (e) {
    console.error('reservations:error', e);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};
