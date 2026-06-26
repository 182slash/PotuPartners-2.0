import OpenAI from 'openai';
import { query } from '../../config/database';
import { createMessage } from '../messages/messages.service';
import { Errors } from '../../utils/errors';
import { env } from '../../config/env';
import type { DBMessage } from '../../types';

export interface AiQueryResult {
  answer:    string;
  sources:   Array<{ docTitle: string; chunkIndex: number; score: number }>;
  messageId: string;
}

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

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
      role:    m.sender_id ? 'user' as const : 'assistant' as const,
      content: m.content ?? '',
    }));

  // 4. Call OpenAI
  let answer: string;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional legal assistant for Potu & Partners Law Office, an Indonesian legal firm. 
You help clients with general legal inquiries, explain legal processes, and guide them on how the firm can assist them.
Be professional, concise, and empathetic. Always recommend consulting directly with one of the firm's lawyers for specific legal advice.
Respond in the same language the client uses (Indonesian or English).`,
        },
        ...history,
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    answer = completion.choices[0]?.message?.content
      ?? "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (err) {
    answer = "I'm sorry, I'm currently unavailable. Please contact one of our associates directly for assistance.";
  }

  // 5. Persist AI response
  const aiMessage = await createMessage({
    conversationId,
    senderId:    null,
    content:     answer,
    messageType: 'ai_response',
  });

  return {
    answer,
    sources:   [],
    messageId: aiMessage.id,
  };
}