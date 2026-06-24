import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import * as svc from './messages.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate, paginationSchema } from '../../utils/validators';
// GET /api/conversations/:id/messages
const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as { page?: string; limit?: string };
  const result = await svc.listMessages(
    req.params['id']!,
    req.user!.sub,
    Number(page ?? 1),
    Number(limit ?? 50),
  );
  res.json({ success: true, ...result });
});
// DELETE /api/messages/:id
const remove = asyncHandler(async (req: Request, res: Response) => {
  await svc.softDeleteMessage(
    req.params['id']!,
    req.user!.sub,
    req.user!.role === 'admin',
  );
  res.json({ success: true, message: 'Message deleted' });
});
// ─── Routes ───────────────────────────────────────────────────────────────────
// Conversations sub-route is registered in conversations.routes.ts
const messagesRouter = Router();
messagesRouter.delete('/:id', requireAuth, remove);
// For conversation messages sub-route
export const convMessagesRouter = Router({ mergeParams: true });
convMessagesRouter.get('/', requireAuth, validate(paginationSchema as any, 'query'), list);
export default messagesRouter;
potupartners@potupartners-api:/opt/potupartners/backend$