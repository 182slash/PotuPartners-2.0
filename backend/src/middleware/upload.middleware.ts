import multer from 'multer';
import { fromBuffer } from 'file-type';
import type { Request } from 'express';
import {
  ALLOWED_CHAT_MIME_TYPES,
  ALLOWED_RAG_MIME_TYPES,
  MAX_CHAT_FILE_SIZE,
  MAX_RAG_FILE_SIZE,
} from '../config/storage';
import { Errors } from '../utils/errors';

// ─── Memory storage (we stream to DO Spaces immediately) ─────────────────────
const memoryStorage = multer.memoryStorage();

// ─── Chat file upload ─────────────────────────────────────────────────────────
export const chatFileUpload = multer({
  storage: memoryStorage,
  limits:  { fileSize: MAX_CHAT_FILE_SIZE },
  fileFilter: (_req: Request, file, cb) => {
    if (ALLOWED_CHAT_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }
  },
}).single('file');

// ─── RAG document upload ──────────────────────────────────────────────────────
export const ragDocUpload = multer({
  storage: memoryStorage,
  limits:  { fileSize: MAX_RAG_FILE_SIZE },
  fileFilter: (_req: Request, file, cb) => {
    if (ALLOWED_RAG_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed for knowledge base`));
    }
  },
}).single('file');

// ─── Deep MIME validation (check file magic bytes, not just extension) ────────
export async function validateFileMagicBytes(
  buffer: Buffer,
  allowedTypes: Set<string>,
): Promise<string> {
  const detected = await fromBuffer(buffer);

  // For text files (plain text), file-type returns undefined — that's ok
  if (!detected) {
    if (allowedTypes.has('text/plain')) return 'text/plain';
    throw Errors.unsupportedType('Could not determine file type');
  }

  // Map file-type mime to our expected mime
  const mimeToCheck = detected.mime;

  if (!allowedTypes.has(mimeToCheck)) {
    throw Errors.unsupportedType(
      `File content does not match allowed types. Detected: ${mimeToCheck}`
    );
  }

  return mimeToCheck;
}
