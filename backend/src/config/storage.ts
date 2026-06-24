/**
 * storage.ts — Local disk storage (replaces DO Spaces / S3)
 *
 * Files are written to UPLOAD_DIR (a DO App Platform volume mounted at
 * /workspace/uploads). The API serves them directly:
 *   - chat-files/ and avatars/ → public via express.static at /uploads/
 *   - rag-documents/           → auth-protected via /uploads/rag-documents/
 *
 * The exported function names (uploadToSpaces, deleteFromSpaces,
 * getPresignedUrl) are kept identical so every call-site works without change.
 */

import fs   from 'fs';
import path from 'path';
import { env }    from './env';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// ─── Allowed MIME types ───────────────────────────────────────────────────────
export const ALLOWED_CHAT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const ALLOWED_RAG_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const MAX_CHAT_FILE_SIZE = 25 * 1024 * 1024;  // 25 MB
export const MAX_RAG_FILE_SIZE  = 50 * 1024 * 1024;  // 50 MB

// ─── Upload result ────────────────────────────────────────────────────────────
export interface UploadResult {
  storageKey: string;   // relative path from UPLOAD_DIR root, e.g. chat-files/uuid.pdf
  cdnUrl:     string;   // API-relative URL the client uses to access the file
  mimeType:   string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Resolve a storageKey to its absolute path on disk. */
export function resolveStorageKey(storageKey: string): string {
  return path.join(env.UPLOAD_DIR, storageKey);
}

// ─── Upload buffer to local disk (was: PutObjectCommand to Spaces) ───────────
export async function uploadToSpaces(
  buffer:       Buffer,
  mimeType:     string,
  folder:       'chat-files' | 'rag-documents' | 'avatars',
  originalName: string,
): Promise<UploadResult> {
  const ext        = path.extname(originalName).toLowerCase();
  const filename   = `${uuidv4()}${ext}`;
  const storageKey = `${folder}/${filename}`;
  const destDir    = path.join(env.UPLOAD_DIR, folder);
  const destPath   = path.join(destDir, filename);

  ensureDir(destDir);
  fs.writeFileSync(destPath, buffer);

  logger.info('File saved to disk', { storageKey, mimeType, bytes: buffer.length });

  // The API serves uploads at /uploads/<storageKey>
  // Auth for rag-documents is handled by middleware in index.ts
  const cdnUrl = `/uploads/${storageKey}`;

  return { storageKey, cdnUrl, mimeType };
}

// ─── Delete from local disk (was: DeleteObjectCommand) ───────────────────────
export async function deleteFromSpaces(storageKey: string): Promise<void> {
  const filePath = resolveStorageKey(storageKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logger.info('File deleted from disk', { storageKey });
  } else {
    logger.warn('deleteFromSpaces: file not found on disk', { storageKey });
  }
}

// ─── "Presigned URL" → local path (auth enforced by the download route) ──────
// For local storage there are no expiring tokens — the /api/files/:id/download
// route already performs access-control before streaming the file.
export async function getPresignedUrl(
  storageKey:       string,
  _expiresInSeconds = 900,
): Promise<string> {
  // Return the API-relative path; the download handler resolves it to disk.
  return `/uploads/${storageKey}`;
}
