import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { User } from '@/types/user'
import { RegisterRequest } from '@/types/api'

// Simulação de banco de dados de usuários (em produção, use um banco real)
const users: Array<User & { password: string }> = [
  {
    id: 'user_admin_1',
    name: 'Admin',
    email: 'admin@gonetwork.ai',
    role: 'admin',
    avatar: '/placeholder-user.jpg',
    color: '#4299E1',
    password: '$2a$10$9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9e9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9O',
  },
]

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key'
)

function generateUserId(email: string): string {
  const prefix = email.includes('admin')
    ? 'user_admin_'
    : email.includes('editor')
      ? 'user_editor_'
      : 'user_client_'

  return prefix + Math.random().toString(36).substr(2, 9)
}

function getUserRole(email: string): User['role'] {
  if (email.includes('admin')) return 'admin'
  if (email.includes('editor')) return 'editor'
  return 'client'
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

    const { name, email, password } = body as RegisterRequest

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 409 }
      )
    }

    // Hash da senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar novo usuário
    const newUser: User & { password: string } = {
      id: generateUserId(email),
      name,
      email,
      role: getUserRole(email),
      avatar: '/placeholder-user.jpg',
      color: getRandomColor(),
      password: hashedPassword,
    }

    // Adicionar à simulação de banco
    users.push(newUser)

    // Gerar tokens
    const { accessToken, refreshToken } = await generateTokens(newUser)

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = newUser

    // Configurar cookie httpOnly para refresh token
    const response = NextResponse.json({
      user: userWithoutPassword,
      accessToken,
      message: 'Usuário registrado com sucesso',
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
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
