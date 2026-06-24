├── messages: Record<string, Message[]>  Messages keyed by conversationId
├── typingUsers: TypingState             Who is typing per conversation
└── unreadCounts: Record<string, number>

Actions: openChat, closeChat, setStep, setActiveConversation,
         addMessage, deleteMessage, setTyping, clearTyping, etc.
```

---

## Component Guide

### `<Navbar>`

Reads scroll position to toggle background opacity. Detects active section by checking `getBoundingClientRect().top`. Dispatches `open-chat` custom event when CTA clicked.

### `<HeroSection>`

Four-phase animation state machine (0–3):
- Phase 0: invisible
- Phase 1: letters animate in (70ms stagger per character)
- Phase 2: gold line draws left-to-right
- Phase 3: tagline + buttons fade up

### `<ChatPanel>`

The chat system is fully decoupled from the page via a custom DOM event `open-chat`. Any component (Navbar, Services CTA, etc.) can trigger `window.dispatchEvent(new CustomEvent('open-chat'))` and the panel will open.

### `<MessageBubble>`

Delete behaviour: first click shows red icon, second click within 3 seconds confirms deletion. After 3 seconds of inactivity, resets to normal hover state.

### `<ChatWindow>`

Textarea auto-resizes as user types (up to 120px). Enter sends message; Shift+Enter creates new line.

---

*Phase 2 Frontend · PotuPartners*
