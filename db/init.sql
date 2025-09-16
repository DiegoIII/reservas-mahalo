-- Initialize database schema for reservas app
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table to store app profiles
CREATE TABLE IF NOT EXISTS app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Common reservation fields via domain
CREATE DOMAIN email_text AS TEXT CHECK (VALUE ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

-- Restaurant reservations (daypass)
CREATE TABLE IF NOT EXISTS restaurant_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  table_type TEXT NOT NULL,
  location_area TEXT NOT NULL,
  name TEXT NOT NULL,
  email email_text NOT NULL,
  phone TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Room reservations
CREATE TABLE IF NOT EXISTS room_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  room_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email email_text NOT NULL,
  phone TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

-- Event reservations
CREATE TABLE IF NOT EXISTS event_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  venue TEXT NOT NULL,
  name TEXT NOT NULL,
  email email_text NOT NULL,
  phone TEXT,
  company TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Simple seed for development
INSERT INTO app_user (name, email, phone)
VALUES ('Usuario Demo', 'demo@mahalo.local', '+52 555-000-0000')
ON CONFLICT (email) DO NOTHING;


