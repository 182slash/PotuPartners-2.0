// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'client' | 'associate' | 'partner' | 'admin';

export interface DBUser {
  id:           string;
  email:        string;
  password_hash: string;
  full_name:    string;
  display_name: string | null;
  role:         UserRole;
  avatar_url:   string | null;
  title:        string | null;
  bio:          string | null;
  specialty:    string | null;
  linkedin_url: string | null;
  is_online:    boolean;
  last_seen:    Date | null;
  is_active:    boolean;
  created_at:   Date;
  updated_at:   Date;
}

export interface PublicUser {
  id:          string;
  email:       string;
  fullName:    string;
  displayName: string | null;
  role:        UserRole;
  avatarUrl:   string | null;
  title:       string | null;
  bio:         string | null;
  specialty:   string | null;
  linkedinUrl: string | null;
  isOnline:    boolean;
  lastSeen:    Date | null;
  createdAt:   Date;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub:   string;   // user id
  role:  UserRole;
  email: string;
  iat?:  number;
  exp?:  number;
}

export interface RefreshTokenRow {
  id:         string;
  user_id:    string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

// ─── Request augmentation ─────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Conversations ────────────────────────────────────────────────────────────
export interface DBConversation {
  id:             string;
  client_id:      string;
  participant_id: string | null;
  is_ai_chat:     boolean;
  room_key:       string;
  last_message_at: Date | null;
  created_at:     Date;
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export type MessageType = 'text' | 'file' | 'ai_response';

export interface DBMessage {
  id:              string;
  conversation_id: string;
  sender_id:       string | null;
  content:         string | null;
  message_type:    MessageType;
  is_read:         boolean;
  deleted_at:      Date | null;
  created_at:      Date;
}

// ─── Files ────────────────────────────────────────────────────────────────────
export interface DBFile {
  id:              string;
  message_id:      string | null;
  conversation_id: string;
  uploader_id:     string | null;
  original_name:   string;
  storage_key:     string;
  storage_url:     string;
  mime_type:       string;
  file_size_bytes: number;
  created_at:      Date;
}

// ─── RAG Documents ────────────────────────────────────────────────────────────
export interface DBRagDocument {
  id:              string;
  title:           string;
  description:     string | null;
  storage_key:     string;
  mime_type:       string;
  file_size_bytes: number | null;
  indexed:         boolean;
  indexed_at:      Date | null;
  chunk_count:     number | null;
  uploaded_by:     string | null;
  created_at:      Date;
  updated_at:      Date;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data:    T[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}
