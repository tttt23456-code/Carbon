import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  locale: string;
  timezone: string;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface AuthState {
  user: User | null;
  currentOrganization: User['memberships'][0]['organization'] | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setCurrentOrganization: (org: User['memberships'][0]['organization']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentOrganization: null,
      isAuthenticated: false,

      setAuth: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          currentOrganization: user.memberships[0]?.organization || null,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          currentOrganization: null,
          isAuthenticated: false,
        });
      },

      setCurrentOrganization: (org: User['memberships'][0]['organization']) => {
        set({ currentOrganization: org });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        currentOrganization: state.currentOrganization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);