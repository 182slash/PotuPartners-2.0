import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user:        User | null;
  accessToken: string | null;
  isLoading:   boolean;

  setUser:        (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth:      () => void;
  setLoading:     (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      setUser:        (user)   => set({ user }),
      setAccessToken: (token)  => set({ accessToken: token }),
      clearAuth:      ()       => set({ user: null, accessToken: null }),
      setLoading:     (v)      => set({ isLoading: v }),
    }),
    {
      name:    'potu-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
);
