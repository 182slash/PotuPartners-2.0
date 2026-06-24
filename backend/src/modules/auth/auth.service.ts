import { query, withTransaction } from '../../config/database';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  toPublicUser,
} from '../../utils/auth';
import { Errors } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import type { DBUser, PublicUser } from '../../types';

export interface AuthResult {
  user:         PublicUser;
  accessToken:  string;
  refreshToken: string;
}

// ─── Register a new client ────────────────────────────────────────────────────
export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResult> {
  // Check for duplicate email
  const existing = await query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1 AND is_active = true',
    [email]
  );
  if (existing.rows.length > 0) {
    throw Errors.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const userId       = uuidv4();

  const { rows } = await query<DBUser>(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, 'client')
     RETURNING *`,
    [userId, email, passwordHash, fullName]
  );

  const user         = rows[0];
  const accessToken  = signAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = await createRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResult> {
  const { rows } = await query<DBUser>(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  if (rows.length === 0) {
    // Constant-time response to prevent user enumeration
    await hashPassword('dummy-comparison-password');
    throw Errors.unauthorized('Invalid email or password');
  }

  const user = rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    throw Errors.unauthorized('Invalid email or password');
  }

  // Update online status
  await query(
    'UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1',
    [user.id]
  );

  const accessToken  = signAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = await createRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

// ─── Refresh access token ─────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken: string): Promise<{
  user:        PublicUser;
  accessToken: string;
  newRefreshToken: string;
}> {
  const tokenHash = hashRefreshToken(refreshToken);

  const { rows: tokenRows } = await query<{ user_id: string; expires_at: Date }>(
    'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash]
  );

  if (tokenRows.length === 0) {
    throw Errors.unauthorized('Invalid or expired refresh token');
  }

  const { user_id, expires_at } = tokenRows[0];

  if (new Date() > new Date(expires_at)) {
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    throw Errors.unauthorized('Refresh token has expired. Please log in again.');
  }

  // Rotate: delete old token, issue new one
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);

  const { rows: userRows } = await query<DBUser>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [user_id]
  );

  if (userRows.length === 0) {
    throw Errors.unauthorized('User account not found or deactivated');
  }

  const user            = userRows[0];
  const accessToken     = signAccessToken({ id: user.id, role: user.role, email: user.email });
  const newRefreshToken = await createRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, newRefreshToken };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(userId: string, refreshToken?: string): Promise<void> {
  await query(
    'UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1',
    [userId]
  );

  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  } else {
    // Invalidate all sessions for this user
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

// ─── Get current user ─────────────────────────────────────────────────────────
export async function getMe(userId: string): Promise<PublicUser> {
  const { rows } = await query<DBUser>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );
  if (rows.length === 0) throw Errors.notFound('User');
  return toPublicUser(rows[0]);
}

// ─── Private: create and store refresh token ──────────────────────────────────
async function createRefreshToken(userId: string): Promise<string> {
  const token     = generateRefreshToken();
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await withTransaction(async (client) => {
    // Clean up expired tokens for this user
    await client.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()',
      [userId]
    );
    await client.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), userId, tokenHash, expiresAt]
    );
  });

  return token;
}
