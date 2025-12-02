const { ADMIN_EMAIL, addUser, users } = require('./_store');
const { getArray, setArray } = require('./_kv');

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
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  if (!email || !password) {
    res.status(400).json({ error: 'email y password requeridos' });
    return;
  }
  let existing = users.find(u => String(u.email).toLowerCase() === email);
  if (!existing) {
    const kvUsers = await getArray('mahalo_users');
    existing = kvUsers.find(u => String(u.email || '').toLowerCase() === email) || null;
  }
  const base = existing || addUser({ email, name: body.name || email.split('@')[0] });
  if (!existing) {
    try {
      const arr = await getArray('mahalo_users');
      const next = [...arr.filter(u => String(u.email || '').toLowerCase() !== email), base];
      await setArray('mahalo_users', next);
    } catch (_) {}
  }
  const user = email === ADMIN_EMAIL ? { ...base, is_admin: 1 } : base;
  res.status(200).json(user);
};
