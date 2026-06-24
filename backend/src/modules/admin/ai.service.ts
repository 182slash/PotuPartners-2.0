import axios from 'axios';
import { query } from '../../config/database';
import { createMessage } from '../messages/messages.service';
import { Errors } from '../../utils/errors';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { DBMessage } from '../../types';

export interface AiQueryResult {
  answer:  string;
  sources: Array<{ docTitle: string; chunkIndex: number; score: number }>;
  messageId: string;
}

// ─── Main AI query handler ────────────────────────────────────────────────────
export async function queryAi(
  conversationId: string,
  userId:         string,
  userMessage:    string,
): Promise<AiQueryResult> {
  // 1. Verify user is in this AI conversation
  const { rows: convRows } = await query<{ id: string; is_ai_chat: boolean }>(
    `SELECT id, is_ai_chat FROM conversations
     WHERE id = $1 AND (client_id = $2 OR participant_id = $2)`,
    [conversationId, userId]
  );

  if (convRows.length === 0) throw Errors.forbidden('Conversation not found');
  if (!convRows[0].is_ai_chat) throw Errors.badRequest('This is not an AI conversation');

  // 2. Persist user's message
  await createMessage({
    conversationId,
    senderId:    userId,
    content:     userMessage,
    messageType: 'text',
  });

  // 3. Fetch last 6 messages for context
  const { rows: historyRows } = await query<DBMessage>(
    `SELECT sender_id, content FROM messages
     WHERE conversation_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT 6`,
    [conversationId]
  );

  const history = historyRows
    .reverse()
    .map(m => ({
      role:    m.sender_id ? 'user' : 'assistant',
      content: m.content ?? '',
    }));

  // 4. Call RAG microservice
  let ragResponse: { answer: string; sources: AiQueryResult['sources'] };

  try {
    const { data } = await axios.post(
      `${env.RAG_SERVICE_URL}/query`,
      { question: userMessage, history },
      {
        headers: { 'X-Service-Secret': env.RAG_SERVICE_SECRET },
        timeout: 60_000,
      }
    );
    ragResponse = data;
  } catch (err) {
    logger.error('RAG service query failed', { error: (err as Error).message });
    ragResponse = {
      answer:  "I'm sorry, I'm currently unavailable. Please contact one of our associates directly for assistance.",
      sources: [],
    };
  }

  // 5. Persist AI response
  const aiMessage = await createMessage({
    conversationId,
    senderId:    null,   // null sender = AI bot
    content:     ragResponse.answer,
    messageType: 'ai_response',
  });

  return {
    answer:    ragResponse.answer,
    sources:   ragResponse.sources,
    messageId: aiMessage.id,
  };
}
