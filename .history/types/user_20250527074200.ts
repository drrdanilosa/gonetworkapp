export interface _User {
  id: string
  name: string
  email: string
  role: 'editor' | 'client' | 'admin'
  avatar?: string
  color?: string
  permissions?: string[]
}

// Adicionar alias para compatibilidade
export type User = _User

export interface AuthState {
  user: Partial<User> | null
  isAuthenticated: boolean
  isLoading: boolean
}
