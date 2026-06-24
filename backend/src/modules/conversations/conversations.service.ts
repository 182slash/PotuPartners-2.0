import { query, withTransaction } from '../../config/database';
import { Errors } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { DBConversation, DBUser, PublicUser } from '../../types';
import { toPublicUser } from '../../utils/auth';

// ─── Room key: deterministic, sorted to be symmetric ─────────────────────────
export function generateRoomKey(clientId: string, participantId: string | null): string {
  if (!participantId) return `ai_${clientId}`;
  const sorted = [clientId, participantId].sort().join('_');
  return `conv_${crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 32)}`;
}

// ─── Enriched conversation type ───────────────────────────────────────────────
interface ConversationWithParticipants extends DBConversation {
  participant?: PublicUser;
  client?:      PublicUser;
  last_message?: {
    id: string; content: string | null; created_at: Date; sender_id: string | null;
  };
  unread_count: number;
}

// ─── Create or retrieve a conversation ───────────────────────────────────────
export async function createOrGetConversation(
  clientId:      string,
  participantId: string | null,
  isAiChat:      boolean,
): Promise<ConversationWithParticipants> {
  const roomKey = generateRoomKey(clientId, participantId);

  // Try to find existing conversation
  const existing = await getByRoomKey(roomKey, clientId);
  if (existing) return existing;

  // Verify participant exists if not AI
  if (participantId && !isAiChat) {
    const { rows } = await query<{ id: string }>(
      `SELECT id FROM users WHERE id = $1 AND is_active = true AND role IN ('associate','partner','admin')`,
      [participantId]
    );
    if (rows.length === 0) throw Errors.notFound('Staff member');
  }

  const id = uuidv4();
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO conversations (id, client_id, participant_id, is_ai_chat, room_key)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, clientId, participantId, isAiChat, roomKey]
    );
  });

  return (await getByRoomKey(roomKey, clientId))!;
}

// ─── List all conversations for a user ───────────────────────────────────────
export async function listConversations(userId: string): Promise<ConversationWithParticipants[]> {
  const { rows } = await query<ConversationWithParticipants>(
    `SELECT
       c.*,
       row_to_json(u_part.*) AS participant,
       row_to_json(u_cli.*)  AS client,
       (
         SELECT row_to_json(m.*)
         FROM messages m
         WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
         ORDER BY m.created_at DESC
         LIMIT 1
       ) AS last_message,
       (
         SELECT COUNT(*)::int
         FROM messages m
         WHERE m.conversation_id = c.id
           AND m.is_read = false
           AND m.sender_id != $1
           AND m.deleted_at IS NULL
       ) AS unread_count
     FROM conversations c
     LEFT JOIN users u_part ON u_part.id = c.participant_id
     LEFT JOIN users u_cli  ON u_cli.id  = c.client_id
     WHERE (c.client_id = $1 OR c.participant_id = $1)
     ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
    [userId]
  );

  return rows.map(r => enrichConversation(r));
}

// ─── Get single conversation ──────────────────────────────────────────────────
export async function getConversationById(
  id:     string,
  userId: string,
): Promise<ConversationWithParticipants> {
  const { rows } = await query<ConversationWithParticipants>(
    `SELECT c.*,
       row_to_json(u_part.*) AS participant,
       row_to_json(u_cli.*)  AS client
     FROM conversations c
     LEFT JOIN users u_part ON u_part.id = c.participant_id
     LEFT JOIN users u_cli  ON u_cli.id  = c.client_id
     WHERE c.id = $1 AND (c.client_id = $2 OR c.participant_id = $2)`,
    [id, userId]
  );
  if (rows.length === 0) throw Errors.notFound('Conversation');
  return enrichConversation(rows[0]);
}

// ─── Delete conversation (and cascade messages) ───────────────────────────────
export async function deleteConversation(id: string, userId: string): Promise<void> {
  const { rowCount } = await query(
    `DELETE FROM conversations
     WHERE id = $1 AND (client_id = $2 OR participant_id = $2)`,
    [id, userId]
  );
  if (!rowCount) throw Errors.notFound('Conversation');
}

// ─── Private helpers ──────────────────────────────────────────────────────────
async function getByRoomKey(
  roomKey: string,
  userId:  string,
): Promise<ConversationWithParticipants | null> {
  const { rows } = await query<ConversationWithParticipants>(
    `SELECT c.*,
       row_to_json(u_part.*) AS participant,
       row_to_json(u_cli.*)  AS client,
       0 AS unread_count
     FROM conversations c
     LEFT JOIN users u_part ON u_part.id = c.participant_id
     LEFT JOIN users u_cli  ON u_cli.id  = c.client_id
     WHERE c.room_key = $1 AND (c.client_id = $2 OR c.participant_id = $2)`,
    [roomKey, userId]
  );
  if (rows.length === 0) return null;
  return enrichConversation(rows[0]);
}

function enrichConversation(row: ConversationWithParticipants): ConversationWithParticipants {
  // pg returns JSON columns as already-parsed objects
  if (row.participant && typeof row.participant === 'object') {
    row.participant = toPublicUser(row.participant as unknown as DBUser);
  }
  if (row.client && typeof row.client === 'object') {
    row.client = toPublicUser(row.client as unknown as DBUser);
  }
  return row;
}
