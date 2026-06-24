'use client';

import { useState } from 'react';
import { Trash2, FileText, Download, Bot } from 'lucide-react';
import { formatMessageTime, formatFileSize, isImageFile, cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message:       Message;
  isOwn:         boolean;
  isAiBot:       boolean;
  onDelete:      (id: string) => void;
  canDelete:     boolean;
}

// Helper: read sender name handling both camelCase and snake_case from API
function getSenderName(sender: any): string {
  return sender?.displayName ?? sender?.display_name ?? sender?.fullName ?? sender?.full_name ?? 'Staff';
}

function getSenderInitial(sender: any): string {
  return (getSenderName(sender))[0] ?? '?';
}

export default function MessageBubble({
  message,
  isOwn,
  isAiBot,
  onDelete,
  canDelete,
}: MessageBubbleProps) {
  const [hovered,    setHovered]    = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  // Support both camelCase and snake_case fields from API
  const deletedAt  = message.deletedAt  ?? (message as any).deleted_at;
  const createdAt  = message.createdAt  ?? (message as any).created_at;
  const isRead     = message.isRead     ?? (message as any).is_read;

  if (deletedAt) {
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'message-bubble text-text-muted border-dashed',
          isOwn ? 'outgoing' : 'incoming',
          'italic text-xs opacity-50'
        )}>
          Message deleted
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (delConfirm) {
      onDelete(message.id);
      setDelConfirm(false);
    } else {
      setDelConfirm(true);
      setTimeout(() => setDelConfirm(false), 3000);
    }
  };

  return (
    <div
      className={cn('flex items-end gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDelConfirm(false); }}
    >
      {/* Avatar — only for incoming */}
      {!isOwn && (
        <div className="w-7 h-7 flex-shrink-0 border border-divider flex items-center justify-center self-end mb-1">
          {isAiBot
            ? <Bot size={12} className="text-gold" />
            : <span className="font-serif text-[0.55rem] text-gold">
                {getSenderInitial(message.sender)}
              </span>
          }
        </div>
      )}

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[70%] min-w-0', isOwn ? 'items-end' : 'items-start')}>

        {/* Sender name (incoming only) */}
        {!isOwn && (
          <span className="text-[0.6rem] tracking-wide text-text-muted font-sans px-1">
            {isAiBot ? 'PotuPartners AI' : getSenderName(message.sender)}
          </span>
        )}

        {/* Main bubble */}
        <div className={cn(
          'message-bubble',
          isOwn ? 'outgoing' : isAiBot ? 'ai' : 'incoming',
        )}>
          {/* File attachments */}
          {message.files?.map(file => (
            <FilePreview key={file.id} file={file} />
          ))}

          {/* Text content */}
          {message.content && (
            <p className="text-sm font-sans font-light leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[0.6rem] text-text-muted font-sans px-1">
          {formatMessageTime(createdAt)}
          {isOwn && isRead && (
            <span className="ml-1 text-gold opacity-60">✓</span>
          )}
        </span>
      </div>

      {/* Delete button */}
      {canDelete && (hovered || delConfirm) && (
        <button
          onClick={handleDelete}
          className={cn(
            'flex-shrink-0 p-1.5 transition-all duration-200 self-center',
            delConfirm
              ? 'text-red-400 bg-red-400/10 border border-red-400/30'
              : 'text-text-muted hover:text-red-400 hover:bg-surface-3'
          )}
          title={delConfirm ? 'Click again to confirm deletion' : 'Delete message'}
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  );
}

// ─── File Preview ─────────────────────────────────────────────────────────────
function FilePreview({ file }: { file: NonNullable<Message['files']>[number] }) {
  const isImg = isImageFile(file.mimeType);

  if (isImg) {
    return (
      <div className="mb-2 border border-divider overflow-hidden max-w-[200px]">
        <img
          src={file.storageUrl}
          alt={file.originalName}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <div className="px-2 py-1 flex items-center justify-between gap-2 bg-black/50">
          <span className="text-[0.6rem] text-text-muted truncate">{file.originalName}</span>
          <a href={file.storageUrl} download className="text-gold hover:text-gold-light">
            <Download size={10} />
          </a>
        </div>
      </div>
    );
  }

  const isPdf = file.mimeType.includes('pdf');

  return (
    <div className="mb-2 flex items-center gap-2 p-2 border border-divider bg-surface-3 hover:border-gold-faint transition-colors max-w-[220px]">
      <div className="w-7 h-7 border border-divider flex items-center justify-center flex-shrink-0">
        <FileText size={12} className={isPdf ? 'text-red-400' : 'text-blue-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] text-text-primary truncate">{file.originalName}</p>
        <p className="text-[0.55rem] text-text-muted">{formatFileSize(file.fileSizeBytes)}</p>
      </div>
      <a
        href={file.storageUrl}
        download
        className="text-text-muted hover:text-gold transition-colors flex-shrink-0"
      >
        <Download size={12} />
      </a>
    </div>
  );
}