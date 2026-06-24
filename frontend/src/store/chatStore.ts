import { create } from 'zustand';
import type { Conversation, Message, StaffMember, TypingState } from '@/types';

interface ChatState {
  // Panel state
  isOpen:          boolean;
  step:            'select' | 'chat';

  // Data
  conversations:   Conversation[];
  activeId:        string | null;
  messages:        Record<string, Message[]>; // keyed by conversationId
  staff:           StaffMember[];
  typingUsers:     TypingState;
  unreadCounts:    Record<string, number>;

  // Actions
  openChat:               ()                                  => void;
  closeChat:              ()                                  => void;
  setStep:                (step: 'select' | 'chat')           => void;
  setActiveConversation:  (id: string)                        => void;
  setConversations:       (convs: Conversation[])             => void;
  addConversation:        (conv: Conversation)                => void;
  setMessages:            (convId: string, msgs: Message[])   => void;
  addMessage:             (convId: string, msg: Message)      => void;
  deleteMessage:          (convId: string, msgId: string)     => void;
  setStaff:               (staff: StaffMember[])              => void;
  setTyping:              (convId: string, userId: string, name: string) => void;
  clearTyping:            (convId: string, userId: string)    => void;
  incrementUnread:        (convId: string)                    => void;
  clearUnread:            (convId: string)                    => void;
  reset:                  ()                                  => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen:        false,
  step:          'select',
  conversations: [],
  activeId:      null,
  messages:      {},
  staff:         [],
  typingUsers:   {},
  unreadCounts:  {},

  openChat:  () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  setStep: (step) => set({ step }),

  setActiveConversation: (id) => {
    set({ activeId: id, step: 'chat' });
    get().clearUnread(id);
  },

  setConversations: (convs) => set({ conversations: convs }),

  addConversation: (conv) =>
    set(s => ({
      conversations: [conv, ...s.conversations.filter(c => c.id !== conv.id)],
    })),

  setMessages: (convId, msgs) =>
    set(s => ({ messages: { ...s.messages, [convId]: msgs } })),

  addMessage: (convId, msg) =>
    set(s => ({
      messages: {
        ...s.messages,
        [convId]: [...(s.messages[convId] ?? []), msg],
      },
      conversations: s.conversations.map(c =>
        c.id === convId
          ? { ...c, lastMessageAt: msg.createdAt, lastMessage: msg }
          : c
      ),
    })),

  deleteMessage: (convId, msgId) =>
    set(s => ({
      messages: {
        ...s.messages,
        [convId]: (s.messages[convId] ?? []).map(m =>
          m.id === msgId ? { ...m, deletedAt: new Date().toISOString() } : m
        ),
      },
    })),

  setStaff: (staff) => set({ staff }),

  setTyping: (convId, userId, name) =>
    set(s => {
      const existing = s.typingUsers[convId] ?? [];
      const filtered = existing.filter(u => u.userId !== userId);
      return { typingUsers: { ...s.typingUsers, [convId]: [...filtered, { userId, userName: name }] } };
    }),

  clearTyping: (convId, userId) =>
    set(s => ({
      typingUsers: {
        ...s.typingUsers,
        [convId]: (s.typingUsers[convId] ?? []).filter(u => u.userId !== userId),
      },
    })),

  incrementUnread: (convId) =>
    set(s => ({
      unreadCounts: { ...s.unreadCounts, [convId]: (s.unreadCounts[convId] ?? 0) + 1 },
    })),

  clearUnread: (convId) =>
    set(s => ({ unreadCounts: { ...s.unreadCounts, [convId]: 0 } })),

  reset: () =>
    set({ conversations: [], activeId: null, messages: {}, typingUsers: {}, unreadCounts: {} }),
}));
