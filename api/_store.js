let nextUserId = 3;
let nextReservationId = 1001;
const { kvAddReservation, kvGetReservations, kvUpdateReservation, hasKv } = require('./_kv');

const ADMIN_EMAIL = 'clubdeplaya@mahaloclubofficial.com';

const users = [
  { id: 1, email: ADMIN_EMAIL, name: 'Administrador', phone: '7444813854', is_member: true, member_number: 'A0001' },
  { id: 2, email: 'invitado@example.com', name: 'Invitado', phone: '0000000000', is_member: false }
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
  const u = { id, is_member: false, ...user };
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
  const id = nextReservationId++;
  const r = { id, ...res };
  reservations.push(r);
  if (hasKv) await kvAddReservation(r);
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

module.exports = {
  ADMIN_EMAIL,
  users,
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
  getReservations
};
