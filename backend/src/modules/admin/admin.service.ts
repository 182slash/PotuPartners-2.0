import axios from 'axios';
import { query } from '../../config/database';
import {
  uploadToSpaces,
  deleteFromSpaces,
  ALLOWED_RAG_MIME_TYPES,
} from '../../config/storage';
import { validateFileMagicBytes } from '../../middleware/upload.middleware';
import { Errors } from '../../utils/errors';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import type { DBRagDocument } from '../../types';
import * as userSvc from '../users/users.service';

// ─── List RAG documents ───────────────────────────────────────────────────────
export async function listDocuments(): Promise<DBRagDocument[]> {
  const { rows } = await query<DBRagDocument>(
    `SELECT d.*, u.full_name AS uploader_name
     FROM rag_documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     ORDER BY d.created_at DESC`
  );
  return rows;
}

// ─── Upload and index a RAG document ─────────────────────────────────────────
export async function uploadDocument(
  buffer:      Buffer,
  originalName: string,
  declaredMime: string,
  title:       string,
  description: string | undefined,
  uploaderId:  string,
): Promise<DBRagDocument> {
  // Validate file type
  const trueMime = await validateFileMagicBytes(buffer, ALLOWED_RAG_MIME_TYPES);

  // Upload to private Spaces bucket folder
  const { storageKey } = await uploadToSpaces(
    buffer, trueMime, 'rag-documents', originalName
  );

  const id = uuidv4();

  const { rows } = await query<DBRagDocument>(
    `INSERT INTO rag_documents
       (id, title, description, storage_key, mime_type, file_size_bytes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, title, description ?? null, storageKey, trueMime, buffer.length, uploaderId]
  );

  const doc = rows[0];

  // Trigger RAG ingestion asynchronously — don't block the response
  triggerRagIngestion(doc).catch(err => {
    logger.error('RAG ingestion trigger failed', { docId: id, error: (err as Error).message });
  });

  return doc;
}

// ─── Delete a RAG document ────────────────────────────────────────────────────
export async function deleteDocument(id: string): Promise<void> {
  const { rows } = await query<DBRagDocument>(
    'SELECT * FROM rag_documents WHERE id = $1',
    [id]
  );
  if (rows.length === 0) throw Errors.notFound('Document');

  const doc = rows[0];

  // Delete from Spaces
  await deleteFromSpaces(doc.storage_key).catch(err => {
    logger.warn('Could not delete from Spaces', { storageKey: doc.storage_key, error: (err as Error).message });
  });

  // Remove vectors from RAG service
  await axios
    .delete(`${env.RAG_SERVICE_URL}/ingest/${id}`, {
      headers: { 'X-Service-Secret': env.RAG_SERVICE_SECRET },
    })
    .catch(err => {
      logger.warn('Could not delete from RAG service', { docId: id, error: (err as Error).message });
    });

  await query('DELETE FROM rag_documents WHERE id = $1', [id]);
}

// ─── Admin: list all chat rooms ───────────────────────────────────────────────
export async function listChatRooms() {
  const { rows } = await query(
    `SELECT
       c.id, c.room_key, c.is_ai_chat, c.last_message_at, c.created_at,
       u_cli.full_name  AS client_name,
       u_cli.email      AS client_email,
       u_part.full_name AS participant_name,
       u_part.role      AS participant_role,
       (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id) AS message_count
     FROM conversations c
     LEFT JOIN users u_cli  ON u_cli.id  = c.client_id
     LEFT JOIN users u_part ON u_part.id = c.participant_id
     ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
     LIMIT 200`
  );
  return rows;
}

// ─── Private: call RAG service to ingest document ────────────────────────────
async function triggerRagIngestion(doc: DBRagDocument): Promise<void> {
  try {
    await axios.post(
      `${env.RAG_SERVICE_URL}/ingest`,
      { doc_id: doc.id, storage_key: doc.storage_key, title: doc.title },
      {
        headers: { 'X-Service-Secret': env.RAG_SERVICE_SECRET },
        timeout: 300_000,  // 5 minutes for large docs
      }
    );

    logger.info('RAG ingestion triggered successfully', { docId: doc.id });
  } catch (err) {
    logger.error('RAG ingestion failed', {
      docId:  doc.id,
      error: (err as Error).message,
    });
    throw err;
  }
}

// ─── Update indexing status (called by RAG service callback) ──────────────────
export async function markDocumentIndexed(
  docId:      string,
  chunkCount: number,
): Promise<void> {
  await query(
    `UPDATE rag_documents
     SET indexed = true, indexed_at = NOW(), chunk_count = $2, updated_at = NOW()
     WHERE id = $1`,
    [docId, chunkCount]
  );
}

// Re-export user management functions for admin routes
export {
  listAllUsers,
  createStaff,
  updateRole,
  deactivateUser,
} from '../users/users.service';
