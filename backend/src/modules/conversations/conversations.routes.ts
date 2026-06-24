import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import * as svc from './conversations.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate, createConversationSchema } from '../../utils/validators';

// POST /api/conversations
const create = asyncHandler(async (req: Request, res: Response) => {
  const { participantId, isAiChat } = req.body as {
    participantId: string | null; isAiChat: boolean;
  };
  const conv = await svc.createOrGetConversation(req.user!.sub, participantId, isAiChat);
  res.status(201).json({ success: true, data: conv });
});

// GET /api/conversations
const list = asyncHandler(async (req: Request, res: Response) => {
  const convs = await svc.listConversations(req.user!.sub);
  res.json({ success: true, data: convs });
});

// GET /api/conversations/:id
const getById = asyncHandler(async (req: Request, res: Response) => {
  const conv = await svc.getConversationById(req.params['id']!, req.user!.sub);
  res.json({ success: true, data: conv });
});

// DELETE /api/conversations/:id
const remove = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteConversation(req.params['id']!, req.user!.sub);
  res.json({ success: true, message: 'Conversation deleted' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = Router();

router.post('/',    requireAuth, validate(createConversationSchema), create);
router.get('/',     requireAuth, list);
router.get('/:id',  requireAuth, getById);
router.delete('/:id', requireAuth, remove);

export default router;
