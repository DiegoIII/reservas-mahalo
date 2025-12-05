const { getUsers, addUser } = require('../lib/server/store');
const bcrypt = require('bcryptjs');

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
    getUsers()
      .then(list => res.status(200).json(list))
      .catch(e => { console.error('users:get:error', e); res.status(500).json({ error: 'Error al obtener usuarios' }); });
    return;
  }
  if (req.method === 'POST') {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim() || email.split('@')[0];
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '').trim();
    if (!email) {
      res.status(400).json({ error: 'email requerido' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'password requerido' });
      return;
    }
    const password_hash = bcrypt.hashSync(password, 10);
    addUser({ email, name, phone, password_hash })
      .then(created => { console.log('users:create', { id: created.id, email }); res.status(201).json(created); })
      .catch(e => { console.error('users:create:error', e); res.status(500).json({ error: 'Error al crear usuario' }); });
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};
