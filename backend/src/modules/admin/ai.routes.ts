import { Router } from 'express';
import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate, aiQuerySchema } from '../../utils/validators';
import { queryAi } from './ai.service';

const router = Router();

// POST /api/ai/query
router.post(
  '/query',
  requireAuth,
  validate(aiQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, message } = req.body as { conversationId: string; message: string };
    const result = await queryAi(conversationId, req.user!.sub, message);
    res.json({ success: true, data: result });
  })
);

export default router;
