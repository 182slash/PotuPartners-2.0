import { query } from '../../config/database';
import { hashPassword, toPublicUser } from '../../utils/auth';
import { Errors } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import type { DBUser, PublicUser } from '../../types';

// ─── List staff (associates + partners) for contact selector ──────────────────
export async function getStaff(): Promise<PublicUser[]> {
  const { rows } = await query<DBUser>(
    `SELECT * FROM users
     WHERE role IN ('associate', 'partner')
       AND is_active = true
     ORDER BY role DESC, full_name ASC`
  );
  return rows.map(toPublicUser);
}

// ─── Get single user ──────────────────────────────────────────────────────────
export async function getUserById(id: string): Promise<PublicUser> {
  const { rows } = await query<DBUser>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [id]
  );
  if (rows.length === 0) throw Errors.notFound('User');
  return toPublicUser(rows[0]);
}

// ─── Update own profile ───────────────────────────────────────────────────────
export async function updateUser(
  id: string,
  data: Partial<{
    fullName: string; displayName: string; title: string;
    bio: string; specialty: string; linkedinUrl: string; avatarUrl: string;
  }>
): Promise<PublicUser> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let   i = 1;

  if (data.fullName    !== undefined) { fields.push(`full_name = $${i++}`);    values.push(data.fullName); }
  if (data.displayName !== undefined) { fields.push(`display_name = $${i++}`); values.push(data.displayName); }
  if (data.title       !== undefined) { fields.push(`title = $${i++}`);        values.push(data.title); }
  if (data.bio         !== undefined) { fields.push(`bio = $${i++}`);          values.push(data.bio); }
  if (data.specialty   !== undefined) { fields.push(`specialty = $${i++}`);    values.push(data.specialty); }
  if (data.linkedinUrl !== undefined) { fields.push(`linkedin_url = $${i++}`); values.push(data.linkedinUrl || null); }
  if (data.avatarUrl   !== undefined) { fields.push(`avatar_url = $${i++}`);   values.push(data.avatarUrl); }

  if (fields.length === 0) throw Errors.badRequest('No valid fields provided for update');

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await query<DBUser>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} AND is_active = true RETURNING *`,
    values
  );

  if (rows.length === 0) throw Errors.notFound('User');
  return toPublicUser(rows[0]);
}

// ─── Admin: create staff account ──────────────────────────────────────────────
export async function createStaff(data: {
  email: string; password: string; fullName: string;
  role: 'associate' | 'partner' | 'admin'; title?: string;
  bio?: string; specialty?: string; linkedinUrl?: string;
}): Promise<PublicUser> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [data.email]
  );
  if (existing.rows.length > 0) throw Errors.conflict('Email already registered');

  const passwordHash = await hashPassword(data.password);
  const id           = uuidv4();

  const { rows } = await query<DBUser>(
    `INSERT INTO users (id, email, password_hash, full_name, role, title, bio, specialty, linkedin_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [id, data.email, passwordHash, data.fullName, data.role,
     data.title ?? null, data.bio ?? null, data.specialty ?? null,
     data.linkedinUrl ?? null]
  );

  return toPublicUser(rows[0]);
}

// ─── Admin: update role ───────────────────────────────────────────────────────
export async function updateRole(id: string, role: string): Promise<PublicUser> {
  const { rows } = await query<DBUser>(
    `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING *`,
    [role, id]
  );
  if (rows.length === 0) throw Errors.notFound('User');
  return toPublicUser(rows[0]);
}

// ─── Admin: deactivate user ───────────────────────────────────────────────────
export async function deactivateUser(id: string): Promise<void> {
  const { rowCount } = await query(
    'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
    [id]
  );
  if (!rowCount) throw Errors.notFound('User');
}

// ─── Admin: list all users ────────────────────────────────────────────────────
export async function listAllUsers(): Promise<PublicUser[]> {
  const { rows } = await query<DBUser>(
    `SELECT * FROM users ORDER BY role, full_name ASC`
  );
  return rows.map(toPublicUser);
}
