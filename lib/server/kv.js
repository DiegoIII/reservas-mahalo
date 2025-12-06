const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = !!(baseUrl && token);
if (hasKv) console.log('kv:init:enabled'); else console.warn('kv:init:disabled');

async function kvCommand(args) {
  if (!hasKv) return null;
  try {
    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('kv:command:http_error', resp.status, txt);
      return null;
    }
    const data = await resp.json().catch(() => ({}));
    return data?.result ?? null;
  } catch (e) {
    console.error('kv:command:error', e);
    return null;
  }
}

async function kvAddReservation(r) {
  if (!hasKv) return false;
  const payload = JSON.stringify(r);
  const max = 3;
  for (let attempt = 0; attempt < max; attempt++) {
    const result = await kvCommand(['RPUSH', 'reservations', payload]);
    if (result !== null) return true;
    if (attempt === max - 1) {
      console.error('kv:rpush:error');
      return false;
    }
    await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
  }
  return false;
}

async function kvGetReservations() {
  if (!hasKv) return [];
  const arr = await kvCommand(['LRANGE', 'reservations', 0, -1]);
  if (!Array.isArray(arr)) {
    console.error('kv:lrange:error', arr);
    return [];
  }
  return arr.map(x => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
}

async function kvCountReservations() {
  if (!hasKv) return 0;
  const count = await kvCommand(['LLEN', 'reservations']);
  return Number(count || 0);
}

async function kvGetReservationsRange(start, stop) {
  if (!hasKv) return [];
  const arr = await kvCommand(['LRANGE', 'reservations', Number(start), Number(stop)]);
  if (!Array.isArray(arr)) {
    console.error('kv:lrange:error', arr);
    return [];
  }
  return arr.map(x => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
}

async function kvStatus() {
  try {
    const count = await kvCountReservations();
    return { enabled: hasKv, count: Number(count || 0) };
  } catch (e) {
    console.error('kv:status:error', e);
    return { enabled: hasKv, count: 0 };
  }
}

async function kvAddNotification(note) {
  if (!hasKv) return false;
  const payload = JSON.stringify({ ...note, ts: Date.now() });
  const max = 3;
  for (let attempt = 0; attempt < max; attempt++) {
    const result = await kvCommand(['RPUSH', 'notifications', payload]);
    if (result !== null) return true;
    if (attempt === max - 1) {
      console.error('kv:notification:error');
      return false;
    }
    await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
  }
  return false;
}

async function kvUpdateReservation(id, patch) {
  if (!hasKv) return false;
  try {
    const items = await kvGetReservations();
    const idx = items.findIndex(x => Number(x.id) === Number(id));
    if (idx === -1) return false;
    items[idx] = { ...items[idx], ...patch };
    await kvCommand(['DEL', 'reservations']);
    for (const item of items) {
      await kvCommand(['RPUSH', 'reservations', JSON.stringify(item)]);
    }
    return true;
  } catch (e) {
    console.error('kv:update:error', e);
    return false;
  }
}

// Users helpers
async function kvGetUsers() {
  if (!hasKv) return [];
  const arr = await kvCommand(['LRANGE', 'users', 0, -1]);
  if (!Array.isArray(arr)) {
    console.error('kv:users:lrange:error', arr);
    return [];
  }
  return arr.map(x => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
}

async function kvAddUser(u) {
  if (!hasKv) return false;
  const payload = JSON.stringify(u);
  const max = 3;
  for (let attempt = 0; attempt < max; attempt++) {
    const result = await kvCommand(['RPUSH', 'users', payload]);
    if (result !== null) return true;
    if (attempt === max - 1) {
      console.error('kv:users:rpush:error');
      return false;
    }
    await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
  }
  return false;
}

async function kvUpdateUser(id, patch) {
  if (!hasKv) return false;
  try {
    const items = await kvGetUsers();
    const idx = items.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return false;
    items[idx] = { ...items[idx], ...patch };
    await kvCommand(['DEL', 'users']);
    for (const item of items) {
      await kvCommand(['RPUSH', 'users', JSON.stringify(item)]);
    }
    return true;
  } catch (e) {
    console.error('kv:users:update:error', e);
    return false;
  }
}

async function kvGet(key) { return kvCommand(['GET', key]); }
async function kvSet(key, value) { return kvCommand(['SET', key, value]); }
async function kvDel(key) { return kvCommand(['DEL', key]); }
async function kvExpire(key, seconds) { return kvCommand(['EXPIRE', key, Number(seconds)]); }
async function kvIncr(key) { return kvCommand(['INCR', key]); }

module.exports = {
  kvAddReservation,
  kvGetReservations,
  kvCountReservations,
  kvGetReservationsRange,
  kvAddNotification,
  kvUpdateReservation,
   kvGetUsers,
   kvAddUser,
   kvUpdateUser,
  kvStatus,
  kvGet,
  kvSet,
  kvDel,
  kvExpire,
  kvIncr,
  hasKv
};
