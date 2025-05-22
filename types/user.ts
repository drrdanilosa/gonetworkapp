export interface User {
  id: string
  name: string
  email: string
  role: 'editor' | 'client' | 'admin'
  avatar?: string
  color?: string
  permissions?: string[]
}

export interface AuthState {
  user: Partial<User> | null
  isAuthenticated: boolean
  isLoading: boolean
}
