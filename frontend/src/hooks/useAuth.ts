'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';

export function useAuth() {
  const store = useAuthStore();
  const resetChat = useChatStore(s => s.reset);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch { /* ignore network errors */ }
    disconnectSocket();
    resetChat();
    store.clearAuth();
    toast.success('Signed out');
  }, [store, resetChat]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.me();
      store.setUser(data.data);
    } catch {
      store.clearAuth();
    }
  }, [store]);

  return {
    user:        store.user,
    accessToken: store.accessToken,
    isLoggedIn:  !!store.user,
    isAdmin:     store.user?.role === 'admin',
    logout,
    refreshUser,
  };
}
