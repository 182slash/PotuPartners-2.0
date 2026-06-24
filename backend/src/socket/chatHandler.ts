import type { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/auth';
import { createMessage, softDeleteMessage, markConversationRead } from '../modules/messages/messages.service';
import { getConversationById, generateRoomKey } from '../modules/conversations/conversations.service';
import { listMessages } from '../modules/messages/messages.service';
import { query } from '../config/database';
import { queryAi } from '../modules/admin/ai.service';
import { logger } from '../utils/logger';

// ─── Socket event names ───────────────────────────────────────────────────────
const EV = {
  // Client → Server
  JOIN_CONVERSATION:   'join_conversation',
  SEND_MESSAGE:        'send_message',
  DELETE_MESSAGE:      'delete_message',
  TYPING_START:        'typing_start',
  TYPING_STOP:         'typing_stop',
  MARK_READ:           'mark_read',

  // Server → Client
  CONVERSATION_JOINED: 'conversation_joined',
  NEW_MESSAGE:         'new_message',
  MESSAGE_DELETED:     'message_deleted',
  USER_TYPING:         'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  AI_THINKING:         'ai_thinking',
  AI_RESPONSE:         'ai_response',
  USER_ONLINE:         'user_online',
  USER_OFFLINE:        'user_offline',
  ERROR:               'error',
} as const;

// ─── Augment socket with user data ────────────────────────────────────────────
interface AuthSocket extends Socket {
  data: {
    userId:   string;
    role:     string;
    email:    string;
    fullName: string;
  };
}

// ─── Register Socket.io handlers ──────────────────────────────────────────────
export function registerChatHandlers(io: Server): void {
  const chatNsp = io.of('/chat');

  // ─── Authentication middleware ──────────────────────────────────────────────
  chatNsp.use(async (socket: Socket, next) => {
    const token = (socket.handshake.auth as { token?: string })?.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const payload = verifyAccessToken(token);

      // Fetch user details
      const { rows } = await query<{ id: string; role: string; email: string; full_name: string }>(
        'SELECT id, role, email, full_name FROM users WHERE id = $1 AND is_active = true',
        [payload.sub]
      );

      if (rows.length === 0) return next(new Error('User not found'));

      const user = rows[0];
      (socket as AuthSocket).data = {
        userId:   user.id,
        role:     user.role,
        email:    user.email,
        fullName: user.full_name,
      };

      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection handler ─────────────────────────────────────────────────────
  chatNsp.on('connection', (socket: Socket) => {
    const s    = socket as AuthSocket;
    const { userId, fullName } = s.data;

    logger.info('Socket connected', { userId, socketId: s.id });

    // Mark user online
    setUserOnline(userId, true).then(() => {
      chatNsp.emit(EV.USER_ONLINE, { userId });
    });

    // ── join_conversation ───────────────────────────────────────────────────
    s.on(EV.JOIN_CONVERSATION, async ({ conversationId }: { conversationId: string }) => {
      try {
        // Verify user is actually a participant
        const conv = await getConversationById(conversationId, userId);

        await s.join(conv.room_key);

        // Send message history to joining client
        const messages = await listMessages(conversationId, userId, 1, 50);

        s.emit(EV.CONVERSATION_JOINED, {
          roomKey:  conv.room_key,
          history:  messages.data,
        });

        logger.debug('User joined conversation', { userId, conversationId });
      } catch (err) {
        s.emit(EV.ERROR, { code: 'JOIN_FAILED', message: (err as Error).message });
      }
    });

    // ── send_message ────────────────────────────────────────────────────────
    s.on(EV.SEND_MESSAGE, async ({
      conversationId,
      content,
      fileId,
    }: {
      conversationId: string;
      content?:       string;
      fileId?:        string;
    }) => {
      try {
        if (!content?.trim() && !fileId) return;

        // Get conversation to determine room key and if AI
        const conv = await getConversationById(conversationId, userId);

        const messageType = fileId ? 'file' : 'text';

        const message = await createMessage({
          conversationId,
          senderId:    userId,
          content:     content?.trim() ?? null,
          messageType,
          fileId,
        });

        // Broadcast to everyone in the room
        chatNsp.to(conv.room_key).emit(EV.NEW_MESSAGE, message);

        // If AI chat — trigger AI response
        if (conv.is_ai_chat && content?.trim()) {
          // Emit "AI is thinking" immediately
          chatNsp.to(conv.room_key).emit(EV.AI_THINKING);

          // Process AI response in background
          processAiResponse(chatNsp, conv.room_key, conversationId, userId, content.trim());
        }
      } catch (err) {
        logger.error('send_message failed', { userId, error: (err as Error).message });
        s.emit(EV.ERROR, { code: 'SEND_FAILED', message: 'Failed to send message' });
      }
    });

    // ── delete_message ──────────────────────────────────────────────────────
    s.on(EV.DELETE_MESSAGE, async ({ messageId }: { messageId: string }) => {
      try {
        // Get conversation to find room key
        const { rows } = await query<{ conversation_id: string; room_key: string }>(
          `SELECT m.conversation_id, c.room_key
           FROM messages m
           JOIN conversations c ON c.id = m.conversation_id
           WHERE m.id = $1`,
          [messageId]
        );

        if (rows.length === 0) return;

        const { conversation_id, room_key } = rows[0];

        await softDeleteMessage(messageId, userId, s.data.role === 'admin');

        chatNsp.to(room_key).emit(EV.MESSAGE_DELETED, {
          messageId,
          conversationId: conversation_id,
        });
      } catch (err) {
        s.emit(EV.ERROR, { code: 'DELETE_FAILED', message: (err as Error).message });
      }
    });

    // ── typing_start ────────────────────────────────────────────────────────
    s.on(EV.TYPING_START, async ({ conversationId }: { conversationId: string }) => {
      try {
        const conv = await getConversationById(conversationId, userId);
        s.to(conv.room_key).emit(EV.USER_TYPING, {
          userId,
          userName:       fullName,
          conversationId,
        });
      } catch { /* ignore */ }
    });

    // ── typing_stop ─────────────────────────────────────────────────────────
    s.on(EV.TYPING_STOP, async ({ conversationId }: { conversationId: string }) => {
      try {
        const conv = await getConversationById(conversationId, userId);
        s.to(conv.room_key).emit(EV.USER_STOPPED_TYPING, { userId, conversationId });
      } catch { /* ignore */ }
    });

    // ── mark_read ───────────────────────────────────────────────────────────
    s.on(EV.MARK_READ, async ({ conversationId }: { conversationId: string }) => {
      try {
        await markConversationRead(conversationId, userId);
      } catch { /* non-critical */ }
    });

    // ── disconnect ──────────────────────────────────────────────────────────
    s.on('disconnect', async () => {
      logger.info('Socket disconnected', { userId, socketId: s.id });
      await setUserOnline(userId, false);
      chatNsp.emit(EV.USER_OFFLINE, { userId });
    });
  });
}

// ─── Process AI response asynchronously ──────────────────────────────────────
async function processAiResponse(
  nsp:            ReturnType<Server['of']>,
  roomKey:        string,
  conversationId: string,
  userId:         string,
  message:        string,
): Promise<void> {
  try {
    const result = await queryAi(conversationId, userId, message);

    // queryAi already persists the AI message — just broadcast it
    // Fetch the persisted message to get full structure
    const { rows } = await query(
      `SELECT m.*, row_to_json(u.*) AS sender
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1 AND m.message_type = 'ai_response'
       ORDER BY m.created_at DESC LIMIT 1`,
      [conversationId]
    );

    if (rows.length > 0) {
      nsp.to(roomKey).emit(EV.AI_RESPONSE, rows[0]);
    }
  } catch (err) {
    logger.error('AI response processing failed', { error: (err as Error).message });
    nsp.to(roomKey).emit(EV.ERROR, {
      code:    'AI_ERROR',
      message: 'AI assistant temporarily unavailable',
    });
  }
}

// ─── Update user online status ────────────────────────────────────────────────
async function setUserOnline(userId: string, isOnline: boolean): Promise<void> {
  await query(
    'UPDATE users SET is_online = $1, last_seen = NOW() WHERE id = $2',
    [isOnline, userId]
  ).catch(err => logger.error('Failed to update online status', { error: err.message }));
}
