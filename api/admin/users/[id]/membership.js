const { updateMembership } = require('../../../../lib/server/store');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
}

module.exports = (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const id = (req.query || {}).id;
  const body = req.body || {};
  const num = String(body.member_number || '').trim();
  if (!id || !num) {
    res.status(400).json({ error: 'id y member_number requeridos' });
    return;
  }
  const updated = updateMembership(id, num);
  if (!updated) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  res.status(200).json(updated);
};
