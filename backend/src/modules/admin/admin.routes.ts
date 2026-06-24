import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import * as svc from './admin.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { ragDocUpload } from '../../middleware/upload.middleware';
import { validate, createStaffSchema, updateRoleSchema, ragDocumentSchema } from '../../utils/validators';
import { Errors } from '../../utils/errors';

// ─── Docs ─────────────────────────────────────────────────────────────────────
const listDocs   = asyncHandler(async (_req, res: Response) => {
  res.json({ success: true, data: await svc.listDocuments() });
});

const uploadDoc  = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw Errors.badRequest('No file provided');
  const { title, description } = req.body as { title: string; description?: string };
  const doc = await svc.uploadDocument(
    req.file.buffer, req.file.originalname, req.file.mimetype,
    title, description, req.user!.sub,
  );
  res.status(201).json({ success: true, data: doc, message: 'Document uploaded and queued for indexing' });
});

const deleteDoc  = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteDocument(req.params['id']!);
  res.json({ success: true, message: 'Document removed' });
});

// POST /api/admin/rag-documents/:id/indexed (called by RAG service)
const markIndexed = asyncHandler(async (req: Request, res: Response) => {
  const secret = req.headers['x-service-secret'];
  if (secret !== process.env['RAG_SERVICE_SECRET']) throw Errors.forbidden();
  const { chunkCount } = req.body as { chunkCount: number };
  await svc.markDocumentIndexed(req.params['id']!, chunkCount);
  res.json({ success: true });
});

// ─── Users ────────────────────────────────────────────────────────────────────
const listUsers   = asyncHandler(async (_req, res: Response) => {
  res.json({ success: true, data: await svc.listAllUsers() });
});

const createUser  = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.createStaff(req.body as Parameters<typeof svc.createStaff>[0]);
  res.status(201).json({ success: true, data: user });
});

const changeRole  = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.updateRole(req.params['id']!, (req.body as { role: string }).role);
  res.json({ success: true, data: user });
});

const removeUser  = asyncHandler(async (req: Request, res: Response) => {
  await svc.deactivateUser(req.params['id']!);
  res.json({ success: true, message: 'User deactivated' });
});

// ─── Chat rooms ───────────────────────────────────────────────────────────────
const listRooms   = asyncHandler(async (_req, res: Response) => {
  res.json({ success: true, data: await svc.listChatRooms() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = Router();

// Docs
router.get('/rag-documents',              requireAuth, requireAdmin, listDocs);
router.post('/rag-documents',             requireAuth, requireAdmin,
  (req, res, next) => {
    ragDocUpload(req, res, err => {
      if (err) return next(Errors.badRequest(err.message));
      next();
    });
  },
  validate(ragDocumentSchema),
  uploadDoc,
);
router.delete('/rag-documents/:id',       requireAuth, requireAdmin, deleteDoc);
router.post('/rag-documents/:id/indexed', markIndexed);

// Users
router.get('/users',                      requireAuth, requireAdmin, listUsers);
router.post('/users',                     requireAuth, requireAdmin, validate(createStaffSchema), createUser);
router.patch('/users/:id/role',           requireAuth, requireAdmin, validate(updateRoleSchema), changeRole);
router.delete('/users/:id',               requireAuth, requireAdmin, removeUser);

// Chat rooms
router.get('/chat-rooms',                 requireAuth, requireAdmin, listRooms);

export default router;
