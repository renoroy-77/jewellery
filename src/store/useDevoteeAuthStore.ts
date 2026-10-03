import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DevoteeUserProfile } from '@/services/devoteeAuthService';

export interface DevoteeAuthStoreState {
  user: DevoteeUserProfile | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setSession: (user: DevoteeUserProfile, token: string) => void;
  clearSession: () => void;
  updateUser: (updates: Partial<DevoteeUserProfile>) => void;
}

export const useDevoteeAuthStore = create<DevoteeAuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setSession: (user: DevoteeUserProfile, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('aamadappetti_auth_change'));
        }
      },

      clearSession: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('aamadappetti_auth_change'));
        }
      },

      updateUser: (updates: Partial<DevoteeUserProfile>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'aamadappetti_devotee_zustand',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
