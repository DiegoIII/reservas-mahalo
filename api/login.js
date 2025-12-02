const { users, ADMIN_EMAIL, getUserByEmail } = require('./_store');
const { isBlocked, recordFailedAttempt, resetAttempts, issueCsrf, requireCsrf, verifyPassword } = require('./_auth');

const allowed = new Set(['http://localhost:3000', 'https://mahalo-oficial.vercel.app']);
function cors(req, res) {
  const origin = req.headers.origin || '';
  if (allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

module.exports = async (req, res) => {
  cors(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method === 'GET') {
    const token = issueCsrf(res);
    res.status(200).json({ csrf_token: token });
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) { res.status(400).json({ error: 'Credenciales inválidas' }); return; }
  if (!requireCsrf(req, res)) return;

  const key = email;
  try {
    const ok = await verifyPassword(email, password);
    if (!ok) {
      if (await isBlocked(key)) { res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' }); return; }
      await recordFailedAttempt(key);
      console.warn('login:invalid', { email });
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    await resetAttempts(key);
    const user = getUserByEmail(email);
    const finalUser = user.email === ADMIN_EMAIL ? { ...user, is_admin: 1 } : user;
    const { password_hash, ...safe } = finalUser;
    console.info('login:success', { email: safe.email, is_admin: safe.is_admin ? 1 : 0 });
    res.status(200).json(safe);
  } catch (e) {
    console.error('login:error', e);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};
