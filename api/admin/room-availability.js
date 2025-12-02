const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin) || (origin && origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

module.exports = (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const q = req.query || {};
  const checkOut = q.check_out || '';
  let next = null;
  if (checkOut) {
    try {
      const d = new Date(String(checkOut));
      d.setDate(d.getDate() + 1);
      next = d.toISOString().slice(0, 10);
    } catch (_) {}
  }
  const availability = { room1: true, room2: false, room3: true, room4: true, room5: true };
  const info = { room2: { nextAvailable: next || new Date(Date.now() + 86400000).toISOString().slice(0, 10) } };
  res.status(200).json({ availability, info });
};
