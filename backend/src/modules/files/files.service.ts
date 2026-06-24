import { query } from '../../config/database';
import {
  uploadToSpaces,
  deleteFromSpaces,
  resolveStorageKey,
  ALLOWED_CHAT_MIME_TYPES,
} from '../../config/storage';
import { validateFileMagicBytes } from '../../middleware/upload.middleware';
import { Errors }   from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import fs   from 'fs';
// unused: import path from 'path';
import type { DBFile } from '../../types';

// ─── Upload chat attachment ───────────────────────────────────────────────────
export async function uploadChatFile(
  buffer:         Buffer,
  originalName:   string,
  _declaredMime:   string,
  conversationId: string,
  uploaderId:     string,
): Promise<DBFile> {
  // Verify the conversation exists and the uploader is a participant
  const { rows: convRows } = await query<{ id: string }>(
    `SELECT id FROM conversations
     WHERE id = $1 AND (client_id = $2 OR participant_id = $2)`,
    [conversationId, uploaderId]
  );
  if (convRows.length === 0) throw Errors.forbidden('You are not part of this conversation');

  // Deep MIME validation — check magic bytes, not just Content-Type header
  const trueMime = await validateFileMagicBytes(buffer, ALLOWED_CHAT_MIME_TYPES);

  const { storageKey, cdnUrl, mimeType } = await uploadToSpaces(
    buffer, trueMime, 'chat-files', originalName
  );

  const id = uuidv4();
  const { rows } = await query<DBFile>(
    `INSERT INTO files
       (id, conversation_id, uploader_id, original_name, storage_key, storage_url, mime_type, file_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, conversationId, uploaderId, originalName, storageKey, cdnUrl, mimeType, buffer.length]
  );

  return rows[0];
}

// ─── Get file download info (was: presigned URL from Spaces) ─────────────────
// The actual file is streamed by the GET /api/files/:id/download route —
// this function only verifies access and returns the absolute disk path.
export async function getFileDownloadUrl(
  fileId: string,
  userId: string,
): Promise<{ url: string; filename: string; localPath: string; mimeType: string }> {
  const { rows } = await query<DBFile & { client_id: string; participant_id: string }>(
    `SELECT f.*, c.client_id, c.participant_id
     FROM files f
     JOIN conversations c ON c.id = f.conversation_id
     WHERE f.id = $1`,
    [fileId]
  );

  if (rows.length === 0) throw Errors.notFound('File');

  const file = rows[0];

  // Verify the requesting user belongs to the conversation
  if (file.client_id !== userId && file.participant_id !== userId) {
    throw Errors.forbidden('Access denied');
  }

  const localPath = resolveStorageKey(file.storage_key);

  if (!fs.existsSync(localPath)) {
    throw Errors.notFound('File not found on disk');
  }

  return {
    url:       file.storage_url,   // API-relative path, e.g. /uploads/chat-files/uuid.pdf
    filename:  file.original_name,
    localPath,                     // absolute disk path — used by the route to stream
    mimeType:  file.mime_type,
  };
}

// ─── Delete a file ────────────────────────────────────────────────────────────
export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const { rows } = await query<DBFile>(
    'SELECT * FROM files WHERE id = $1',
    [fileId]
  );

  if (rows.length === 0) throw Errors.notFound('File');

  const file = rows[0];

  if (file.uploader_id !== userId) {
    throw Errors.forbidden('You can only delete your own files');
  }

  await deleteFromSpaces(file.storage_key);
  await query('DELETE FROM files WHERE id = $1', [fileId]);
}
