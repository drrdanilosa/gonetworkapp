import { NextResponse } from 'next/server'

// Simulação de banco de dados - em ambiente real, isso estaria em um banco de dados
const mockEvents: Record<string, any> = {
  '123': {
    id: '123',
    name: 'Congresso de Tecnologia 2025',
    date: '2025-05-30',
    time: '14:00',
    location: 'Centro de Eventos XYZ',
    status: 'confirmado',
    client: 'Empresa ABC',
    type: 'conferência',
    description: 'Grande evento de tecnologia com palestrantes internacionais',
  },
  '456': {
    id: '456',
    name: 'Workshop de Marketing Digital',
    date: '2025-06-15',
    time: '09:00',
    location: 'Hotel Premium',
    status: 'planejamento',
    client: 'Agência XYZ',
    type: 'workshop',
    description:
      'Workshop intensivo com foco em estratégias de marketing digital',
  },
}

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    // Verifica se o eventId é válido
    const eventId = context.params?.eventId
    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Buscar dados - em um ambiente real, isso viria do banco de dados
    const event = mockEvents[eventId]

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}
