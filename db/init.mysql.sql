-- MySQL init script for reservas app
CREATE DATABASE IF NOT EXISTS `reservas` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reservas`;

-- Users
CREATE TABLE IF NOT EXISTS app_user (
  id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Helper to generate UUIDs via trigger if not provided
DELIMITER //
CREATE TRIGGER before_insert_app_user
BEFORE INSERT ON app_user
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = (SELECT UUID());
  END IF;
END;//
DELIMITER ;

-- Restaurant reservations
CREATE TABLE IF NOT EXISTS restaurant_reservation (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INT NOT NULL,
  table_type VARCHAR(100) NOT NULL,
  location_area VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  special_requests TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (user_id)
);

-- Room reservations
CREATE TABLE IF NOT EXISTS room_reservation (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  special_requests TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (user_id)
);

-- Event reservations
CREATE TABLE IF NOT EXISTS event_reservation (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  event_type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  guests INT NOT NULL,
  venue VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  company VARCHAR(255) NULL,
  special_requests TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (user_id)
);

-- Seed demo user
INSERT IGNORE INTO app_user (id, name, email, phone)
VALUES (UUID(), 'Usuario Demo', 'demo@mahalo.local', '+52 555-000-0000');


