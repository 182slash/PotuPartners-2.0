import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import * as svc from './files.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { chatFileUpload } from '../../middleware/upload.middleware';
import { Errors } from '../../utils/errors';

// POST /api/files/upload
const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw Errors.badRequest('No file provided');

  const { conversationId } = req.body as { conversationId: string };
  if (!conversationId) throw Errors.badRequest('conversationId is required');

  const file = await svc.uploadChatFile(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    conversationId,
    req.user!.sub,
  );

  res.status(201).json({ success: true, data: file });
});

// GET /api/files/:id/url
const getUrl = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.getFileDownloadUrl(req.params['id']!, req.user!.sub);
  res.json({ success: true, data: result });
});

// DELETE /api/files/:id
const remove = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteFile(req.params['id']!, req.user!.sub);
  res.json({ success: true, message: 'File deleted' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = Router();

router.post('/upload', requireAuth, (req, res, next) => {
  chatFileUpload(req, res, (err) => {
    if (err) return next(Errors.badRequest(err.message));
    next();
  });
}, upload);

router.get('/:id/url', requireAuth, getUrl);
router.delete('/:id',  requireAuth, remove);

export default router;
