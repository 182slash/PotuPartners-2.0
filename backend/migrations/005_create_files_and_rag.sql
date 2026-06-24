-- Migration 005: Files and RAG documents

BEGIN;

-- ─── Files ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID        REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  uploader_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  original_name   VARCHAR(500) NOT NULL,
  storage_key     TEXT        NOT NULL UNIQUE,
  storage_url     TEXT        NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT      NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_message_id      ON files (message_id);
CREATE INDEX idx_files_conversation_id ON files (conversation_id);
CREATE INDEX idx_files_uploader_id     ON files (uploader_id);

-- ─── RAG Documents ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_documents (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  storage_key     TEXT        NOT NULL UNIQUE,
  mime_type       VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT,
  indexed         BOOLEAN      NOT NULL DEFAULT FALSE,
  indexed_at      TIMESTAMPTZ,
  chunk_count     INT,
  uploaded_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rag_docs_indexed ON rag_documents (indexed);

CREATE TRIGGER rag_docs_updated_at
  BEFORE UPDATE ON rag_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
