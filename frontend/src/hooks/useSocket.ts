'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSocket, SocketEvents, disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import type { Message } from '@/types';

export function useSocket() {
  const accessToken     = useAuthStore(s => s.accessToken);
  const addMessage      = useChatStore(s => s.addMessage);
  const deleteMessage   = useChatStore(s => s.deleteMessage);
  const setTyping       = useChatStore(s => s.setTyping);
  const clearTyping     = useChatStore(s => s.clearTyping);
  const incrementUnread = useChatStore(s => s.incrementUnread);
  const activeId        = useChatStore(s => s.activeId);

  const socketRef   = useRef<ReturnType<typeof getSocket> | null>(null);
  const activeIdRef = useRef<string | null>(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    socket.off(SocketEvents.NEW_MESSAGE);
    socket.off(SocketEvents.MESSAGE_DELETED);
    socket.off(SocketEvents.USER_TYPING);
    socket.off(SocketEvents.USER_STOPPED_TYPING);
    socket.off(SocketEvents.AI_THINKING);
    socket.off(SocketEvents.AI_RESPONSE);

    socket.on(SocketEvents.NEW_MESSAGE, (msg: any) => {
      console.log('[Socket] NEW_MESSAGE received:', msg);
      const conversationId = msg.conversationId ?? msg.conversation_id;
      if (!conversationId) return;
      addMessage(conversationId, { ...msg, conversationId });
      if (conversationId !== activeIdRef.current) {
        incrementUnread(conversationId);
      }
    });

    socket.on(SocketEvents.MESSAGE_DELETED, (data: any) => {
      const conversationId = data.conversationId ?? data.conversation_id;
      const messageId      = data.messageId      ?? data.message_id;
      if (conversationId && messageId) deleteMessage(conversationId, messageId);
    });

    socket.on(SocketEvents.USER_TYPING, ({ userId, userName, conversationId }: { userId: string; userName: string; conversationId: string }) => {
      setTyping(conversationId, userId, userName);
    });

    socket.on(SocketEvents.USER_STOPPED_TYPING, ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      clearTyping(conversationId, userId);
    });

    socket.on(SocketEvents.AI_THINKING, () => {
      console.log('[Socket] AI_THINKING received');
    });

    socket.on(SocketEvents.AI_RESPONSE, (msg: any) => {
      console.log('[Socket] AI_RESPONSE received:', msg);
      const conversationId = msg.conversationId ?? msg.conversation_id;
      if (!conversationId) return;
      addMessage(conversationId, { ...msg, conversationId });
    });

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE);
      socket.off(SocketEvents.MESSAGE_DELETED);
      socket.off(SocketEvents.USER_TYPING);
      socket.off(SocketEvents.USER_STOPPED_TYPING);
      socket.off(SocketEvents.AI_THINKING);
      socket.off(SocketEvents.AI_RESPONSE);
    };
  }, [accessToken, addMessage, deleteMessage, setTyping, clearTyping, incrementUnread]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit(SocketEvents.JOIN_CONVERSATION, { conversationId });
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, fileId?: string) => {
    socketRef.current?.emit(SocketEvents.SEND_MESSAGE, { conversationId, content, fileId });
  }, []);

  const deleteMsg = useCallback((messageId: string) => {
    socketRef.current?.emit(SocketEvents.DELETE_MESSAGE, { messageId });
  }, []);

  const sendTypingStart = useCallback((conversationId: string) => {
    socketRef.current?.emit(SocketEvents.TYPING_START, { conversationId });
  }, []);

  const sendTypingStop = useCallback((conversationId: string) => {
    socketRef.current?.emit(SocketEvents.TYPING_STOP, { conversationId });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit(SocketEvents.MARK_READ, { conversationId });
  }, []);

  return {
    socket:       socketRef.current,
    joinConversation,
    sendMessage,
    deleteMsg,
    sendTypingStart,
    sendTypingStop,
    markRead,
    disconnect: disconnectSocket,
  };
}