let nextUserId = 3;
let nextReservationId = 1001;
const { kvAddReservation, kvGetReservations, kvCountReservations, kvGetReservationsRange, kvAddNotification, kvUpdateReservation, hasKv } = require('./kv');

const ADMIN_EMAIL = 'clubdeplaya@mahaloclubofficial.com';

const bcrypt = require('bcryptjs');
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);
const GUEST_PASSWORD_HASH = process.env.GUEST_PASSWORD_HASH || bcrypt.hashSync('guest123', 10);

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

const prices = {
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
}

function addUser(user) {
  const id = nextUserId++;
  const u = { id, is_member: false, password_hash: user.password_hash || bcrypt.hashSync(String(user.password || 'changeme'), 10), ...user };
  users.push(u);
  return u;
}

function updateMembership(id, member_number) {
  const idx = users.findIndex(u => Number(u.id) === Number(id));
  if (idx === -1) return null;
  users[idx] = { ...users[idx], is_member: true, member_number };
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

module.exports = {
  ADMIN_EMAIL,
  users,
  getUserByEmail: (email) => users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase()) || null,
  reservations,
  prices,
  getPrices,
  setPrices,
  getSeasons: () => seasons,
  setSeasons: (s) => { seasons = Array.isArray(s) ? s : []; },
  addUser,
  updateMembership,
  addReservation,
  checkoutRoom,
  getReservations,
  getReservationsPaged,
  addNotification: kvAddNotification
};
