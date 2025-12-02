const { users, addUser } = require('./_store');

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

module.exports = (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json(users);
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
    res.status(201).json(created);
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};

