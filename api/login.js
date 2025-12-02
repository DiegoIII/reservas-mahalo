const { ADMIN_EMAIL, addUser, getUserByName } = require('./_store');

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
  const body = req.body || {};
  const username = String(body.username || body.name || '').trim();
  const password = String(body.password || '').trim();
  if (!username || !password) {
    res.status(400).json({ error: 'usuario y password requeridos' });
    return;
  }
  try {
    const existing = await getUserByName(username);
    const base = existing || addUser({ name: username, email: body.email || '' });
    const user = base.email === ADMIN_EMAIL ? { ...base, is_admin: 1 } : base;
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
