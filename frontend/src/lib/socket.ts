import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'https://api.potupartners.site';

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      autoConnect:          false,
      transports:           ['websocket', 'polling'],
      auth:                 { token: accessToken },
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getExistingSocket(): Socket | null {
  return socket;
}

export const SocketEvents = {
  // Emit
  JOIN_CONVERSATION:   'join_conversation',
  SEND_MESSAGE:        'send_message',
  DELETE_MESSAGE:      'delete_message',
  TYPING_START:        'typing_start',
  TYPING_STOP:         'typing_stop',
  MARK_READ:           'mark_read',

  // Listen
  CONVERSATION_JOINED: 'conversation_joined',
  NEW_MESSAGE:         'new_message',
  MESSAGE_DELETED:     'message_deleted',
  USER_TYPING:         'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  AI_THINKING:         'ai_thinking',
  AI_RESPONSE:         'ai_response',
  USER_ONLINE:         'user_online',
  USER_OFFLINE:        'user_offline',
  ERROR:               'error',
} as const;