export default function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 flex-shrink-0 border border-divider flex items-center justify-center self-end">
        <span className="font-serif text-[0.55rem] text-gold">{name?.[0] ?? '?'}</span>
      </div>
      <div className="message-bubble incoming flex items-center gap-1.5 py-3 px-4">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
