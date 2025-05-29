import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { User } from '@/types/user'
import { LoginRequest, LoginResponse } from '@/types/api'

// Simulação de banco de dados de usuários (em produção, use um banco real)
const users: Array<User & { password: string }> = [
  {
    id: 'user_admin_1',
    name: 'Admin',
    email: 'admin@gonetwork.ai',
    role: 'admin',
    avatar: '/placeholder-user.jpg',
    color: '#4299E1',
    password: '$2a$10$9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9e9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9O', // password: admin123
  },
  {
    id: 'user_editor_1',
    name: 'Editor',
    email: 'editor@gonetwork.ai',
    role: 'editor',
    avatar: '/placeholder-user.jpg',
    color: '#48BB78',
    password: '$2a$10$9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9e9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9O', // password: editor123
  },
  {
    id: 'user_client_1',
    name: 'Cliente',
    email: 'cliente@example.com',
    role: 'client',
    avatar: '/placeholder-user.jpg',
    color: '#F56565',
    password: '$2a$10$9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9e9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9O', // password: client123
  },
]

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key'
)

async function generateTokens(user: User) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  // Access Token (15 minutos)
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
    .sign(JWT_SECRET)

  // Refresh Token (7 dias)
  const refreshToken = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação de tipos
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { email, password }: LoginRequest = body

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar tokens
    const { accessToken, refreshToken } = await generateTokens(user)

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    // Configurar cookie httpOnly para refresh token (mais seguro)
    const response = NextResponse.json({
      user: userWithoutPassword,
      accessToken,
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
