import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/events',
  '/profile',
  '/admin',
  '/api/events',
  '/api/briefings',
  '/api/exports',
]

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
]

// Rotas que requerem roles específicas
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/api/admin': ['admin'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a arquivos estáticos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Obter token do cabeçalho Authorization ou cookie
  let token: string | undefined

  // Tentar obter do cabeçalho Authorization primeiro
  const authorization = request.headers.get('Authorization')
  if (authorization?.startsWith('Bearer ')) {
    token = authorization.substring(7)
  }

  // Se não encontrar no cabeçalho, tentar obter de um cookie de sessão
  if (!token) {
    // Para requisições de browser, você pode implementar uma lógica diferente
    // Por enquanto, vamos redirecionar para login se não houver token
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verificar e decodificar o token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Verificar se a rota requer uma role específica
    const requiredRoles = roleBasedRoutes[pathname]
    if (requiredRoles && !requiredRoles.includes(payload.role as string)) {
      return new NextResponse('Acesso negado', { status: 403 })
    }

    // Adicionar informações do usuário aos headers para uso nas API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-user-email', payload.email as string)
    requestHeaders.set('x-user-role', payload.role as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Erro de autenticação no middleware:', error)
    
    // Token inválido ou expirado
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Token inválido', { status: 401 })
    }

    // Para rotas de página, redirecionar para login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
