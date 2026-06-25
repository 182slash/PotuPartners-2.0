import { query } from '../config/database';
import { logger } from '../utils/logger';

export async function initDb(): Promise<void> {
  logger.info('Initializing database schema...');

  await query(`GRANT ALL ON SCHEMA public TO current_user`);
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  await query(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('client', 'associate', 'partner', 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
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
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_users_email     ON users (email)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_role      ON users (role) WHERE is_active = TRUE`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_is_online ON users (is_online) WHERE is_active = TRUE`);

  await query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await query(`
    DO $$ BEGIN
      CREATE TRIGGER users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash  TEXT        NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens (user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at)`);

  await query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant_id  UUID         REFERENCES users(id) ON DELETE SET NULL,
      is_ai_chat      BOOLEAN      NOT NULL DEFAULT FALSE,
      room_key        VARCHAR(512) NOT NULL UNIQUE,
      last_message_at TIMESTAMPTZ,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_conversation_pair UNIQUE (client_id, participant_id)
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_client_id      ON conversations (client_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_participant_id ON conversations (participant_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_room_key       ON conversations (room_key)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_last_message   ON conversations (last_message_at DESC NULLS LAST)`);

  await query(`
    DO $$ BEGIN
      CREATE TYPE message_type AS ENUM ('text', 'file', 'ai_response');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id       UUID         REFERENCES users(id) ON DELETE SET NULL,
      content         TEXT,
      message_type    message_type NOT NULL DEFAULT 'text',
      is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
      deleted_at      TIMESTAMPTZ,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      CONSTRAINT content_or_file CHECK (content IS NOT NULL OR message_type = 'file')
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at ASC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages (sender_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_messages_unread       ON messages (conversation_id, is_read) WHERE is_read = FALSE AND deleted_at IS NULL`);

  await query(`
    CREATE TABLE IF NOT EXISTS files (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id      UUID         REFERENCES messages(id) ON DELETE CASCADE,
      conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      uploader_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
      original_name   VARCHAR(500) NOT NULL,
      storage_key     TEXT         NOT NULL UNIQUE,
      storage_url     TEXT         NOT NULL,
      mime_type       VARCHAR(100) NOT NULL,
      file_size_bytes BIGINT       NOT NULL,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_files_message_id      ON files (message_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_files_conversation_id ON files (conversation_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_files_uploader_id     ON files (uploader_id)`);

  await query(`
    CREATE TABLE IF NOT EXISTS rag_documents (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      title           VARCHAR(500) NOT NULL,
      description     TEXT,
      storage_key     TEXT         NOT NULL UNIQUE,
      mime_type       VARCHAR(100) NOT NULL,
      file_size_bytes BIGINT,
      indexed         BOOLEAN      NOT NULL DEFAULT FALSE,
      indexed_at      TIMESTAMPTZ,
      chunk_count     INT,
      uploaded_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_rag_docs_indexed ON rag_documents (indexed)`);

  await query(`
    DO $$ BEGIN
      CREATE TRIGGER rag_docs_updated_at
        BEFORE UPDATE ON rag_documents
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  logger.info('✅  Database schema ready');
}