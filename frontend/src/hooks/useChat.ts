'use client';

import { useCallback, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { conversationService, messageService, userService } from '@/services/api';
import { useSocket } from './useSocket';
import toast from 'react-hot-toast';
import { debounce } from '@/lib/utils';

export function useChat() {
  const user  = useAuthStore(s => s.user);
  const store = useChatStore();

  // ─── Stable scalar selectors (prevent stale closure / re-render loops) ────
  const staffCount        = useChatStore(s => s.staff.length);
  const conversationCount = useChatStore(s => s.conversations.length);

  const socket = useSocket();

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load staff list for contact selector ────────────────────────────────
  const loadStaff = useCallback(async () => {
    if (staffCount > 0) return;
    try {
      const { data } = await userService.getStaff();
      useChatStore.getState().setStaff(data.data);
    } catch {
      // Non-critical: silently fail
    }
  }, [staffCount]);

  // ─── Load all conversations for current user ──────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    if (conversationCount > 0) return;
    try {
      const { data } = await conversationService.list();
      useChatStore.getState().setConversations(data.data);
    } catch {
      toast.error('Could not load conversations');
    }
  }, [user, conversationCount]);

  // ─── Open or create a conversation (new conversation flow) ───────────────
  const openConversation = useCallback(async (
    participantId: string | null,
    isAiChat: boolean
  ) => {
    try {
      const { data } = await conversationService.createOrGet(participantId, isAiChat);
      const conv = data.data;
      const s = useChatStore.getState();
      s.addConversation(conv);
      s.setActiveConversation(conv.id);

      if (!s.messages[conv.id]) {
        const { data: msgData } = await messageService.list(conv.id);
        useChatStore.getState().setMessages(conv.id, msgData.data);
      }

      socket.joinConversation(conv.id);
    } catch {
      toast.error('Could not open conversation');
    }
  }, [socket]);

  // ─── Open an existing conversation by ID (sidebar click) ─────────────────
  const openConversationById = useCallback(async (convId: string) => {
    useChatStore.getState().setActiveConversation(convId);
    try {
      const { data: msgData } = await messageService.list(convId);
      useChatStore.getState().setMessages(convId, msgData.data);
    } catch {
      // silently fail
    }
    socket.joinConversation(convId);
  }, [socket]);

  // ─── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback((content: string, fileId?: string) => {
    const convId = useChatStore.getState().activeId;
    if (!convId || (!content.trim() && !fileId)) return;
    socket.sendMessage(convId, content.trim(), fileId);
    socket.sendTypingStop(convId);
  }, [socket]);

  // ─── Delete a message ─────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId: string) => {
    const convId = useChatStore.getState().activeId;
    if (!convId) return;
    try {
      await messageService.delete(messageId);
      useChatStore.getState().deleteMessage(convId, messageId);
      socket.deleteMsg(messageId);
    } catch {
      toast.error('Could not delete message');
    }
  }, [socket]);

  // ─── Delete a whole conversation ──────────────────────────────────────────
  const deleteConversation = useCallback(async (convId: string) => {
    try {
      await conversationService.delete(convId);
      const s = useChatStore.getState();
      s.setConversations(s.conversations.filter(c => c.id !== convId));
      if (s.activeId === convId) s.setStep('select');
      toast.success('Conversation deleted');
    } catch {
      toast.error('Could not delete conversation');
    }
  }, []);

  // ─── Mark messages as read ────────────────────────────────────────────────
  const markRead = useCallback(async (conversationId: string) => {
    try {
      await messageService.markRead(conversationId);
      useChatStore.getState().clearUnread(conversationId);
    } catch {
      // Non-critical
    }
  }, []);

  // ─── Typing indicator ─────────────────────────────────────────────────────
  const handleTyping = useCallback(
    debounce(() => {
      const convId = useChatStore.getState().activeId;
      if (!convId) return;
      socket.sendTypingStart(convId);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.sendTypingStop(convId);
      }, 2000);
    }, 300) as () => void,
    [socket]
  );

  return {
    ...store,
    loadStaff,
    loadConversations,
    openConversation,
    openConversationById,
    sendMessage,
    deleteMessage,
    deleteConversation,
    handleTyping,
    markRead,
    joinConversation: socket.joinConversation,
    currentUser: user,
  };
}