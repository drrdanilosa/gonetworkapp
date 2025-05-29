import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
} from '@/services/auth-service'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'client' | 'viewer'
  avatar?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateUserRole: (role: User['role']) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginUser(email, password)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro no login'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await registerUser(name, email, password)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro no registro'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await logoutUser()
        } catch (error) {
          console.error('Erro no logout:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      loadUser: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await getCurrentUser()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Se falhar, tentar renovar token
          const refreshSuccess = await get().refreshToken()
          if (!refreshSuccess) {
            set({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: 'Sessão expirada',
            })
          }
        }
      },

      refreshToken: async () => {
        try {
          const response = await refreshAccessToken()
          if (response) {
            set({
              user: response.user,
              isAuthenticated: true,
              error: null,
            })
            return true
          }
          return false
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            error: 'Falha ao renovar sessão',
          })
          return false
        }
      },

      updateUserRole: (role: User['role']) =>
        set(state => ({
          user: state.user ? { ...state.user, role } : null,
        })),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      // Não persistir tokens sensíveis no localStorage
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
