import { query, withTransaction } from '../../config/database';
import { Errors } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import type { DBMessage, DBFile, MessageType, PaginatedResult } from '../../types';

export interface MessageWithFiles extends DBMessage {
  files?: DBFile[];
  sender?: { id: string; full_name: string; display_name: string | null; avatar_url: string | null };
}

// ─── Persist a new message ────────────────────────────────────────────────────
export async function createMessage(data: {
  conversationId: string;
  senderId:       string | null;
  content:        string | null;
  messageType:    MessageType;
  fileId?:        string;
}): Promise<MessageWithFiles> {
  const id = uuidv4();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO messages (id, conversation_id, sender_id, content, message_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, data.conversationId, data.senderId, data.content, data.messageType]
    );

    // Link file to message if provided
    if (data.fileId) {
      await client.query(
        'UPDATE files SET message_id = $1 WHERE id = $2',
        [id, data.fileId]
      );
    }

    // Update conversation last_message_at
    await client.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [data.conversationId]
    );
  });

  const result = await getMessageById(id);
  return result;
}

// ─── Get paginated messages for a conversation ────────────────────────────────
export async function listMessages(
  conversationId: string,
  userId:         string,
  page  = 1,
  limit = 50,
): Promise<PaginatedResult<MessageWithFiles>> {
  // Verify user is participant
  const { rows: convRows } = await query<{ id: string }>(
    `SELECT id FROM conversations
     WHERE id = $1 AND (client_id = $2 OR participant_id = $2)`,
    [conversationId, userId]
  );
  if (convRows.length === 0) throw Errors.forbidden('You are not part of this conversation');

  const offset = (page - 1) * limit;

  const { rows, rowCount } = await query<MessageWithFiles>(
    `SELECT
       m.*,
       row_to_json(u.*) AS sender,
       (
         SELECT json_agg(f.*)
         FROM files f
         WHERE f.message_id = m.id
       ) AS files
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );

  const { rows: countRows } = await query<{ total: string }>(
    'SELECT COUNT(*)::text AS total FROM messages WHERE conversation_id = $1',
    [conversationId]
  );

  const total = parseInt(countRows[0]?.total ?? '0', 10);

  return {
    data:    rows,
    total,
    page,
    limit,
    hasMore: offset + (rowCount ?? 0) < total,
  };
}

// ─── Soft-delete a message ────────────────────────────────────────────────────
export async function softDeleteMessage(
  messageId: string,
  userId:    string,
  isAdmin:   boolean,
): Promise<void> {
  const { rows } = await query<DBMessage>(
    'SELECT * FROM messages WHERE id = $1 AND deleted_at IS NULL',
    [messageId]
  );

  if (rows.length === 0) throw Errors.notFound('Message');

  const msg = rows[0];

  if (!isAdmin && msg.sender_id !== userId) {
    throw Errors.forbidden('You can only delete your own messages');
  }

  await query(
    `UPDATE messages
     SET deleted_at = NOW(), content = '[message deleted]'
     WHERE id = $1`,
    [messageId]
  );
}

// ─── Mark messages as read ────────────────────────────────────────────────────
export async function markConversationRead(
  conversationId: string,
  userId:         string,
): Promise<void> {
  await query(
    `UPDATE messages
     SET is_read = true
     WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
    [conversationId, userId]
  );
}

// ─── Private helper ───────────────────────────────────────────────────────────
async function getMessageById(id: string): Promise<MessageWithFiles> {
  const { rows } = await query<MessageWithFiles>(
    `SELECT m.*,
       row_to_json(u.*) AS sender,
       (SELECT json_agg(f.*) FROM files f WHERE f.message_id = m.id) AS files
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.id = $1`,
    [id]
  );
  if (rows.length === 0) throw Errors.notFound('Message');
  return rows[0];
}
