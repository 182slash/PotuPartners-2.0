import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import * as svc from './users.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validate, updateUserSchema } from '../../utils/validators';
import { Errors } from '../../utils/errors';

// ─── Handlers ─────────────────────────────────────────────────────────────────

// GET /api/users/staff
export const getStaff = asyncHandler(async (_req, res: Response) => {
  const staff = await svc.getStaff();
  res.json({ success: true, data: staff });
});

// GET /api/users/:id
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.getUserById(req.params['id']!);
  res.json({ success: true, data: user });
});

// PATCH /api/users/me
export const updateSelf = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.updateUser(req.user!.sub, req.body as Parameters<typeof svc.updateUser>[1]);
  res.json({ success: true, data: user, message: 'Profile updated' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = Router();

router.get('/staff',       requireAuth, getStaff);
router.get('/:id',         requireAuth, getById);
router.patch('/me',        requireAuth, validate(updateUserSchema), updateSelf);

export default router;
