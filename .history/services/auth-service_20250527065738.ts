import { User } from '@/types/user'
import { API_URL, getHeaders, handleApiError } from './api-config'

// Interface para resposta de login
interface LoginResponse {
  user: User
  accessToken: string
}

// Interface para resposta de refresh
interface RefreshResponse {
  user: User
  accessToken: string
}

// Armazenamento seguro do token (em produção, considere usar um state manager mais robusto)
let currentAccessToken: string | null = null

export function setAccessToken(token: string | null) {
  currentAccessToken = token
}

export function getAccessToken(): string | null {
  return currentAccessToken
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    // Usar API real com JWT
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data: LoginResponse = await response.json()
    
    // Armazenar token para uso futuro
    setAccessToken(data.accessToken)
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw handleApiError(error)
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    // Usar API real com JWT
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data: LoginResponse = await response.json()
    
    // Armazenar token para uso futuro
    setAccessToken(data.accessToken)
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw handleApiError(error)
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const token = getAccessToken()
    
    if (!token) {
      throw new Error('Token de acesso não disponível')
    }

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getHeaders(token),
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, tentar renovar
        const refreshResult = await refreshAccessToken()
        if (refreshResult) {
          // Tentar novamente com o novo token
          const retryResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: getHeaders(refreshResult.accessToken),
          })
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            return retryData.user
          }
        }
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw handleApiError(error)
  }
}

export async function refreshAccessToken(): Promise<RefreshResponse | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: getHeaders(),
    })

    if (!response.ok) {
      // Se refresh falhar, significa que o usuário precisa fazer login novamente
      setAccessToken(null)
      return null
    }

    const data: RefreshResponse = await response.json()
    
    // Atualizar token
    setAccessToken(data.accessToken)
    
    return data
  } catch (error) {
    setAccessToken(null)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  try {
    // Fazer logout no servidor para limpar refresh token
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(),
    })
  } catch (error) {
    // Mesmo se falhar no servidor, limpar estado local
    console.error('Erro no logout:', error)
  } finally {
    // Sempre limpar token local
    setAccessToken(null)
  }
}

// Funções de simulação para facilitar o desenvolvimento
// (remover estas funções em produção)

function simulateLogin(email: string): User {
  let role: User['role'] = 'client'
  if (email.includes('admin')) {
    role = 'admin'
  } else if (email.includes('editor')) {
    role = 'editor'
  }
  return {
    id: email.includes('admin')
      ? 'user_admin_1'
      : email.includes('editor')
        ? 'user_editor_1'
        : 'user_client_1',
    name: email.split('@')[0],
    email,
    role,
    avatar: '/placeholder-user.jpg',
    color: '#48BB78',
  }
}

function simulateRegister(name: string, email: string): User {
  let role: User['role'] = 'client'
  if (email.includes('admin')) {
    role = 'admin'
  } else if (email.includes('editor')) {
    role = 'editor'
  }
  return {
    id: email.includes('admin')
      ? 'user_admin_1'
      : email.includes('editor')
        ? 'user_editor_1'
        : 'user_client_1',
    name,
    email,
    role,
    avatar: '/placeholder-user.jpg',
    color: '#4299E1',
  }
}

function simulateGetCurrentUser(): User {
  // Simulação básica de obtenção do usuário atual para desenvolvimento
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: 'Usuário de Teste',
    email: 'teste@example.com',
    role: 'editor',
    avatar: '/placeholder-user.jpg',
    color: getRandomColor(),
  }
}

function getRandomColor(): string {
  const colors = [
    '#4299E1',
    '#48BB78',
    '#F56565',
    '#ED8936',
    '#9F7AEA',
    '#667EEA',
    '#ED64A6',
    '#38B2AC',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
