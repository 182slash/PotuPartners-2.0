'use client';

import { useEffect, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import ContactSelector from './ContactSelector';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import AuthGate from './AuthGate';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function ChatPanel() {
  const isOpen    = useChatStore(s => s.isOpen);
  const closeChat = useChatStore(s => s.closeChat);
  const step      = useChatStore(s => s.step);
  const activeId  = useChatStore(s => s.activeId);
  const convs     = useChatStore(s => s.conversations);
  const userId    = useAuthStore(s => s.user?.id);

  const { loadConversations, joinConversation } = useChat();

  const panelRef = useRef<HTMLDivElement>(null);

  // Load conversations once when chat opens and user is authenticated
  useEffect(() => {
    if (isOpen && userId) loadConversations();
  }, [isOpen, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join all conversation rooms whenever the list grows
  useEffect(() => {
    if (userId && convs.length > 0) {
      convs.forEach(c => joinConversation(c.id));
    }
  }, [convs.length, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showSidebar = convs.length > 0 && step === 'chat';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed z-50 bg-surface border border-divider shadow-xl transition-all duration-500',
          'bottom-0 left-0 right-0 h-[92vh]',
          'md:bottom-24 md:left-auto md:right-6 md:w-[580px] md:h-[680px]',
          isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full md:translate-y-8 opacity-0 pointer-events-none'
        )}
        style={{ borderRadius: '2px' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-gold-faint flex items-center justify-center">
              <MessageSquare size={12} className="text-gold" />
            </div>
            <div>
              <span className="font-serif text-sm font-light text-text-primary tracking-wide">
                PotuPartners
              </span>
              <span className="font-sans text-[0.6rem] tracking-[0.15em] text-gold opacity-60 ml-2 uppercase">
                Legal Chat
              </span>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-1.5 text-text-muted hover:text-gold transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 57px)' }}>
          {!userId ? (
            <AuthGate />
          ) : (
            <div className="flex h-full">
              {showSidebar && (
                <div className="hidden md:flex flex-col w-40 border-r border-divider overflow-hidden">
                  <ChatSidebar />
                </div>
              )}
              <div className="flex-1 flex flex-col overflow-hidden">
                {step === 'select' || !activeId ? <ContactSelector /> : <ChatWindow />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}