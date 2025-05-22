import { User } from '@/types/user'
import { API_URL, getHeaders, handleApiError } from './api-config'

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  try {
    // Simulação de login (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateLogin(email)

    // Código de produção para login real
    /*
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return data.user;
    */
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  try {
    // Simulação de registro (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateRegister(name, email)

    // Código de produção para registro real
    /*
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return data.user;
    */
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getCurrentUser(token: string): Promise<User> {
  try {
    // Simulação de obtenção do usuário atual (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateGetCurrentUser()

    // Código de produção para obter usuário atual real
    /*
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return data.user;
    */
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function logoutUser(token: string): Promise<void> {
  try {
    // Simulação de logout (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    // Código de produção para logout real
    /*
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw response;
    }
    */

    return
  } catch (error) {
    throw handleApiError(error)
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
