'use client';

import { Bot, Trash2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { formatConversationTime, getInitials, truncate, cn } from '@/lib/utils';

export default function ChatSidebar() {
  const {
    conversations,
    activeId,
    unreadCounts,
    openConversationById,
    deleteConversation,
    currentUser,
    setStep,
  } = useChat();

  if (conversations.length === 0) return null;

  return (
    <div className="flex flex-col h-full border-r border-divider">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-divider flex-shrink-0 flex items-center justify-between">
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-gold opacity-60 font-sans">
          Conversations
        </span>
        <button
          onClick={() => setStep('select')}
          className="text-[0.6rem] tracking-[0.1em] text-text-muted hover:text-gold transition-colors font-sans uppercase"
        >
          + New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const isActive  = conv.id === activeId;
          const unread    = unreadCounts[conv.id] ?? 0;
          const isAi      = conv.isAiChat;
          const other     = conv.clientId === currentUser?.id ? conv.participant : conv.client;
          const name      = isAi ? 'AI Assistant' : (other?.displayName ?? other?.fullName ?? 'Unknown');
          const lastMsg   = conv.lastMessage?.content;
          const lastTime  = formatConversationTime(conv.lastMessageAt);

          return (
            <div
              key={conv.id}
              className={cn(
                'group flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-divider transition-all duration-200 hover:bg-surface-3 relative',
                isActive && 'bg-surface-3 border-l-2 border-l-gold'
              )}
              onClick={() => openConversationById(conv.id)}
            >
              {/* Avatar */}
              <div className={cn(
                'w-9 h-9 flex-shrink-0 border flex items-center justify-center',
                isAi ? 'border-gold-faint bg-gold/5' : 'border-divider bg-surface-3'
              )}>
                {isAi
                  ? <Bot size={14} className="text-gold" />
                  : <span className="font-serif text-xs font-light text-gold select-none">
                      {getInitials(name)}
                    </span>
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-sans text-sm text-text-primary font-light truncate">
                    {name}
                  </span>
                  <span className="text-[0.6rem] text-text-muted font-sans flex-shrink-0">
                    {lastTime}
                  </span>
                </div>
                <p className="font-sans text-xs text-text-muted truncate">
                  {lastMsg ? truncate(lastMsg, 40) : 'No messages yet'}
                </p>
              </div>

              {/* Unread badge */}
              {unread > 0 && (
                <span className="absolute top-3 right-3 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-black font-sans text-[0.55rem] font-medium">
                  {unread}
                </span>
              )}

              {/* Delete (hidden until hover) */}
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 transition-all duration-200 z-10"
                onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                title="Delete conversation"
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}