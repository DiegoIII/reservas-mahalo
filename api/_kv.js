let client = null;
try {
  const { Redis } = require('@upstash/redis');
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    client = new Redis({ url, token });
  }
} catch (_) {}

async function kvAddReservation(r) {
  if (!client) return false;
  const payload = JSON.stringify(r);
  const max = 3;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      await client.rpush('reservations', payload);
      return true;
    } catch (e) {
      if (attempt === max - 1) {
        console.error('kv:rpush:error', e);
        return false;
      }
      await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }
  return false;
}

async function kvGetReservations() {
  if (!client) return [];
  try {
    const arr = await client.lrange('reservations', 0, -1);
    return arr.map(x => {
      try { return JSON.parse(x); } catch (_) { return null; }
    }).filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function kvCountReservations() {
  if (!client) return 0;
  try {
    const count = await client.llen('reservations');
    return Number(count || 0);
  } catch (_) {
    return 0;
  }
}

async function kvGetReservationsRange(start, stop) {
  if (!client) return [];
  try {
    const arr = await client.lrange('reservations', start, stop);
    return arr.map(x => {
      try { return JSON.parse(x); } catch (_) { return null; }
    }).filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function kvAddNotification(note) {
  if (!client) return false;
  const payload = JSON.stringify({ ...note, ts: Date.now() });
  const max = 3;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      await client.rpush('notifications', payload);
      return true;
    } catch (e) {
      if (attempt === max - 1) {
        console.error('kv:notification:error', e);
        return false;
      }
      await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }
  return false;
}

async function kvUpdateReservation(id, patch) {
  if (!client) return false;
  try {
    const items = await kvGetReservations();
    const idx = items.findIndex(x => Number(x.id) === Number(id));
    if (idx === -1) return false;
    items[idx] = { ...items[idx], ...patch };
    await client.del('reservations');
    if (items.length > 0) {
      await client.rpush('reservations', ...items.map(x => JSON.stringify(x)));
    }
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  kvAddReservation,
  kvGetReservations,
  kvCountReservations,
  kvGetReservationsRange,
  kvAddNotification,
  kvUpdateReservation,
  hasKv: !!client
};
