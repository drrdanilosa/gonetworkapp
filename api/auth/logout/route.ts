import { NextRequest, NextResponse } from 'next/server'

// Configuração para export estático
export const dynamic = "force-static"


export async function POST(_request: NextRequest) {
  try {
    // Remover cookie do refresh token
    const response = NextResponse.json({
      message: 'Logout realizado com sucesso',
    })

    response.cookies.delete('refreshToken')

    return response
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
