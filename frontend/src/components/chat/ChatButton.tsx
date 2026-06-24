'use client';

import { useEffect } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

export default function ChatButton() {
  const isOpen    = useChatStore(s => s.isOpen);
  const openChat  = useChatStore(s => s.openChat);
  const closeChat = useChatStore(s => s.closeChat);
  const unread    = useChatStore(s => s.unreadCounts);

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  // Listen for programmatic open-chat events (from Navbar CTA, Services CTA)
  useEffect(() => {
    const handler = () => openChat();
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, [openChat]);

  return (
    <button
      onClick={() => isOpen ? closeChat() : openChat()}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center',
        'transition-all duration-300 shadow-gold',
        isOpen
          ? 'bg-surface-3 border border-divider hover:border-gold-dim'
          : 'bg-gold-gradient border-0 hover:shadow-gold-lg',
        // Pulse animation only when unread and closed
        !isOpen && totalUnread > 0 && 'animate-gold-pulse'
      )}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      style={{ borderRadius: '2px' }}
    >
      {/* Unread badge */}
      {!isOpen && totalUnread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center font-sans text-[0.6rem] font-medium text-white z-10 animate-bounce">
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      )}

      {isOpen
        ? <X size={18} className="text-text-secondary" />
        : totalUnread > 0
          ? <Bell size={18} className="text-black" />
          : <MessageSquare size={18} className="text-black" />
      }
    </button>
  );
}