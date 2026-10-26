import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, UserProfile } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: () => boolean;
  hasRole: (...roles: Role[]) => boolean;
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,
      hasRole: (...roles: Role[]) => {
        const r = get().user?.vaiTro;
        return !!r && roles.includes(r);
      },
      setAuth: (token: string, user: UserProfile) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'hrm-auth' }
  )
);
