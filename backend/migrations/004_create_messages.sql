-- Migration 004: Messages

BEGIN;

CREATE TYPE message_type AS ENUM ('text', 'file', 'ai_response');

CREATE TABLE IF NOT EXISTS messages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID         REFERENCES users(id) ON DELETE SET NULL,
  content         TEXT,
  message_type    message_type NOT NULL DEFAULT 'text',
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT content_or_file CHECK (
    content IS NOT NULL OR message_type = 'file'
  )
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at ASC);
CREATE INDEX idx_messages_sender       ON messages (sender_id);
CREATE INDEX idx_messages_unread       ON messages (conversation_id, is_read)
  WHERE is_read = FALSE AND deleted_at IS NULL;

COMMIT;
