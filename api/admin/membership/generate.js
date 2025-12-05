const { users } = require('../../../lib/server/store');

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
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }
  const body = req.body || {};
  const n = Number(body.digits || 6);
  if (!Number.isInteger(n) || n < 4 || n > 10) { res.status(400).json({ error: 'digits debe ser un entero entre 4 y 10' }); return; }
  let attempt = 0;
  const maxAttempts = 100;
  while (attempt < maxAttempts) {
    const candidate = String(Math.floor(Math.random() * Math.pow(10, n))).padStart(n, '0');
    const exists = users.some(u => String(u.member_number || '') === candidate);
    if (!exists) { res.status(200).json({ member_number: candidate }); return; }
    attempt++;
  }
  res.status(500).json({ error: 'No se pudo generar un número único, intenta nuevamente' });
};
