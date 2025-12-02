const { getSeasons, setSeasons } = require('../_store');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
}

module.exports = (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json(getSeasons());
    return;
  }
  if (req.method === 'PUT') {
    const body = req.body || {};
    const seasons = Array.isArray(body) ? body : (body.seasons || []);
    setSeasons(seasons);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};

