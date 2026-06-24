-- Migration 003: Conversations

BEGIN;

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id  UUID        REFERENCES users(id) ON DELETE SET NULL,
  is_ai_chat      BOOLEAN     NOT NULL DEFAULT FALSE,
  room_key        VARCHAR(512) NOT NULL UNIQUE,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_conversation_pair
    UNIQUE (client_id, participant_id)
);

CREATE INDEX idx_conversations_client_id      ON conversations (client_id);
CREATE INDEX idx_conversations_participant_id ON conversations (participant_id);
CREATE INDEX idx_conversations_room_key       ON conversations (room_key);
CREATE INDEX idx_conversations_last_message   ON conversations (last_message_at DESC NULLS LAST);

COMMIT;
