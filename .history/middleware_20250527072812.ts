import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a arquivos estáticos e recursos do Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/', '/login', '/register']

  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Para outras rotas, permitir acesso por enquanto (simplificado)
  // TODO: Implementar verificação de autenticação completa
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
