import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { User } from '@/types/user'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Simulação de banco de dados de usuários
const users: Array<User> = [
  {
    id: 'user_admin_1',
    name: 'Admin',
    email: 'admin@gonetwork.ai',
    role: 'admin',
    avatar: '/placeholder-user.jpg',
    color: '#4299E1',
  },
  {
    id: 'user_editor_1',
    name: 'Editor',
    email: 'editor@gonetwork.ai',
    role: 'editor',
    avatar: '/placeholder-user.jpg',
    color: '#48BB78',
  },
  {
    id: 'user_client_1',
    name: 'Cliente',
    email: 'cliente@example.com',
    role: 'client',
    avatar: '/placeholder-user.jpg',
    color: '#F56565',
  },
]

export async function GET(request: NextRequest) {
  try {
    // Obter token do cabeçalho Authorization
    const authorization = request.headers.get('Authorization')
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização não fornecido' },
        { status: 401 }
      )
    }

    const token = authorization.substring(7) // Remove "Bearer "

    // Verificar e decodificar o token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Buscar usuário no "banco de dados"
    const user = users.find(u => u.id === payload.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    
    // Verificar se é erro de token expirado
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}
