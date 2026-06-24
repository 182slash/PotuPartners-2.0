import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { Errors } from '../utils/errors';
import type { UserRole } from '../types';

// ─── Require valid JWT ────────────────────────────────────────────────────────
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw Errors.unauthorized('No token provided');
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    const message = (err as Error).name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
    throw Errors.unauthorized(message);
  }
}

// ─── Role guard ───────────────────────────────────────────────────────────────
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw Errors.unauthorized();

    if (!roles.includes(req.user.role)) {
      throw Errors.forbidden(
        `Role '${req.user.role}' is not permitted to access this resource`
      );
    }
    next();
  };
}

// ─── Shortcuts ────────────────────────────────────────────────────────────────
export const requireAdmin          = requireRole('admin');
export const requireStaff          = requireRole('associate', 'partner', 'admin');
export const requirePartnerOrAdmin = requireRole('partner', 'admin');
