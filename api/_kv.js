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
  try {
    await client.rpush('reservations', JSON.stringify(r));
    return true;
  } catch (_) {
    return false;
  }
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
  kvUpdateReservation,
  async kvGetUserByEmail(email) {
    if (!client) return null;
    try {
      const list = await client.lrange('users', 0, -1);
      const lower = String(email || '').toLowerCase();
      for (const raw of list) {
        try {
          const u = JSON.parse(raw);
          if (String(u.email || '').toLowerCase() === lower) return u;
        } catch (_) {}
      }
      return null;
    } catch (_) {
      return null;
    }
  },
  async kvUpsertUser(user) {
    if (!client) return false;
    try {
      const list = await client.lrange('users', 0, -1);
      const lower = String(user.email || '').toLowerCase();
      let items = [];
      for (const raw of list) {
        try {
          const u = JSON.parse(raw);
          if (String(u.email || '').toLowerCase() === lower) continue;
          items.push(u);
        } catch (_) {}
      }
      items.push(user);
      await client.del('users');
      if (items.length > 0) {
        await client.rpush('users', ...items.map(x => JSON.stringify(x)));
      }
      return true;
    } catch (_) {
      return false;
    }
  },
  async kvListUsers() {
    if (!client) return [];
    try {
      const list = await client.lrange('users', 0, -1);
      return list.map(raw => { try { return JSON.parse(raw); } catch (_) { return null; } }).filter(Boolean);
    } catch (_) {
      return [];
    }
  },
  hasKv: !!client
};
