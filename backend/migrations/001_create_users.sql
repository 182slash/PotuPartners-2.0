-- Migration 001: Create users table
-- Run: psql $DATABASE_URL -f migrations/001_create_users.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('client', 'associate', 'partner', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  role          user_role    NOT NULL DEFAULT 'client',
  avatar_url    TEXT,
  title         VARCHAR(200),
  bio           TEXT,
  specialty     VARCHAR(500),
  linkedin_url  TEXT,
  is_online     BOOLEAN      NOT NULL DEFAULT FALSE,
  last_seen     TIMESTAMPTZ,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_role      ON users (role) WHERE is_active = TRUE;
CREATE INDEX idx_users_is_online ON users (is_online) WHERE is_active = TRUE;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
