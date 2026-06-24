'use client';

import { useEffect } from 'react';
import { Bot, ChevronRight, Bell } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import { getInitials, cn } from '@/lib/utils';

export default function ContactSelector() {
  const { staff, loadStaff, loadConversations, openConversation } = useChat();
  const unread        = useChatStore(s => s.unreadCounts);
  const conversations = useChatStore(s => s.conversations);
  const setStep       = useChatStore(s => s.setStep);

  const totalUnread      = Object.values(unread).reduce((a, b) => a + b, 0);
  const showBell         = conversations.length > 0 || totalUnread > 0;

  // Run once on mount only — empty deps prevents re-fire loop
  useEffect(() => {
    loadStaff();
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const associates = staff.filter(s => s.role === 'associate');
  const partners   = staff.filter(s => s.role === 'partner');

  const selectContact = async (id: string | null, isAi: boolean) => {
    await openConversation(id, isAi);
  };

  const goToInbox = () => setStep('chat');

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-divider flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-light text-text-primary mb-1">
              Start a Conversation
            </h2>
            <p className="font-sans text-xs text-text-secondary font-light">
              Select who you would like to speak with.
            </p>
          </div>

          {/* Notification bell */}
          {showBell && (
            <button
              onClick={goToInbox}
              className={cn(
                'relative flex-shrink-0 ml-3 mt-0.5 w-8 h-8 flex items-center justify-center',
                'border transition-all duration-200',
                totalUnread > 0
                  ? 'border-gold text-gold bg-gold/5 hover:bg-gold/10'
                  : 'border-divider text-text-muted hover:border-gold-faint hover:text-gold'
              )}
              style={{ borderRadius: '2px' }}
              aria-label="Open inbox"
              title="View conversations"
            >
              {totalUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center font-sans text-[0.55rem] font-medium text-white z-10">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
              {totalUnread > 0 && (
                <span className="absolute inset-0 rounded-sm border border-gold opacity-0 animate-ping-slow" />
              )}
              <Bell
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  totalUnread > 0 && 'animate-bell-ring'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">

        {/* AI Chatbot */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[0.6rem] tracking-[0.2em] uppercase text-gold opacity-60 font-sans mb-2 px-1">
            AI Assistant
          </p>
          <button
            onClick={() => selectContact(null, true)}
            className="w-full flex items-center gap-3 p-3 hover:bg-surface-3 border border-transparent hover:border-gold-faint transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold-faint flex items-center justify-center">
              <Bot size={16} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-text-primary font-light">PotuPartners AI</p>
              <p className="font-sans text-xs text-text-muted truncate">
                Ask about our services, processes & policies
              </p>
            </div>
            <ChevronRight size={14} className="text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Partners */}
        {partners.length > 0 && (
          <StaffGroup
            title="Managing Partners"
            members={partners}
            onSelect={id => selectContact(id, false)}
          />
        )}

        {/* Associates */}
        {associates.length > 0 && (
          <StaffGroup
            title="Associates"
            members={associates}
            onSelect={id => selectContact(id, false)}
          />
        )}

        {/* Loading state */}
        {staff.length === 0 && (
          <div className="px-4 pt-2 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-28" />
                  <div className="skeleton h-2 w-40" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-divider flex-shrink-0">
        {showBell ? (
          <div className="flex items-center justify-between">
            <p className="font-sans text-[0.6rem] text-text-muted leading-relaxed">
              All conversations are confidential and stored securely.
            </p>
            <button
              onClick={goToInbox}
              className="flex items-center gap-1 text-[0.6rem] text-gold hover:text-gold/80 font-sans tracking-wide transition-colors ml-3 flex-shrink-0"
            >
              {totalUnread > 0 && (
                <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[0.5rem] font-medium">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
              <span>INBOX</span>
              <ChevronRight size={10} />
            </button>
          </div>
        ) : (
          <p className="font-sans text-[0.6rem] text-text-muted leading-relaxed">
            All conversations are confidential and stored securely.
          </p>
        )}
      </div>
    </div>
  );
}

function StaffGroup({
  title,
  members,
  onSelect,
}: {
  title: string;
  members: ReturnType<typeof useChat>['staff'];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-gold opacity-60 font-sans mb-2 px-1">
        {title}
      </p>
      <div className="space-y-1">
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-surface-3 border border-transparent hover:border-gold-faint transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-surface-3 border border-divider flex items-center justify-center relative">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xs font-light text-gold select-none">
                  {getInitials(m.fullName)}
                </span>
              )}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black',
                  m.isOnline ? 'bg-emerald-500' : 'bg-surface-3'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-text-primary font-light truncate">{m.fullName}</p>
              <p className="font-sans text-xs text-text-muted truncate">{m.title ?? m.role}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {m.isOnline && (
                <span className="text-[0.55rem] text-emerald-500 font-sans tracking-wide">Online</span>
              )}
              <ChevronRight size={14} className="text-text-muted group-hover:text-gold transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}