import { _User } from '@/types/user'
import { getHeaders, handleApiError } from './api-config'

// Interface para resposta de login
interface LoginResponse {
  user: _User
  accessToken: string
}

// Interface para resposta de refresh
interface RefreshResponse {
  user: _User
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
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
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
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
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

export async function getCurrentUser(): Promise<_User> {
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
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json() as { user: _User }
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

// Função auxiliar para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função auxiliar para validar senha
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}
