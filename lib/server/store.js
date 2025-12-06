let nextUserId = 3;
let nextReservationId = 1001;
const { kvAddReservation, kvGetReservations, kvCountReservations, kvGetReservationsRange, kvAddNotification, kvUpdateReservation, kvGetUsers, kvAddUser, kvUpdateUser, hasKv } = require('./kv');

const ADMIN_EMAIL = 'clubdeplaya@mahaloclubofficial.com';

const bcrypt = require('bcryptjs');
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || (process.env.ADMIN_PASSWORD ? bcrypt.hashSync(String(process.env.ADMIN_PASSWORD), 10) : bcrypt.hashSync('admin123', 10));
const GUEST_PASSWORD_HASH = process.env.GUEST_PASSWORD_HASH || bcrypt.hashSync('guest123', 10);
const ESTABLISHMENT_TZ = process.env.ESTABLISHMENT_TZ || 'America/Mexico_City';

const users = [
  { id: 1, email: ADMIN_EMAIL, name: 'Administrador', phone: '7444813854', is_member: true, member_number: 'A0001', password_hash: ADMIN_PASSWORD_HASH },
  { id: 2, email: 'invitado@example.com', name: 'Invitado', phone: '0000000000', is_member: false, password_hash: GUEST_PASSWORD_HASH }
];

const reservations = [
  {
    id: 1000,
    type: 'restaurant',
    date: new Date().toISOString().slice(0, 10),
    time: '13:00',
    location: 'area-restauran',
    table_type: 'standard',
    guests: 4,
    name: 'Invitado',
    email: 'invitado@example.com'
  },
  {
    id: 999,
    type: 'room',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    check_out: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    location: 'room2',
    guests: 2,
    name: 'Administrador',
    email: ADMIN_EMAIL,
    checked_out: false
  },
  {
    id: 998,
    type: 'event',
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    start_time: '18:00',
    end_time: '23:00',
    location: 'salon-eventos',
    guests: 120,
    name: 'Invitado',
    email: 'invitado@example.com'
  }
];

let prices = {
  events: {
    decorated: [
      { min: 1, max: 50, price: 20000 },
      { min: 51, max: 100, price: 28000 },
      { min: 101, max: 150, price: 35000 },
      { min: 151, max: 200, price: 40000 }
    ],
    withoutDecoration: [
      { min: 1, max: 50, price: 15000 },
      { min: 51, max: 100, price: 18000 },
      { min: 101, max: 300, price: 25000 }
    ],
    extraHourRates: {
      decorated: 5000,
      withoutDecoration: 3000
    }
  },
  rooms: {
    room1: 120,
    room2: 100,
    room3: 80,
    room4: 80,
    room5: 60
  },
  restaurant: {
    daypass: {
      simple: 250,
      'food-250': 400,
      'food-drinks-500': 500
    },
    tables: {
      standard: 25,
      window: 35,
      booth: 45
    }
  }
};

let seasons = [];

function getPrices() {
  return prices;
}

function setPrices(newPrices) {
  if (!newPrices || typeof newPrices !== 'object') return;
  if (newPrices.events && typeof newPrices.events === 'object') {
    prices.events = newPrices.events;
  }
  if (newPrices.rooms && typeof newPrices.rooms === 'object') {
    prices.rooms = newPrices.rooms;
  }
  if (newPrices.restaurant && typeof newPrices.restaurant === 'object') {
    prices.restaurant = newPrices.restaurant;
  }
  if (hasKv) {
    const payload = JSON.stringify(prices);
    require('./kv').kvSet('prices', payload).catch((e) => console.error('kv:prices:set:error', e));
  }
}

async function addUser(user) {
  const id = hasKv ? String(Date.now()) : nextUserId++;
  const u = { id, is_member: false, password_hash: user.password_hash || bcrypt.hashSync(String(user.password || 'changeme'), 10), ...user };
  users.push(u);
  if (hasKv) {
    const ok = await kvAddUser(u);
    if (!ok) console.error('kv:users:add:error', { id: u.id, email: u.email });
  }
  return u;
}

async function updateMembership(id, member_number) {
  const idx = users.findIndex(u => String(u.id) === String(id));
  if (idx === -1) {
    if (hasKv) {
      const kvUsers = await kvGetUsers();
      const kvIdx = kvUsers.findIndex(u => String(u.id) === String(id));
      if (kvIdx === -1) return null;
      const updatedKvUser = { ...kvUsers[kvIdx], is_member: true, member_number };
      const ok = await kvUpdateUser(id, { is_member: true, member_number });
      if (!ok) console.error('kv:users:update:error', { id });
      return updatedKvUser;
    }
    return null;
  }
  users[idx] = { ...users[idx], is_member: true, member_number };
  if (hasKv) {
    const ok = await kvUpdateUser(id, { is_member: true, member_number });
    if (!ok) console.error('kv:users:update:error', { id });
  }
  return users[idx];
}

async function addReservation(res) {
  if (!res || typeof res !== 'object') throw new Error('Datos de reserva inválidos');
  if (!res.email || !res.name) throw new Error('Faltan campos requeridos');
  if (!res.type) throw new Error('Tipo de reserva requerido');
  const id = nextReservationId++;
  const r = { id, ...res };
  reservations.push(r);
  if (hasKv) {
    const ok = await kvAddReservation(r);
    if (!ok) console.error('kv:add:error', { id: r.id, email: r.email, type: r.type });
  }
  return r;
}

function isReservationExpired(r, now = new Date()) {
  try {
    if (!r || typeof r !== 'object') return false;
    const t = String(r.type || '').toLowerCase();
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: ESTABLISHMENT_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const parts = fmt.formatToParts(now);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const yyyyMmDd = `${map.year}-${map.month}-${map.day}`;
    const hhmm = `${map.hour}:${map.minute}`;
    if (t === 'room') {
      if (r.checked_out === true) return true;
      if (r.check_out) {
        const co = String(r.check_out).slice(0,10);
        return co < yyyyMmDd;
      }
      return false;
    }
    if (t === 'restaurant') {
      if (!r.date || !r.time) return false;
      const d = String(r.date).slice(0,10);
      const tm = String(r.time).padStart(5,'0');
      if (d < yyyyMmDd) return true;
      if (d > yyyyMmDd) return false;
      return tm < hhmm;
    }
    if (t === 'event') {
      if (!r.date) return false;
      const d = String(r.date).slice(0,10);
      const end = String(r.end_time || r.time || '23:59').padStart(5,'0');
      if (d < yyyyMmDd) return true;
      if (d > yyyyMmDd) return false;
      return end < hhmm;
    }
    return false;
  } catch (_) {
    return false;
  }
}

async function cleanupExpiredReservations() {
  const now = new Date();
  const list = await getReservations();
  const expired = list.filter(r => isReservationExpired(r, now));
  if (!expired.length) {
    console.log('[cleanup] no expired reservations');
    return { removed: 0, ids: [] };
  }
  console.log('[cleanup] removing', expired.length, 'reservations');
  for (const r of expired) {
    await deleteReservation(r.id);
  }
  try {
    await kvAddNotification({
      type: 'cleanup',
      title: 'Limpieza automática de reservas',
      message: `Se eliminaron ${expired.length} reservas caducadas`,
      severity: 'info'
    });
  } catch (e) {
    console.error('[cleanup] notify:error', e);
  }
  return { removed: expired.length, ids: expired.map(r => r.id) };
}

async function checkoutRoom(reservation_id) {
  const idx = reservations.findIndex(r => r.type === 'room' && Number(r.id) === Number(reservation_id));
  if (idx === -1) {
    if (hasKv) {
      await kvUpdateReservation(reservation_id, { checked_out: true });
    }
    return null;
  }
  reservations[idx] = { ...reservations[idx], checked_out: true };
  if (hasKv) await kvUpdateReservation(reservation_id, { checked_out: true });
  return reservations[idx];
}

async function getReservations() {
  if (hasKv) {
    const kvItems = await kvGetReservations();
    return kvItems.length ? kvItems : reservations;
  }
  return reservations;
}

async function getReservationsPaged({ page = 1, pageSize = 20, email, type, status, search }) {
  const p = Math.max(1, Number(page || 1));
  const ps = Math.max(1, Math.min(100, Number(pageSize || 20)));
  let items = [];
  let total = 0;
  if (hasKv) {
    total = await kvCountReservations();
    const start = (p - 1) * ps;
    const stop = start + ps - 1;
    items = await kvGetReservationsRange(start, stop);
  } else {
    items = reservations.slice((p - 1) * ps, p * ps);
    total = reservations.length;
  }
  const filtered = items.filter(r => {
    if (email && String(r.email).toLowerCase() !== String(email).toLowerCase()) return false;
    if (type && r.type !== type) return false;
    if (status && r.status !== status) return false;
    if (search) {
      const s = String(search).toLowerCase();
      const blob = JSON.stringify(r).toLowerCase();
      if (!blob.includes(s)) return false;
    }
    return true;
  });
  return { items: filtered, total };
}

async function deleteReservation(id) {
  const rid = Number(id);
  const idx = reservations.findIndex(r => Number(r.id) === rid);
  if (idx !== -1) {
    reservations.splice(idx, 1);
  }
  if (hasKv) {
    const items = await kvGetReservations();
    const filtered = items.filter(r => Number(r.id) !== rid);
    await require('./kv').kvDel('reservations');
    for (const item of filtered) {
      await kvAddReservation(item);
    }
  }
  return true;
}

async function clearReservations() {
  reservations.length = 0;
  if (hasKv) {
    await require('./kv').kvDel('reservations');
  }
  return true;
}

module.exports = {
  ADMIN_EMAIL,
  users,
  getUsers,
  getUserByEmail: async (email) => {
    const list = await getUsers();
    return list.find(u => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
  },
  reservations,
  getPrices: () => prices,
  setPrices,
  getSeasons: () => seasons,
  setSeasons: (s) => {
    seasons = Array.isArray(s) ? s : [];
    if (hasKv) {
      const payload = JSON.stringify(seasons);
      require('./kv').kvSet('seasons', payload).catch((e) => console.error('kv:seasons:set:error', e));
    }
  },
  addUser,
  updateMembership,
  addReservation,
  checkoutRoom,
  getReservations,
  getReservationsPaged,
  addNotification: kvAddNotification,
  deleteReservation,
  clearReservations,
  isReservationExpired,
  cleanupExpiredReservations
};
async function getUsers() {
  if (hasKv) {
    const list = await kvGetUsers();
    const map = new Map(Array.isArray(list) ? list.map(u => [String(u.email).toLowerCase(), u]) : []);
    for (const u of users) {
      const key = String(u.email).toLowerCase();
      if (!map.has(key)) map.set(key, u);
    }
    return Array.from(map.values());
  }
  return users;
}

// Bootstrap from Upstash on init
(async () => {
  try {
    if (hasKv) {
      const kv = require('./kv');
      const p = await kv.kvGet('prices');
      if (p) {
        try { prices = JSON.parse(p); } catch (_) {}
      }
      const s = await kv.kvGet('seasons');
      if (s) {
        try { seasons = JSON.parse(s); } catch (_) {}
      }
    }
  } catch (e) {
    console.error('kv:bootstrap:error', e);
  }
})();
