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
  try {
    // add is_admin column if missing
    await pool.query("ALTER TABLE app_user ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0");
  } catch (err) {
    // Column might already exist, ignore error
    console.log('Column is_admin might already exist:', err.message);
  }
  
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

// List users (safe fields only)
app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, is_admin, created_at FROM app_user ORDER BY created_at DESC'
    );
    res.json(rows);
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
      `SELECT 'restaurant' AS type, id, date, time AS start_time, NULL AS end_time, party_size AS guests, location_area AS location, name, email, phone, created_at
       FROM restaurant_reservation WHERE date >= CURDATE() ORDER BY date, time`
    );
    const [rooms] = await pool.query(
      `SELECT 'room' AS type, id, check_in AS date, check_out, NULL AS start_time, NULL AS end_time, guests, room_type AS location, name, email, phone, checked_out, checkout_time, created_at
       FROM room_reservation WHERE check_in >= CURDATE() ORDER BY check_in`
    );
    const [events] = await pool.query(
      `SELECT 'event' AS type, id, date, start_time, end_time, guests, venue AS location, name, email, phone, created_at
       FROM event_reservation WHERE date >= CURDATE() ORDER BY date, start_time`
    );
    res.json([ ...restaurant, ...rooms, ...events ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: only future events
app.get('/api/admin/events', async (_req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT id, event_type, date, start_time, end_time, guests, venue, name, email, phone, company, special_requests, created_at
       FROM event_reservation
       WHERE date >= CURDATE()
       ORDER BY date, start_time`
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/restaurant', async (req, res) => {
  const { date, time, party_size, table_type, location_area, name, email, phone, special_requests } = req.body || {};
  try {
    console.log('[POST] /api/admin/restaurant', { date, time, party_size, table_type, location_area, name, email });
    await pool.query(
      `INSERT INTO restaurant_reservation (id, date, time, party_size, table_type, location_area, name, email, phone, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, time, party_size, table_type, location_area, name, email, phone || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('restaurant insert error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Check room availability
app.get('/api/admin/room-availability', async (req, res) => {
  const { check_in, check_out } = req.query;
  if (!check_in || !check_out) {
    return res.status(400).json({ error: 'check_in and check_out are required' });
  }
  
  try {
    // Get all room types
    const roomTypes = [
      { id: 'room1', roomNumber: 1 },
      { id: 'room2', roomNumber: 2 },
      { id: 'room3', roomNumber: 3 },
      { id: 'room4', roomNumber: 4 },
      { id: 'room5', roomNumber: 5 }
    ];
    
    const availability = {};
    const info = {};
    
    for (const room of roomTypes) {
      // Check for overlapping reservations
      const [conflicts] = await pool.query(
        `SELECT COUNT(*) as count FROM room_reservation 
         WHERE room_type = ? 
         AND checked_out = 0
         AND (
           (check_in <= ? AND check_out > ?) OR 
           (check_in < ? AND check_out >= ?) OR 
           (check_in >= ? AND check_out <= ?)
         )`,
        [room.id, check_in, check_in, check_out, check_out, check_in, check_out]
      );
      
      const isAvailable = conflicts[0].count === 0;
      availability[room.id] = isAvailable;
      
      // If not available, find next available date
      if (!isAvailable) {
        const [nextAvailable] = await pool.query(
          `SELECT MIN(check_out) as next_date FROM room_reservation 
           WHERE room_type = ? 
           AND checked_out = 0
           AND check_out > ?`,
          [room.id, check_out]
        );
        
        if (nextAvailable[0].next_date) {
          const nextDate = new Date(nextAvailable[0].next_date);
          info[room.id] = {
            nextAvailable: nextDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })
          };
        }
      }
    }
    
    res.json({ availability, info });
  } catch (err) {
    console.error('availability check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/room', async (req, res) => {
  const { check_in, check_out, guests, room_type, name, email, phone, special_requests } = req.body || {};
  try {
    console.log('[POST] /api/admin/room', { check_in, check_out, guests, room_type, name, email });
    
    // Enforce guest capacity per room and global rules
    const roomCapacities = {
      room1: 6, // inherent capacity
      room2: 5,
      room3: 4,
      room4: 4,
      room5: 2
    };
    // Rule caps: default 4, room1 up to 6, room2 up to 5
    let ruleCap = 4;
    if (room_type === 'room1') ruleCap = 6;
    else if (room_type === 'room2') ruleCap = 5;

    const inherentCap = roomCapacities[room_type] ?? 4;
    const effectiveCap = Math.min(ruleCap, inherentCap);
    if (!Number.isFinite(Number(guests)) || Number(guests) < 1) {
      return res.status(400).json({ error: 'Número de huéspedes inválido' });
    }
    if (Number(guests) > effectiveCap) {
      return res.status(400).json({ error: `La habitación seleccionada permite máximo ${effectiveCap} huéspedes` });
    }

    // Check for conflicts before inserting (only check non-checked-out reservations)
    const [conflicts] = await pool.query(
      `SELECT COUNT(*) as count FROM room_reservation 
       WHERE room_type = ? 
       AND checked_out = 0
       AND (
         (check_in <= ? AND check_out > ?) OR 
         (check_in < ? AND check_out >= ?) OR 
         (check_in >= ? AND check_out <= ?)
       )`,
      [room_type, check_in, check_in, check_out, check_out, check_in, check_out]
    );
    
    if (conflicts[0].count > 0) {
      return res.status(409).json({ error: 'La habitación no está disponible para las fechas seleccionadas' });
    }
    
    await pool.query(
      `INSERT INTO room_reservation (id, check_in, check_out, guests, room_type, name, email, phone, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [check_in, check_out, guests, room_type, name, email, phone || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('room insert error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/event', async (req, res) => {
  const { event_type, date, start_time, end_time, guests, venue, name, email, phone, company, special_requests } = req.body || {};
  try {
    console.log('[POST] /api/admin/event', { event_type, date, start_time, end_time, guests, venue, name, email });
    await pool.query(
      `INSERT INTO event_reservation (id, event_type, date, start_time, end_time, guests, venue, name, email, phone, company, special_requests)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_type, date, start_time, end_time, guests, venue, name, email, phone || null, company || null, special_requests || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('event insert error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Checkout room reservation
app.post('/api/admin/room-checkout', async (req, res) => {
  const { reservation_id } = req.body || {};
  if (!reservation_id) {
    return res.status(400).json({ error: 'reservation_id is required' });
  }
  
  try {
    console.log('[POST] /api/admin/room-checkout', { reservation_id });
    
    // Update the reservation to mark as checked out
    const [result] = await pool.query(
      `UPDATE room_reservation 
       SET checked_out = 1, checkout_time = NOW() 
       WHERE id = ? AND checked_out = 0`,
      [reservation_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found or already checked out' });
    }
    
    res.status(200).json({ ok: true, message: 'Checkout successful' });
  } catch (err) {
    console.error('room checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});


