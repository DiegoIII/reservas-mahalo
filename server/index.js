import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();
const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'mahalo',
  password: process.env.MYSQL_PASSWORD || 'mahalo_dev',
  database: process.env.MYSQL_DATABASE || 'reservas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ensure admin user exists and schema is up to date
async function ensureAdminAndSchema() {
  // add is_admin column if missing
  await pool.query("ALTER TABLE app_user ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) NOT NULL DEFAULT 0");
  const adminEmail = 'clubdeplaya@mahaloclubofficial.com';
  const adminPassword = 'mahaloadminoficial';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO app_user (id, name, email, phone, password_hash, is_admin)
     VALUES (UUID(), 'Admin', ?, NULL, ?, 1)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), is_admin = 1`,
    [adminEmail, passwordHash]
  );
}

ensureAdminAndSchema().catch((e) => console.error('Admin/schema init error:', e.message));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Signup: create or update user with password
app.post('/api/users', async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO app_user (id, name, email, phone, password_hash)
       VALUES (UUID(), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), password_hash = VALUES(password_hash)`,
      [name, email, phone || null, passwordHash]
    );
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, created_at FROM app_user WHERE email = ?',
      [email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login: verify email + password
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, password_hash, is_admin, created_at FROM app_user WHERE email = ?', [email]);
    const row = rows[0];
    if (!row || !row.password_hash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const { password_hash, ...safe } = row;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoints (simple, without JWT for now)
app.get('/api/admin/reservations', async (_req, res) => {
  try {
    const [restaurant] = await pool.query(
      `SELECT 'restaurant' AS type, id, date, time AS start_time, NULL AS end_time, party_size AS guests, location_area AS location, name, email, created_at
       FROM restaurant_reservation WHERE date >= CURDATE() ORDER BY date, time`
    );
    const [rooms] = await pool.query(
      `SELECT 'room' AS type, id, check_in AS date, NULL AS start_time, NULL AS end_time, guests, room_type AS location, name, email, created_at
       FROM room_reservation WHERE check_in >= CURDATE() ORDER BY check_in`
    );
    const [events] = await pool.query(
      `SELECT 'event' AS type, id, date, start_time, end_time, guests, venue AS location, name, email, created_at
       FROM event_reservation WHERE date >= CURDATE() ORDER BY date, start_time`
    );
    res.json([ ...restaurant, ...rooms, ...events ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/restaurant', async (req, res) => {
  const { date, time, party_size, table_type, location_area, name, email, phone, special_requests } = req.body || {};
  try {
    await pool.query(
      `INSERT INTO restaurant_reservation (id, date, time, party_size, table_type, location_area, name, email, phone, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, time, party_size, table_type, location_area, name, email, phone || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/room', async (req, res) => {
  const { check_in, check_out, guests, room_type, name, email, phone, special_requests } = req.body || {};
  try {
    await pool.query(
      `INSERT INTO room_reservation (id, check_in, check_out, guests, room_type, name, email, phone, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [check_in, check_out, guests, room_type, name, email, phone || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/event', async (req, res) => {
  const { event_type, date, start_time, end_time, guests, venue, name, email, phone, company, special_requests } = req.body || {};
  try {
    await pool.query(
      `INSERT INTO event_reservation (id, event_type, date, start_time, end_time, guests, venue, name, email, phone, company, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_type, date, start_time, end_time, guests, venue, name, email, phone || null, company || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});


