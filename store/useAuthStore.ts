import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types/user';

interface AuthStore extends AuthState {
  user: Partial<User> | null; // Permitir valores opcionais para resolver o erro
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Usando uma versão modificada para evitar problemas de atualização infinita com React 19
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user) => {
        set(() => ({ user, isAuthenticated: true }));
      },
      logout: () => {
        set(() => ({ user: null, isAuthenticated: false }));
      },
      updateUser: (user) => {
        set((state) => ({ user: { ...state.user, ...user } }));
      }
    }),
    {
      name: 'auth-storage',
      // Configuração para melhorar compatibilidade e performance
      skipHydration: true,
    }
  )
);
