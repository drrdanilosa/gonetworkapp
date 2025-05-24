import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  login: (user: User) => void
  logout: () => void
  updateUserRole: (role: User['role']) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUserRole: (role: User['role']) =>
        set(state => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
)
