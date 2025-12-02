const { ADMIN_EMAIL, addUser, users } = require('./_store');

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
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  if (!email || !password) {
    res.status(400).json({ error: 'email y password requeridos' });
    return;
  }
  const existing = users.find(u => String(u.email).toLowerCase() === email);
  const base = existing || addUser({ email, name: body.name || email.split('@')[0] });
  const user = email === ADMIN_EMAIL ? { ...base, is_admin: 1 } : base;
  res.status(200).json(user);
};

