import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

// ─── Custom error class ───────────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = true;
    this.code          = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Common error factories ───────────────────────────────────────────────────
export const Errors = {
  notFound:        (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  unauthorized:    (msg = 'Authentication required') => new AppError(msg, 401, 'UNAUTHORIZED'),
  forbidden:       (msg = 'Insufficient permissions') => new AppError(msg, 403, 'FORBIDDEN'),
  badRequest:      (msg: string) => new AppError(msg, 400, 'BAD_REQUEST'),
  conflict:        (msg: string) => new AppError(msg, 409, 'CONFLICT'),
  tooLarge:        (msg: string) => new AppError(msg, 413, 'PAYLOAD_TOO_LARGE'),
  unsupportedType: (msg: string) => new AppError(msg, 415, 'UNSUPPORTED_MEDIA_TYPE'),
  serverError:     (msg = 'Internal server error') => new AppError(msg, 500, 'INTERNAL_ERROR'),
};

// ─── Global error handler middleware ─────────────────────────────────────────
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map(i => ({
      field:   i.path.join('.'),
      message: i.message,
    }));
    res.status(400).json({
      success: false,
      error:   'Validation failed',
      code:    'VALIDATION_ERROR',
      details,
    });
    return;
  }

  // Operational errors (known, safe to expose)
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    });
    return;
  }

  // PostgreSQL unique violation
  if ((err as { code?: string }).code === '23505') {
    res.status(409).json({
      success: false,
      error:   'A record with this value already exists',
      code:    'DUPLICATE_ENTRY',
    });
    return;
  }

  // Unknown / programming errors — don't leak details in production
  logger.error('Unhandled error', {
    message: err.message,
    stack:   err.stack,
    url:     req.originalUrl,
    method:  req.method,
  });

  res.status(500).json({
    success: false,
    error:   'An unexpected error occurred. Please try again.',
    code:    'INTERNAL_ERROR',
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error:   `Route ${req.method} ${req.originalUrl} not found`,
    code:    'ROUTE_NOT_FOUND',
  });
}
