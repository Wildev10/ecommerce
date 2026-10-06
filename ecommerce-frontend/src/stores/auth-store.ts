import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

// Sync token + role into cookies so Next.js middleware can read them server-side
function setCookies(token: string, role: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7; // 7 jours
  document.cookie = `__auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `__auth_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = '__auth_token=; path=/; max-age=0';
  document.cookie = '__auth_role=; path=/; max-age=0';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        setCookies(token, user.role ?? 'buyer');
        return set({ user, token, isAuthenticated: true });
      },

      setUser: (user) => {
        // Remet à jour le rôle en cookie sans changer le token
        const stored = typeof localStorage !== 'undefined'
          ? (() => { try { const s = localStorage.getItem('auth-storage'); return s ? JSON.parse(s) : null; } catch { return null; } })()
          : null;
        const token = stored?.state?.token;
        if (token) setCookies(token, user.role ?? 'buyer');
        return set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearCookies();
        return set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // clé localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
