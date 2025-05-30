import { NextRequest, NextResponse } from 'next/server'

// Configuração para export estático
export const dynamic = "force-static"

import { jwtVerify, SignJWT } from 'jose'

// Configuração para export estático
export const dynamic = "force-static"

import { User } from '@/types/user'

// Configuração para export estático
export const dynamic = "force-static"


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key'
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

async function generateAccessToken(user: User) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
    .sign(JWT_SECRET)
}

export async function POST(request: NextRequest) {
  try {
    // Obter refresh token do cookie
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }

    // Verificar e decodificar o refresh token
    const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET)

    // Buscar usuário no "banco de dados"
    const user = users.find(u => u.id === payload.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Gerar novo access token
    const newAccessToken = await generateAccessToken(user)

    return NextResponse.json({
      accessToken: newAccessToken,
      user,
    })
  } catch (error) {
    console.error('Erro ao renovar token:', error)

    // Verificar se é erro de token expirado
    if (error instanceof Error && error.message.includes('expired')) {
      // Se refresh token expirou, remover cookie
      const response = NextResponse.json(
        { error: 'Refresh token expirado. Faça login novamente.' },
        { status: 401 }
      )

      response.cookies.delete('refreshToken')
      return response
    }

    return NextResponse.json(
      { error: 'Refresh token inválido' },
      { status: 401 }
    )
  }
}
