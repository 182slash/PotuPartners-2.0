'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, ArrowLeft, Bot, Trash2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import FileUpload from './FileUpload';
import { useChat } from '@/hooks/useChat';
import { getInitials, cn } from '@/lib/utils';

export default function ChatWindow() {
  const {
    activeId,
    conversations,
    messages,
    typingUsers,
    currentUser,
    sendMessage,
    deleteMessage,
    deleteConversation,
    handleTyping,
    setStep,
    markRead,
  } = useChat();

  const [inputValue,  setInputValue]  = useState('');
  const [showUpload,  setShowUpload]  = useState(false);
  const [pendingFile, setPendingFile] = useState<{ id: string; name: string } | null>(null);
  const [aiThinking,  setAiThinking]  = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  const conv = conversations.find(c => c.id === activeId);
  const msgs = activeId ? (messages[activeId] ?? []) : [];
  const typing = activeId ? (typingUsers[activeId] ?? []) : [];
  const isAiChat = conv?.isAiChat ?? false;

  const otherPerson = conv?.clientId === currentUser?.id ? conv?.participant : conv?.client;
  const chatName = isAiChat ? 'PotuPartners AI' : (otherPerson?.displayName ?? otherPerson?.fullName ?? 'Conversation');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length, typing.length, aiThinking]);

  useEffect(() => {
    if (activeId) markRead?.(activeId);
  }, [activeId, msgs.length]);

  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content && !pendingFile) return;
    sendMessage(content, pendingFile?.id);
    setInputValue('');
    setPendingFile(null);
    setShowUpload(false);
    inputRef.current?.focus();
  }, [inputValue, pendingFile, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    handleTyping();
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!activeId || !conv) return null;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-divider flex-shrink-0">
        <button
          onClick={() => setStep('select')}
          className="p-1 text-text-muted hover:text-gold transition-colors flex-shrink-0 md:hidden"
        >
          <ArrowLeft size={16} />
        </button>

        <div className={cn(
          'w-8 h-8 flex-shrink-0 border flex items-center justify-center',
          isAiChat ? 'border-gold-faint bg-gold/5' : 'border-divider'
        )}>
          {isAiChat
            ? <Bot size={13} className="text-gold" />
            : <span className="font-serif text-xs text-gold select-none">
                {getInitials(chatName)}
              </span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm text-text-primary font-light truncate">{chatName}</p>
          {isAiChat ? (
            <p className="font-sans text-[0.6rem] text-gold opacity-60">
              AI • Knowledge Assistant
            </p>
          ) : otherPerson?.isOnline ? (
            <p className="font-sans text-[0.6rem] text-emerald-500">Online</p>
          ) : (
            <p className="font-sans text-[0.6rem] text-text-muted">
              {otherPerson?.title ?? 'Offline'}
            </p>
          )}
        </div>

        <button
          onClick={() => activeId && deleteConversation(activeId)}
          className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
          title="Delete conversation"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div className="w-12 h-12 border border-divider flex items-center justify-center mb-4">
              {isAiChat
                ? <Bot size={20} className="text-gold opacity-50" />
                : <span className="font-serif text-lg font-light text-gold opacity-50 select-none">
                    {getInitials(chatName)}
                  </span>
              }
            </div>
            <p className="font-serif text-sm font-light text-text-muted text-center">
              {isAiChat
                ? 'Ask anything about our services, practice areas, or processes.'
                : `Your conversation with ${chatName} begins here.`
              }
            </p>
          </div>
        )}

        {msgs.map(msg => {
          const senderId = msg.senderId ?? (msg as any).sender_id;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={senderId === currentUser?.id}
              isAiBot={senderId === null && msg.messageType !== 'file'}
              onDelete={deleteMessage}
              canDelete={senderId === currentUser?.id}
            />
          );
        })}

        {typing.map(t => (
          <TypingIndicator key={t.userId} name={t.userName} />
        ))}

        {aiThinking && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 border border-gold-faint bg-gold/5 flex items-center justify-center">
              <Bot size={12} className="text-gold" />
            </div>
            <div className="message-bubble ai flex items-center gap-1.5 py-3 px-4">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* File upload panel */}
      {showUpload && activeId && (
        <FileUpload
          conversationId={activeId}
          onUploadComplete={(id, name) => {
            setPendingFile({ id, name });
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Pending file chip */}
      {pendingFile && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gold-faint bg-gold/5 w-fit">
            <Paperclip size={11} className="text-gold" />
            <span className="text-xs text-gold font-sans truncate max-w-[160px]">{pendingFile.name}</span>
            <button
              onClick={() => setPendingFile(null)}
              className="text-gold opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 border border-divider bg-surface-2 focus-within:border-gold-dim transition-colors duration-200">
          <button
            onClick={() => setShowUpload(v => !v)}
            className={cn(
              'p-3 self-end transition-colors duration-200',
              showUpload ? 'text-gold' : 'text-text-muted hover:text-gold'
            )}
            title="Attach file"
          >
            <Paperclip size={15} />
          </button>

          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isAiChat ? 'Ask a question…' : 'Type a message…'}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder-text-muted font-sans font-light py-3 pr-2 outline-none leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() && !pendingFile}
            className={cn(
              'p-3 self-end transition-all duration-200',
              (inputValue.trim() || pendingFile)
                ? 'text-gold hover:text-gold-light'
                : 'text-text-muted opacity-30 cursor-not-allowed'
            )}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="font-sans text-[0.55rem] text-text-muted mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}