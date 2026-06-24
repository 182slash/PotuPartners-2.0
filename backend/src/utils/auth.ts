import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';
import type { JwtPayload, UserRole } from '../types';

// ─── Password hashing ─────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Access token (short-lived, 15m) ─────────────────────────────────────────
export function signAccessToken(payload: { id: string; role: UserRole; email: string }): string {
  return jwt.sign(
    { sub: payload.id, role: payload.role, email: payload.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

// ─── Refresh token (long-lived, 7d) ──────────────────────────────────────────
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signRefreshToken(payload: { id: string }): string {
  return jwt.sign(
    { sub: payload.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
export const REFRESH_COOKIE_NAME = 'potu_refresh';

export const refreshCookieOptions = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  path:     '/api/auth',
};

// ─── Map DB user to public user ───────────────────────────────────────────────
import type { DBUser, PublicUser } from '../types';

export function toPublicUser(user: DBUser): PublicUser {
  return {
    id:          user.id,
    email:       user.email,
    fullName:    user.full_name,
    displayName: user.display_name,
    role:        user.role,
    avatarUrl:   user.avatar_url,
    title:       user.title,
    bio:         user.bio,
    specialty:   user.specialty,
    linkedinUrl: user.linkedin_url,
    isOnline:    user.is_online,
    lastSeen:    user.last_seen,
    createdAt:   user.created_at,
  };
}
