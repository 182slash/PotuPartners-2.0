import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email:    z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
});

// ─── Users ────────────────────────────────────────────────────────────────────
export const createStaffSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  role:     z.enum(['associate', 'partner', 'admin']),
  title:    z.string().max(200).optional(),
  bio:      z.string().max(2000).optional(),
  specialty: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
  fullName:    z.string().min(2).max(100).optional(),
  displayName: z.string().min(1).max(80).optional(),
  title:       z.string().max(200).optional(),
  bio:         z.string().max(2000).optional(),
  specialty:   z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export const updateRoleSchema = z.object({
  role: z.enum(['client', 'associate', 'partner', 'admin']),
});

// ─── Conversations ────────────────────────────────────────────────────────────
export const createConversationSchema = z.object({
  participantId: z.string().uuid().nullable(),
  isAiChat:      z.boolean(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page:  z.string().optional().transform(v => Math.max(1, parseInt(v ?? '1', 10))),
  limit: z.string().optional().transform(v => Math.min(100, Math.max(1, parseInt(v ?? '50', 10)))),
});

// ─── RAG ──────────────────────────────────────────────────────────────────────
export const ragDocumentSchema = z.object({
  title:       z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
});

export const aiQuerySchema = z.object({
  conversationId: z.string().uuid(),
  message:        z.string().min(1).max(4000),
});

// ─── Validation middleware factory ────────────────────────────────────────────
import type { Request, Response, NextFunction } from 'express';

export function validate<T>(schema: z.ZodSchema<T>, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) throw result.error;
    req[target] = result.data as typeof req[typeof target];
    next();
  };
}
