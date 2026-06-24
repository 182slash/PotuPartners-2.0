// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'associate' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
  title: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  clientId: string;
  participantId: string | null;
  isAiChat: boolean;
  roomKey: string;
  lastMessageAt: string | null;
  createdAt: string;
  participant?: User;       // populated join
  client?: User;            // populated join
  lastMessage?: Message;    // populated
  unreadCount?: number;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'file' | 'ai_response';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string | null;
  messageType: MessageType;
  isRead: boolean;
  deletedAt: string | null;
  createdAt: string;
  sender?: User;
  files?: FileAttachment[];
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface FileAttachment {
  id: string;
  messageId: string | null;
  conversationId: string;
  uploaderId: string | null;
  originalName: string;
  storageKey: string;
  storageUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

// ─── RAG / Admin ──────────────────────────────────────────────────────────────

export interface RagDocument {
  id: string;
  title: string;
  description: string | null;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number | null;
  indexed: boolean;
  indexedAt: string | null;
  chunkCount: number | null;
  uploadedBy: string | null;
  createdAt: string;
  uploader?: User;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

export interface SocketMessagePayload {
  conversationId: string;
  content?: string;
  fileId?: string;
}

export interface SocketTypingPayload {
  conversationId: string;
}

export interface SocketMarkReadPayload {
  conversationId: string;
}

export interface SocketDeleteMessagePayload {
  messageId: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Chat UI State ────────────────────────────────────────────────────────────

export interface TypingState {
  [conversationId: string]: {
    userId: string;
    userName: string;
  }[];
}

// ─── Staff (for contact selector) ────────────────────────────────────────────

export interface StaffMember {
  id: string;
  fullName: string;
  displayName: string;
  role: 'associate' | 'partner';
  title: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  specialty?: string;
}

// ─── Partners (public profile) ────────────────────────────────────────────────

export interface Partner {
  id: string;
  fullName: string;
  title: string;
  specialty: string;
  avatarUrl: string | null;
  bio: string;
  linkedinUrl?: string;
}

// ─── Services section ─────────────────────────────────────────────────────────

export interface LegalService {
  id: string;
  icon: string;
  title: string;
  description: string;
  areas: string[];
}
