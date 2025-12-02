const { users, addUser } = require('./_store');
const { getArray, setArray } = require('./_kv');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

module.exports = async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    const kvUsers = await getArray('mahalo_users');
    const merged = Array.isArray(kvUsers) && kvUsers.length > 0 ? kvUsers : users;
    res.status(200).json(merged);
    return;
  }
  if (req.method === 'POST') {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim() || email.split('@')[0];
    const phone = String(body.phone || '').trim();
    if (!email) {
      res.status(400).json({ error: 'email requerido' });
      return;
    }
    const created = addUser({ email, name, phone });
    try {
      const arr = await getArray('mahalo_users');
      const idx = arr.findIndex(u => String(u.email || '').toLowerCase() === email);
      const next = idx >= 0 ? arr.map(u => (String(u.email || '').toLowerCase() === email ? created : u)) : [...arr, created];
      await setArray('mahalo_users', next);
    } catch (_) {}
    res.status(201).json(created);
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};
