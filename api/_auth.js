const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getUserByEmail } = require('./_store');
const { Redis } = (() => { try { return require('@upstash/redis'); } catch (_) { return {}; } })();

let client = null;
try {
  if (Redis && Redis.Redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    client = new Redis.Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  }
} catch (_) {}

const MAX_ATTEMPTS = 5;
const BLOCK_TTL_SEC = 15 * 60;
const attemptsMem = new Map();

async function isBlocked(key) {
  if (client) {
    try {
      const count = await client.get(`login:fail:${key}`);
      return Number(count || 0) >= MAX_ATTEMPTS;
    } catch (_) {}
  }
  const rec = attemptsMem.get(key);
  if (!rec) return false;
  const { count, until } = rec;
  if (until && Date.now() < until) return count >= MAX_ATTEMPTS;
  return false;
}

async function recordFailedAttempt(key) {
  if (client) {
    try {
      const count = await client.incr(`login:fail:${key}`);
      if (Number(count) === 1) await client.expire(`login:fail:${key}`, BLOCK_TTL_SEC);
      return;
    } catch (_) {}
  }
  const rec = attemptsMem.get(key) || { count: 0, until: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.until = Date.now() + BLOCK_TTL_SEC * 1000;
  }
  attemptsMem.set(key, rec);
}

async function resetAttempts(key) {
  if (client) {
    try { await client.del(`login:fail:${key}`); } catch (_) {}
  }
  attemptsMem.delete(key);
}

function issueCsrf(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.setHeader('Set-Cookie', `csrf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Secure`);
  return token;
}

function requireCsrf(req, res) {
  const header = req.headers['x-csrf-token'];
  const cookie = String(req.headers.cookie || '');
  const match = cookie.match(/csrf_token=([^;]+)/);
  const cookieToken = match ? match[1] : '';
  if (!header || !cookieToken || header !== cookieToken) {
    res.status(403).json({ error: 'CSRF token inválido' });
    return false;
  }
  return true;
}

async function verifyPassword(email, password) {
  const user = getUserByEmail(email);
  if (!user || !user.password_hash) return false;
  return bcrypt.compare(String(password), String(user.password_hash));
}

module.exports = {
  isBlocked,
  recordFailedAttempt,
  resetAttempts,
  issueCsrf,
  requireCsrf,
  verifyPassword,
};

